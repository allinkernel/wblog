// ==================== 配置方案管理模块 ====================
// 方案：默认（只读）/ 默认调整（写时复制自动生成）/ 用户1~3 / 外部文件方案
// 存储：localStorage 回退 + File System Access API 授权目录（JSON / YAML 文件）
// 特性：写时复制（CoW）、延迟创建、动态扫描、版本兼容校验、打开配置目录
//
// 触发写时保存的方式：monkey-patch localStorage.setItem —— 所有设置变更
// 最终都会写入散键（blog-* / font-* 等），拦截统一触发「保存当前方案」。

const ACTIVE_PROFILE_KEY = 'wblog-active-profile';
const LS_CONFIG_PREFIX = 'wblog-config-';   // localStorage 回退方案的键前缀
const IDB_HANDLE_KEY = 'wblog-config-dir-handle';
const BUILTIN_PROFILES = ['default', 'user1', 'user2', 'user3'];
const PROFILE_LABELS = { 'default': '默认', 'user1': '用户1', 'user2': '用户2', 'user3': '用户3' };

// 当前版本支持的设置键白名单（配置文件里的合法字段；其余视为废弃字段）
const SUPPORTED_KEYS = [
    'blog-reader-theme', 'last-light-theme', 'last-dark-theme', 'blog-theme-mode',
    'blog-code-format', 'blog-code-theme', 'blog-code-inline-theme',
    'blog-code-inline-offset', 'blog-code-inline-pad', 'blog-code-block-size',
    'blog-code-line-numbers', 'blog-code-header',
    'table-format', 'table-show-header', 'blog-quote-style',
    'blog-width', 'blog-size', 'blog-line', 'blog-pos', 'blog-ctext', 'blog-cbg',
    'font-heading-mono', 'font-heading-serif', 'font-heading-family',
    'font-body-mono', 'font-body-serif', 'font-body-family',
    'font-inline-code-mono', 'font-inline-code-serif', 'font-inline-code-family',
    'font-code-block-code-mono', 'font-code-block-code-serif', 'font-code-block-code-family',
    'font-code-block-comment-mono', 'font-code-block-comment-serif', 'font-code-block-comment-family',
    'font-link-mono', 'font-link-serif', 'font-link-family',
    'font-quote-mono', 'font-quote-serif', 'font-quote-family',
];

// 已知废弃键（旧版本遗留，加载时列出提示）
const DEPRECATED_KEYS = [
    'isDefaultMode',
    'matrix-font-heading', 'matrix-font-body', 'matrix-font-code', 'matrix-font-link', 'matrix-font-quote',
    'font-code-mono', 'font-code-serif', 'font-code-family',
    'font-code-block-mono', 'font-code-block-serif', 'font-code-block-family',
    'panel-config', 'panel-font', 'panel-style', 'panel-code-style', 'panel-table-style',
];

// 配置系统自身键前缀（写入这些键不触发方案保存，避免递归）
const SYSTEM_KEY_PREFIXES = ['wblog-', 'panel-', 'blog-bar'];

let configStore = null;       // { kind:'localStorage' } | { kind:'fs', handle }
let suppressSave = false;     // applyConfig/applyDefaultConfig 期间抑制写时保存
let saveTimer = null;
let externalProfiles = [];    // 扫描到的外部方案名（不含内置）

// ---------- 基础读写 ----------

function getActiveProfile() {
    const v = localStorage.getItem(ACTIVE_PROFILE_KEY);
    return v || 'user1';
}

function setActiveProfile(name) {
    localStorage.setItem(ACTIVE_PROFILE_KEY, name);
}

function isBuiltinProfile(name) {
    return BUILTIN_PROFILES.includes(name);
}

// 方案显示名（内置用中文标签；外部方案用文件名）
function profileLabel(name) {
    return PROFILE_LABELS[name] || name || '配置';
}

// 从散键收集当前配置（扁平键值，与配置文件格式一致）
function collectConfig() {
    const cfg = {};
    SUPPORTED_KEYS.forEach(k => {
        const v = localStorage.getItem(k);
        if (v !== null) cfg[k] = parseSettingValue(v);
    });
    return cfg;
}

// 尽力解析为数字/布尔，其余保持字符串
function parseSettingValue(v) {
    if (v === 'true') return true;
    if (v === 'false') return false;
    const n = Number(v);
    if (v !== '' && String(v).trim() !== '' && !isNaN(n) && String(n) === String(v).trim()) return n;
    return v;
}

// 把扁平配置写回散键并刷新 UI（suppressSave 防止触发 CoW）
function applyConfig(cfg) {
    if (!cfg) return;
    suppressSave = true;
    try {
        SUPPORTED_KEYS.forEach(k => {
            if (k in cfg) localStorage.setItem(k, String(cfg[k]));
        });
    } finally {
        suppressSave = false;
    }
    restoreSavedSettings();
}

// ---------- 版本兼容校验（需求 6） ----------

function validateConfig(cfg) {
    const keys = Object.keys(cfg || {});
    const supported = {};
    const deprecated = [];
    keys.forEach(k => {
        if (SUPPORTED_KEYS.includes(k)) {
            supported[k] = cfg[k];
        } else if (DEPRECATED_KEYS.includes(k) || k.startsWith('table-format-override-')) {
            deprecated.push(k);
        } else {
            deprecated.push(k); // 未知字段按废弃处理
        }
    });
    return { supported, deprecated };
}

function showDeprecatedModal(fields) {
    const modal = document.getElementById('config-deprecated-modal');
    const list = document.getElementById('config-deprecated-list');
    if (!modal || !list) return;
    list.innerHTML = '';
    fields.forEach(k => {
        const li = document.createElement('li');
        li.textContent = k;
        list.appendChild(li);
    });
    modal.hidden = false;
    const ok = document.getElementById('config-deprecated-ok');
    if (ok) {
        ok.onclick = () => { modal.hidden = true; };
    }
}

// ---------- 存储后端：localStorage 回退 ----------

function lsProfileKey(name) {
    return LS_CONFIG_PREFIX + name;
}

function lsRead(name) {
    try {
        return localStorage.getItem(lsProfileKey(name));
    } catch (e) { return null; }
}

function lsWrite(name, text) {
    try {
        localStorage.setItem(lsProfileKey(name), text);
    } catch (e) { /* 配额不足忽略 */ }
}

function lsDelete(name) {
    try {
        localStorage.removeItem(lsProfileKey(name));
    } catch (e) { /* 忽略 */ }
}

// ---------- 存储后端：File System Access API（需求 4/5） ----------

function fsSupported() {
    return typeof window.showDirectoryPicker === 'function' && window.isSecureContext !== false;
}

// IndexedDB 保存/读取目录句柄（单例连接）
let idbDb = null;
function idbOpen() {
    if (idbDb) return Promise.resolve(idbDb);
    return new Promise((resolve) => {
        if (!window.indexedDB) return resolve(null);
        const req = window.indexedDB.open('wblog-config-store', 1);
        req.onupgradeneeded = () => { req.result.createObjectStore('kv'); };
        req.onsuccess = () => { idbDb = req.result; resolve(idbDb); };
        req.onerror = () => resolve(null);
    });
}
function idbGet(key) {
    return idbOpen().then(db => new Promise((resolve) => {
        if (!db) return resolve(null);
        const tx = db.transaction('kv', 'readonly');
        const req = tx.objectStore('kv').get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
    }));
}
function idbPut(key, val) {
    return idbOpen().then(db => new Promise((resolve) => {
        if (!db) return resolve(false);
        const tx = db.transaction('kv', 'readwrite');
        tx.objectStore('kv').put(val, key);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
    }));
}

async function getSavedDirHandle() {
    try {
        return await idbGet(IDB_HANDLE_KEY);
    } catch (e) { return null; }
}

async function requestDirAccess() {
    // 已有句柄 → 请求读写权限；否则弹出目录选择器
    let handle = await getSavedDirHandle();
    if (handle) {
        try {
            const perm = await handle.requestPermission({ mode: 'readwrite' });
            if (perm === 'granted') return handle;
        } catch (e) { /* 重新选择 */ }
    }
    if (!window.showDirectoryPicker) return null;
    handle = await window.showDirectoryPicker({ mode: 'readwrite' });
    await idbPut(IDB_HANDLE_KEY, handle);
    return handle;
}

async function fsListFiles(handle) {
    const out = [];
    if (!handle || typeof handle.entries !== 'function') return out;
    for await (const [name, h] of handle.entries()) {
        if (h.kind === 'file' && /\.(json|ya?ml)$/i.test(name)) out.push(name);
    }
    return out.sort();
}

async function fsReadFile(handle, name) {
    try {
        const fh = await handle.getFileHandle(name);
        const f = await fh.getFile();
        return await f.text();
    } catch (e) { return null; }
}

async function fsWriteFile(handle, name, text) {
    try {
        const fh = await handle.getFileHandle(name, { create: true });
        const w = await fh.createWritable();
        await w.write(text);
        await w.close();
        return true;
    } catch (e) { return false; }
}

async function fsDeleteFile(handle, name) {
    try {
        await handle.removeEntry(name);
        return true;
    } catch (e) { return false; }
}

// ---------- 方案读写（统一入口） ----------

function profileExists(name) {
    if (name === 'default') return true;
    if (externalProfiles.includes(name)) return true;
    return lsRead(name) !== null;
}

function readProfile(name) {
    if (name === 'default') return null;
    const ls = lsRead(name);
    if (ls) {
        try { return JSON.parse(ls); } catch (e) { return null; }
    }
    return null;
}

function writeProfile(name, cfg) {
    if (name === 'default') return; // 默认只读
    const text = JSON.stringify(cfg, null, 2);
    lsWrite(name, text);
    if (configStore && configStore.kind === 'fs' && configStore.handle) {
        fsWriteFile(configStore.handle, `${name}.json`, text);
    }
    if (!externalProfiles.includes(name) && !BUILTIN_PROFILES.includes(name) && name !== '默认调整') {
        externalProfiles.push(name);
    }
}

function deleteProfile(name) {
    if (name === 'default') return;
    lsDelete(name);
    if (configStore && configStore.kind === 'fs' && configStore.handle) {
        fsDeleteFile(configStore.handle, `${name}.json`);
    }
    const idx = externalProfiles.indexOf(name);
    if (idx >= 0) externalProfiles.splice(idx, 1);
}

// ---------- 方案切换与加载 ----------

function switchProfile(name) {
    const old = getActiveProfile();
    if (old === name) {
        closeProfileDrawer();
        return;
    }
    if (old !== 'default') writeProfile(old, collectConfig());
    setActiveProfile(name);
    loadProfile(name);
    renderProfileUI();
    closeProfileDrawer();
}

function loadProfile(name) {
    if (name === 'default') {
        applyDefaultConfig();
        return;
    }
    // 已存在 → 加载并校验（需求 2.3 / 6）；不存在 → 按默认呈现（需求 2.1）
    const cfg = readProfile(name);
    if (cfg) {
        const { supported, deprecated } = validateConfig(cfg);
        applyConfig(supported);
        if (deprecated.length) showDeprecatedModal(deprecated);
    } else {
        applyDefaultConfig();
    }
}

// ---------- 写时保存（CoW + 延迟创建） ----------

function isSystemKey(key) {
    return SYSTEM_KEY_PREFIXES.some(p => String(key).startsWith(p));
}

function scheduleProfileSave() {
    if (suppressSave) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
        const active = getActiveProfile();
        if (active === 'default') {
            // 写时复制（需求 1）：删除旧「默认调整」→ 保存当前 → 激活「默认调整」
            deleteProfile('默认调整');
            const cfg = collectConfig();
            writeProfile('默认调整', cfg);
            setActiveProfile('默认调整');
            renderProfileUI();
        } else {
            // 延迟创建（需求 2.2）：不存在也直接写，自动生成
            writeProfile(active, collectConfig());
        }
    }, 300);
}

// ---------- 配置目录扫描（需求 5） ----------

async function scanConfigDir() {
    if (!configStore || configStore.kind !== 'fs' || !configStore.handle) return 0;
    const files = await fsListFiles(configStore.handle);
    const names = files.map(f => f.replace(/\.(json|ya?ml)$/i, ''));
    // 合并：内置 + 默认调整 + 外部文件方案
    const ext = names.filter(n => !BUILTIN_PROFILES.includes(n) && n !== '默认调整' && n !== getActiveProfile());
    externalProfiles = ext;
    // 外部文件方案若无本地回退 → 读文件内容存入 localStorage 缓存
    for (const n of names) {
        if (lsRead(n) === null) {
            const text = await fsReadFile(configStore.handle, files.find(f => f.startsWith(n + '.')));
            if (text) lsWrite(n, text);
        }
    }
    renderProfileUI();
    return files.length;
}

// 打开配置目录（需求 4）：
// 已连接目录 → 重授权后直接打开「目录文件列表」弹窗（查看/管理文件）；
// 未连接/权限失效 → 弹目录选择器（id 记忆上次目录）→ 连接 → 打开弹窗。
async function openConfigDir() {
    const head = document.getElementById('profile-drawer-head');
    if (!fsSupported()) {
        if (head) head.textContent = '当前浏览器不支持文件系统访问（需 Chrome/Edge + HTTPS 或 localhost）';
        return;
    }
    // 1) 已有句柄 → 重新请求权限（已授权通常直接 granted）→ 打开目录弹窗
    const saved = await getSavedDirHandle();
    if (saved && typeof saved.requestPermission === 'function') {
        try {
            const perm = await saved.requestPermission({ mode: 'readwrite' });
            if (perm === 'granted') {
                configStore = { kind: 'fs', handle: saved };
                await scanConfigDir();
                if (head) head.textContent = `配置方案（已连接：${saved.name}）`;
                openDirModal();
                return;
            }
        } catch (e) { /* 授权异常则走选择器 */ }
    }
    // 2) 无句柄或授权失败 → 目录选择器（id 让 Chrome 记住并定位上次目录）
    try {
        const handle = await window.showDirectoryPicker({ mode: 'readwrite', id: 'wblog-config' });
        if (!handle) return;
        await idbPut(IDB_HANDLE_KEY, handle); // 记忆句柄
        configStore = { kind: 'fs', handle };
        writeProfile(getActiveProfile(), collectConfig()); // 连接即导出当前配置
        const fileCount = await scanConfigDir();
        if (head) head.textContent = `配置方案（已连接：${handle.name} · ${fileCount} 个配置文件）`;
        openDirModal();
    } catch (e) {
        // 用户取消选择
        if (head) head.textContent = '配置方案（点 📂 选择配置保存目录）';
    }
}

// 目录文件列表弹窗
async function openDirModal() {
    const modal = document.getElementById('config-dir-modal');
    if (!modal || !configStore || configStore.kind !== 'fs') return;
    const nameEl = document.getElementById('dir-modal-name');
    if (nameEl) nameEl.textContent = (configStore.handle && configStore.handle.name) || '配置目录';
    await renderDirFileList();
    modal.hidden = false;
}

async function renderDirFileList() {
    const list = document.getElementById('dir-file-list');
    if (!list) return;
    list.innerHTML = '';
    if (!configStore || configStore.kind !== 'fs' || !configStore.handle) {
        const li = document.createElement('li');
        li.className = 'dir-file-empty';
        li.textContent = '尚未连接配置目录';
        list.appendChild(li);
        return;
    }
    const files = await fsListFiles(configStore.handle);
    if (!files.length) {
        const li = document.createElement('li');
        li.className = 'dir-file-empty';
        li.textContent = '目录为空 — 修改任意设置后配置将自动保存到这里';
        list.appendChild(li);
        return;
    }
    for (const name of files) {
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.textContent = name;
        li.appendChild(span);
        try {
            const fh = await configStore.handle.getFileHandle(name);
            const f = await fh.getFile();
            const size = document.createElement('span');
            size.className = 'dir-file-size';
            size.textContent = f.size + ' B';
            li.appendChild(size);
        } catch (e) { /* 无法读取大小的文件忽略 */ }
        list.appendChild(li);
    }
}

function initDirModal() {
    const modal = document.getElementById('config-dir-modal');
    if (!modal) return;
    const refresh = document.getElementById('dir-refresh-btn');
    if (refresh) refresh.addEventListener('click', () => { scanConfigDir(); renderDirFileList(); });
    const change = document.getElementById('dir-change-btn');
    if (change) change.addEventListener('click', async () => {
        modal.hidden = true;
        try {
            const handle = await window.showDirectoryPicker({ mode: 'readwrite', id: 'wblog-config' });
            if (!handle) return;
            await idbPut(IDB_HANDLE_KEY, handle);
            configStore = { kind: 'fs', handle };
            await scanConfigDir();
            openDirModal();
        } catch (e) { /* 取消更换 */ }
    });
    const close = document.getElementById('dir-close-btn');
    if (close) close.addEventListener('click', () => { modal.hidden = true; });
}

// ---------- UI 渲染 ----------

function profileList() {
    const list = ['default'];
    if (profileExists('默认调整')) list.push('默认调整');
    BUILTIN_PROFILES.slice(1).forEach(p => list.push(p)); // user1~3
    externalProfiles.forEach(p => { if (!list.includes(p)) list.push(p); });
    return list;
}

function renderProfileUI() {
    const active = getActiveProfile();
    const label = document.getElementById('bar-profile-label');
    if (label) label.textContent = profileLabel(active);
    const cur = document.getElementById('profile-current-name');
    if (cur) cur.textContent = profileLabel(active);

    const listEl = document.getElementById('profile-list');
    if (!listEl) return;
    listEl.innerHTML = '';
    profileList().forEach(name => {
        const row = document.createElement('div');
        row.className = 'profile-item' + (name === active ? ' active' : '');
        row.dataset.profile = name;

        const left = document.createElement('div');
        left.className = 'profile-item-main';
        const nm = document.createElement('span');
        nm.className = 'profile-item-name';
        nm.textContent = profileLabel(name);
        left.appendChild(nm);
        if (name !== 'default') {
            const desc = document.createElement('span');
            desc.className = 'profile-item-desc';
            desc.textContent = profileExists(name) ? '已保存' : '出厂起点';
            left.appendChild(desc);
        } else {
            const desc = document.createElement('span');
            desc.className = 'profile-item-desc';
            desc.textContent = '只读出厂配置';
            left.appendChild(desc);
        }
        row.appendChild(left);

        const folder = document.createElement('button');
        folder.type = 'button';
        folder.className = 'profile-folder-btn';
        folder.title = '在文件管理器中打开配置目录';
        folder.textContent = '📂';
        folder.addEventListener('click', (e) => {
            e.stopPropagation();
            openConfigDir();
        });
        row.appendChild(folder);

        row.addEventListener('click', () => switchProfile(name));
        listEl.appendChild(row);
    });
}

function openProfileDrawer() {
    const drawer = document.getElementById('profile-drawer');
    if (!drawer) return;
    renderProfileUI();
    drawer.hidden = false;
}

function closeProfileDrawer() {
    const drawer = document.getElementById('profile-drawer');
    if (drawer) drawer.hidden = true;
}

function toggleProfileDrawer() {
    const drawer = document.getElementById('profile-drawer');
    if (!drawer) return;
    if (drawer.hidden) openProfileDrawer();
    else closeProfileDrawer();
}

function initProfileDrawer() {
    const drawer = document.getElementById('profile-drawer');
    if (!drawer) return;
    document.addEventListener('click', (e) => {
        if (drawer.hidden) return;
        const bar = document.getElementById('bottom-bar');
        if (bar && bar.contains(e.target)) return;
        closeProfileDrawer();
    });
}

// ---------- 模块初始化 ----------

function initConfigModule() {
    // 首次访问：默认激活 user1（以当前散键为起点）
    if (!localStorage.getItem(ACTIVE_PROFILE_KEY)) {
        setActiveProfile('user1');
    }
    // 页面初始化阶段的恢复写入（restoreSavedSettings 等）不触发写时保存（问题：点默认后不应立即生成默认调整）
    suppressSave = true;
    const releaseSave = () => { suppressSave = false; };
    if (document.readyState === 'complete') {
        setTimeout(releaseSave, 800);
    } else {
        window.addEventListener('load', () => setTimeout(releaseSave, 500), { once: true });
    }
    setTimeout(releaseSave, 3000); // 保险：最长 3s 后释放
    // 恢复文件后端（若此前授权过目录）
    if (fsSupported()) {
        getSavedDirHandle().then(h => {
            if (h) {
                configStore = { kind: 'fs', handle: h };
                scanConfigDir();
            }
        });
    }
    // 定期扫描配置目录（需求 5：目录变更自动更新列表）
    setInterval(() => {
        if (configStore && configStore.kind === 'fs') scanConfigDir();
    }, 30000);

    // monkey-patch Storage.prototype.setItem：所有设置写入统一触发写时保存
    // （jsdom/浏览器中实例属性赋值可能被忽略，需 patch 原型方法）
    try {
        const proto = Object.getPrototypeOf(localStorage);
        if (proto && !proto.__wblogProfilePatched) {
            const origSetItem = proto.setItem;
            proto.setItem = function (k, v) {
                origSetItem.call(this, k, v); // this 必须是 Storage 实例（WebIDL 校验）
                if (!isSystemKey(k)) scheduleProfileSave();
            };
            try {
                Object.defineProperty(proto, '__wblogProfilePatched', { value: true, writable: false });
            } catch (e) { /* 忽略 */ }
        }
    } catch (e) { /* 环境不允许 patch 则降级为切换时保存 */ }

    renderProfileUI();
    initProfileDrawer();
    initDirModal();
}

// ==================== 导出全局 ====================
window.initConfigModule = initConfigModule;
window.getActiveProfile = getActiveProfile;
window.switchProfile = switchProfile;
window.openProfileDrawer = openProfileDrawer;
window.closeProfileDrawer = closeProfileDrawer;
window.toggleProfileDrawer = toggleProfileDrawer;
window.renderProfileUI = renderProfileUI;
window.openConfigDir = openConfigDir;
window.scanConfigDir = scanConfigDir;
window.collectConfig = collectConfig;
window.applyConfig = applyConfig;
window.validateConfig = validateConfig;
window.openDirModal = openDirModal;
window.renderDirFileList = renderDirFileList;
window.profileExists = profileExists;
window.readProfile = readProfile;
window.writeProfile = writeProfile;
