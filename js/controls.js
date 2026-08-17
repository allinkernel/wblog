// ==================== 控件绑定与设置管理 ====================

// ==================== 动态字体配置（等宽/衬线开关 + 字体下拉） ====================

// 预置的跨平台常见系统字体库，按「等宽 / 衬线」两个维度分为四类
const FONT_LIBRARY = {
    'mono-sans': [
        { label: 'Consolas', stack: 'Consolas, monospace' },
        { label: 'Menlo', stack: 'Menlo, monospace' },
        { label: 'Monaco', stack: 'Monaco, monospace' },
        { label: 'DejaVu Sans Mono', stack: '"DejaVu Sans Mono", monospace' },
        { label: 'Liberation Mono', stack: '"Liberation Mono", monospace' },
        { label: 'Cascadia Code', stack: '"Cascadia Code", monospace' },
        { label: 'Ubuntu Mono', stack: '"Ubuntu Mono", monospace' },
        { label: 'SF Mono', stack: '"SF Mono", monospace' },
        { label: 'JetBrains Mono', stack: '"JetBrains Mono", monospace' },
        { label: 'Fira Code', stack: '"Fira Code", monospace' },
        { label: 'Noto Sans Mono', stack: '"Noto Sans Mono", monospace' },
        { label: '通用等宽字体', stack: 'monospace' }
    ],
    'mono-serif': [
        { label: 'Courier New', stack: '"Courier New", monospace' },
        { label: 'Courier', stack: 'Courier, monospace' },
        { label: 'Nimbus Mono PS', stack: '"Nimbus Mono PS", monospace' },
        { label: 'Iosevka Slab', stack: '"Iosevka Slab", monospace' },
        { label: '通用等宽衬线', stack: '"Courier New", Courier, monospace' }
    ],
    'prop-sans': [
        { label: 'Arial', stack: 'Arial, sans-serif' },
        { label: 'Helvetica', stack: 'Helvetica, sans-serif' },
        { label: 'Segoe UI', stack: '"Segoe UI", sans-serif' },
        { label: '微软雅黑', stack: '"Microsoft YaHei", sans-serif' },
        { label: '苹方', stack: '"PingFang SC", sans-serif' },
        { label: '思源黑体', stack: '"Noto Sans CJK SC", sans-serif' },
        { label: 'Source Han Sans SC', stack: '"Source Han Sans SC", sans-serif' },
        { label: 'Roboto', stack: 'Roboto, sans-serif' },
        { label: 'Open Sans', stack: '"Open Sans", sans-serif' },
        { label: 'Verdana', stack: 'Verdana, sans-serif' },
        { label: 'Tahoma', stack: 'Tahoma, sans-serif' },
        { label: 'Ubuntu', stack: 'Ubuntu, sans-serif' },
        { label: 'Noto Sans', stack: '"Noto Sans", sans-serif' },
        { label: '通用无衬线字体', stack: 'sans-serif' }
    ],
    'prop-serif': [
        { label: 'Times New Roman', stack: '"Times New Roman", serif' },
        { label: 'Georgia', stack: 'Georgia, serif' },
        { label: '宋体-简', stack: '"Songti SC", serif' },
        { label: '宋体', stack: '"SimSun", serif' },
        { label: '华文宋体', stack: '"STSong", serif' },
        { label: '思源宋体', stack: '"Noto Serif CJK SC", serif' },
        { label: 'Source Han Serif SC', stack: '"Source Han Serif SC", serif' },
        { label: 'Cambria', stack: 'Cambria, serif' },
        { label: 'Garamond', stack: 'Garamond, serif' },
        { label: 'Palatino', stack: 'Palatino, serif' },
        { label: '通用衬线字体', stack: 'serif' }
    ]
};

// 七个文本元素 -> CSS 变量映射（代码块拆分为「代码正文 / 注释·汉字」）
const fontGroupMap = {
    'heading': '--font-heading',
    'body': '--font-body',
    'inline-code': '--font-inline-code',
    'code-block-code': '--font-code-block-code',
    'code-block-comment': '--font-code-block-comment',
    'link': '--font-link',
    'quote': '--font-quote'
};

// ==================== 本机字体读取（Local Font Access API） ====================
// 浏览器安全策略：仅 HTTPS 或 localhost 环境可用；Chrome/Edge 桌面版 103+ 支持
const LOCAL_FONTS_KEY = 'wblog-local-fonts-v1';
const FONT_CATEGORIES = ['mono-sans', 'mono-serif', 'prop-sans', 'prop-serif'];
let localFontCategories = { 'mono-sans': [], 'mono-serif': [], 'prop-sans': [], 'prop-serif': [] };

// 判断字体是否已存在于预置库（按字体栈首个族名比较，避免下拉列表重复）
function familyInLibrary(family, category) {
    return (FONT_LIBRARY[category] || []).some(f => {
        const first = String(f.stack).split(',')[0].trim().replace(/^["']|["']$/g, '');
        return first.toLowerCase() === String(family).toLowerCase();
    });
}

// 根据两个开关状态决定字体类别
function getFontCategory(monoOn, serifOn) {
    if (monoOn && serifOn) return 'mono-serif';
    if (monoOn) return 'mono-sans';
    if (serifOn) return 'prop-serif';
    return 'prop-sans';
}

// 填充字体下拉列表：首位固定「默认（跟随全局）」，其余按类别动态列出
function populateFontSelect(select, category, savedValue) {
    select.innerHTML = '';
    const defaultOpt = document.createElement('option');
    defaultOpt.value = 'inherit';
    defaultOpt.textContent = '默认（跟随全局）';
    select.appendChild(defaultOpt);
    (FONT_LIBRARY[category] || []).forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.stack;
        opt.textContent = f.label;
        opt.title = f.label; // 长字体名悬停显示全名
        select.appendChild(opt);
    });
    // 本机字体（Local Font Access API 读取，按类别筛选并与预置库去重）
    const locals = (localFontCategories[category] || []).filter(f => !familyInLibrary(f, category));
    if (locals.length) {
        const og = document.createElement('optgroup');
        og.label = `本机字体（${locals.length}）`;
        locals.forEach(family => {
            const opt = document.createElement('option');
            opt.value = `"${String(family).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
            opt.textContent = family;
            opt.title = family; // 长字体名悬停显示全名
            og.appendChild(opt);
        });
        select.appendChild(og);
    }
    const valid = savedValue && [...select.options].some(o => o.value === savedValue);
    select.value = valid ? savedValue : 'inherit';
    // 选中项悬停（Tooltip）显示完整名称
    select.title = select.selectedOptions[0] ? select.selectedOptions[0].textContent : '';
    select.dataset.current = select.value;
}

// 初始化五个字体配置区域（开关联动 + 下拉动态筛选）
function initFontRegions() {
    document.querySelectorAll('.font-region').forEach(region => {
        const group = region.dataset.fontGroup;
        if (!group || !fontGroupMap[group]) return;
        const monoToggle = region.querySelector('.font-mono-toggle');
        const serifToggle = region.querySelector('.font-serif-toggle');
        const familySelect = region.querySelector('.font-family-select');
        if (!monoToggle || !serifToggle || !familySelect) return;

        const refreshList = () => {
            const category = getFontCategory(monoToggle.checked, serifToggle.checked);
            populateFontSelect(familySelect, category, familySelect.dataset.savedValue || 'inherit');
        };

        monoToggle.addEventListener('change', () => {
            localStorage.setItem(`font-${group}-mono`, monoToggle.checked ? 'on' : 'off');
            refreshList();
        });
        serifToggle.addEventListener('change', () => {
            localStorage.setItem(`font-${group}-serif`, serifToggle.checked ? 'on' : 'off');
            refreshList();
        });
        familySelect.addEventListener('change', (e) => {
            const val = e.target.value;
            familySelect.dataset.savedValue = val;
            if (val === 'inherit') {
                root.style.removeProperty(fontGroupMap[group]);
            } else {
                root.style.setProperty(fontGroupMap[group], val);
            }
            localStorage.setItem(`font-${group}-family`, val);
            e.target.title = e.target.selectedOptions[0] ? e.target.selectedOptions[0].textContent : '';
            e.target.dataset.current = val;
        });

        refreshList();
    });
}

// 旧「代码」配置迁移：v1 设置（font-code-*）与旧字体矩阵（matrix-font-code）
// → 行内代码 / 代码块代码（注释·汉字组保留新默认，不覆盖 LXGW WenKai Mono）
function migrateLegacyCodeFont() {
    const legacyFamily = localStorage.getItem('font-code-family');
    const legacyMatrix = localStorage.getItem('matrix-font-code');
    if (legacyFamily === null && legacyMatrix === null) return;
    let mono = 'off', serif = 'off', family = 'inherit';
    if (legacyFamily !== null) {
        mono = localStorage.getItem('font-code-mono') === 'on' ? 'on' : 'off';
        serif = localStorage.getItem('font-code-serif') === 'on' ? 'on' : 'off';
        family = legacyFamily;
    } else {
        const matrixMap = {
            'sans-prop': { mono: 'off', serif: 'off', family: 'sans-serif' },
            'serif-prop': { mono: 'off', serif: 'on', family: 'serif' },
            'sans-mono': { mono: 'on', serif: 'off', family: 'monospace' },
            'serif-mono': { mono: 'on', serif: 'on', family: '"Courier New", monospace' }
        };
        const mapped = matrixMap[legacyMatrix];
        if (mapped) {
            mono = mapped.mono;
            serif = mapped.serif;
            family = mapped.family;
        }
    }
    ['inline-code', 'code-block-code'].forEach(g => {
        if (localStorage.getItem(`font-${g}-family`) === null) {
            localStorage.setItem(`font-${g}-mono`, mono);
            localStorage.setItem(`font-${g}-serif`, serif);
            localStorage.setItem(`font-${g}-family`, family);
        }
    });
}

// 恢复（并迁移旧版字体矩阵设置）
function restoreFontRegions() {
    const groups = ['heading', 'body', 'inline-code', 'code-block-code', 'code-block-comment', 'link', 'quote'];
    const hasOldMatrix = localStorage.getItem('matrix-font-body') !== null;

    // 旧「代码」配置迁移（font-code-* 与 matrix-font-code → 行内代码/代码块代码）
    migrateLegacyCodeFont();

    groups.forEach(group => {
        const region = document.querySelector(`.font-region[data-font-group="${group}"]`);
        if (!region) return;
        const monoToggle = region.querySelector('.font-mono-toggle');
        const serifToggle = region.querySelector('.font-serif-toggle');
        const familySelect = region.querySelector('.font-family-select');

        // 旧版字体矩阵迁移（仅对未改名的组；行内代码/代码块已由 migrateLegacyCodeFont 处理）
        if (hasOldMatrix && group !== 'inline-code' && group !== 'code-block-code' && group !== 'code-block-comment' && !localStorage.getItem(`font-${group}-family`)) {
            const oldVal = localStorage.getItem(`matrix-font-${group}`);
            const matrixMap = {
                'sans-prop': { mono: 'off', serif: 'off', family: 'sans-serif' },
                'serif-prop': { mono: 'off', serif: 'on', family: 'serif' },
                'sans-mono': { mono: 'on', serif: 'off', family: 'monospace' },
                'serif-mono': { mono: 'on', serif: 'on', family: '"Courier New", monospace' }
            };
            const mapped = matrixMap[oldVal];
            if (mapped) {
                localStorage.setItem(`font-${group}-mono`, mapped.mono);
                localStorage.setItem(`font-${group}-serif`, mapped.serif);
                localStorage.setItem(`font-${group}-family`, mapped.family);
            } else {
                localStorage.setItem(`font-${group}-family`, 'inherit');
            }
        }

        const monoOn = localStorage.getItem(`font-${group}-mono`) === 'on';
        const serifOn = localStorage.getItem(`font-${group}-serif`) === 'on';
        const savedFamily = localStorage.getItem(`font-${group}-family`) || 'inherit';

        monoToggle.checked = monoOn;
        serifToggle.checked = serifOn;
        familySelect.dataset.savedValue = savedFamily;

        // 应用已保存字体（含旧矩阵迁移结果）
        if (savedFamily !== 'inherit') {
            root.style.setProperty(fontGroupMap[group], savedFamily);
        }
        const category = getFontCategory(monoOn, serifOn);
        populateFontSelect(familySelect, category, savedFamily);
    });

    // 本机字体读取区域（在字体下拉填充完毕后初始化）
    initLocalFontRegion();
}

// ==================== 本机字体读取实现（Local Font Access API） ====================

// 用 Canvas 探测字体特征：是否等宽、是否衬线（用于自动分类到四类字体库）
function detectFontFeatures(family) {
    const safe = String(family).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    // 字体不可用时直接归为默认类（document.fonts.check 无法确认则继续尝试测量）
    if (document.fonts && typeof document.fonts.check === 'function') {
        try {
            if (!document.fonts.check(`64px "${safe}"`)) return { mono: false, serif: false };
        } catch (e) { /* 忽略异常，继续测量 */ }
    }
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    // 无 2D 上下文（如无头环境）时无法测量，按默认类处理
    if (!ctx) return { mono: false, serif: false };
    // 等宽检测：等宽字体中 'i' 与 'm' 宽度相同（均为 1em）
    ctx.font = `64px "${safe}"`;
    const wI = ctx.measureText('i').width;
    const wM = ctx.measureText('m').width;
    const mono = Math.abs(wI - wM) < 1.5;
    // 等宽字体（如 Consolas/DejaVu Sans Mono）的 'I' 常带横杠占满字格，衬线判别不可靠，统一归入 mono-sans；
    // 等宽衬线字体（Courier New 等）已由预置库的 mono-serif 类覆盖
    if (mono) return { mono: true, serif: false };
    // 衬线检测：渲染大写 'I'，比较字形最顶行与中部的水平跨度。
    // serif 字体顶部有横向衬线横杠（跨度远大于竖线），sans 字体顶部仅竖线本身
    const size = 96;
    ctx.font = `${size}px "${safe}"`;
    const iw = Math.ceil(ctx.measureText('I').width);
    canvas.width = iw + 16; // 重置画布
    canvas.height = size + 16;
    ctx.font = `${size}px "${safe}"`; // 画布尺寸变化后需重新设置字体
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#000';
    ctx.fillText('I', 8, size);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const rowSpans = [];
    for (let y = 0; y < canvas.height; y++) {
        let minX = -1, maxX = -1;
        for (let x = 0; x < canvas.width; x++) {
            if (data[(y * canvas.width + x) * 4 + 3] > 0) {
                if (minX < 0) minX = x;
                maxX = x;
            }
        }
        if (minX >= 0) rowSpans.push(maxX - minX + 1);
    }
    let serif = false;
    if (rowSpans.length >= 3) {
        const topSpan = rowSpans[0];
        const midSpan = rowSpans[Math.floor(rowSpans.length / 2)];
        // 顶部衬线跨度显著大于竖线笔画跨度 => 衬线字体
        serif = midSpan > 0 && topSpan > midSpan * 1.6;
    }
    return { mono, serif };
}

// 重新填充所有字体下拉（本机字体读取/恢复缓存后调用）
function repopulateAllFontSelects() {
    document.querySelectorAll('.font-region').forEach(region => {
        const group = region.dataset.fontGroup;
        if (!group || !fontGroupMap[group]) return;
        const monoToggle = region.querySelector('.font-mono-toggle');
        const serifToggle = region.querySelector('.font-serif-toggle');
        const familySelect = region.querySelector('.font-family-select');
        if (!monoToggle || !serifToggle || !familySelect) return;
        const saved = familySelect.dataset.savedValue || familySelect.value || 'inherit';
        populateFontSelect(familySelect, getFontCategory(monoToggle.checked, serifToggle.checked), saved);
    });
}

function setLocalFontStatus(msg, cls) {
    const status = document.getElementById('font-local-status');
    if (!status) return;
    status.textContent = msg;
    status.className = 'font-local-status' + (cls ? ' ' + cls : '');
}

// 读取系统已安装字体：queryLocalFonts() -> 去重 -> Canvas 自动分类 -> 写入缓存并刷新下拉
async function readLocalFonts() {
    const btn = document.getElementById('font-local-btn');
    if (!btn) return;
    if (!window.queryLocalFonts) {
        setLocalFontStatus('当前浏览器不支持 Local Font Access API（需 Chrome/Edge 桌面版 103+）', 'warn');
        return;
    }
    if (!window.isSecureContext) {
        setLocalFontStatus('需 HTTPS 或 localhost 环境才能读取本机字体', 'warn');
        return;
    }
    btn.disabled = true;
    setLocalFontStatus('正在读取系统字体…（请在弹窗中允许访问）');
    try {
        const available = await window.queryLocalFonts();
        const families = [...new Set((available || []).map(f => f && f.family).filter(Boolean))]
            .sort((a, b) => String(a).localeCompare(String(b), 'zh-Hans-CN'));
        const cats = { 'mono-sans': [], 'mono-serif': [], 'prop-sans': [], 'prop-serif': [] };
        for (let i = 0; i < families.length; i++) {
            let feat;
            try {
                feat = detectFontFeatures(families[i]);
            } catch (e) {
                feat = { mono: false, serif: false };
            }
            cats[(feat.mono ? 'mono' : 'prop') + '-' + (feat.serif ? 'serif' : 'sans')].push(families[i]);
            // 大批量字体时周期性让出主线程，避免 UI 卡顿
            if (i % 40 === 39) {
                setLocalFontStatus(`正在分类 ${i + 1}/${families.length}…`);
                await new Promise(r => setTimeout(r, 0));
            }
        }
        localFontCategories = cats;
        try {
            localStorage.setItem(LOCAL_FONTS_KEY, JSON.stringify(cats));
        } catch (e) { /* 存储失败不影响本次使用 */ }
        repopulateAllFontSelects();
        const monoCount = cats['mono-sans'].length + cats['mono-serif'].length;
        const serifCount = cats['prop-serif'].length + cats['mono-serif'].length;
        setLocalFontStatus(`已读取 ${families.length} 个字体（等宽 ${monoCount} · 衬线 ${serifCount}），已加入上方下拉列表`, 'ok');
        btn.textContent = '重新读取本机字体';
    } catch (err) {
        const name = err && err.name;
        if (name === 'NotAllowedError' || name === 'SecurityError') {
            setLocalFontStatus('未获得授权：请在弹窗中允许访问本地字体', 'warn');
        } else if (name === 'AbortError') {
            setLocalFontStatus('已取消读取', 'warn');
        } else {
            setLocalFontStatus('读取失败：' + ((err && err.message) || err), 'warn');
        }
    } finally {
        btn.disabled = false;
    }
}

// 初始化本机字体区域：恢复缓存、能力检测（API + 安全上下文 + 权限状态）、绑定按钮
function initLocalFontRegion() {
    const btn = document.getElementById('font-local-btn');
    if (!btn) return;

    // 1) 恢复上次读取结果缓存（避免每次刷新都重新弹窗授权）
    try {
        const raw = localStorage.getItem(LOCAL_FONTS_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && FONT_CATEGORIES.every(c => Array.isArray(parsed[c]))) {
                localFontCategories = parsed;
                repopulateAllFontSelects();
                const total = FONT_CATEGORIES.reduce((n, c) => n + parsed[c].length, 0);
                if (total > 0) {
                    setLocalFontStatus(`已加载 ${total} 个本机字体缓存`, 'ok');
                    btn.textContent = '重新读取本机字体';
                }
            }
        }
    } catch (e) { /* 缓存损坏则忽略 */ }

    // 2) 能力检测：浏览器支持 + 安全上下文（HTTPS 或 localhost）
    if (!('queryLocalFonts' in window)) {
        btn.disabled = true;
        setLocalFontStatus('当前浏览器不支持 Local Font Access API（需 Chrome/Edge 桌面版 103+）', 'warn');
        return;
    }
    if (!window.isSecureContext) {
        btn.disabled = true;
        setLocalFontStatus('需 HTTPS 或 localhost 环境才能读取本机字体', 'warn');
        return;
    }
    // 3) 权限状态提示（仅查询状态，不弹窗）
    if (navigator.permissions && typeof navigator.permissions.query === 'function') {
        navigator.permissions.query({ name: 'local-fonts' }).then(p => {
            if (p.state === 'denied') {
                btn.disabled = true;
                setLocalFontStatus('权限已被拒绝：请在浏览器站点设置中允许「本地字体」后刷新页面', 'warn');
            }
        }).catch(() => { /* 权限 API 不可用则忽略 */ });
    }
    if (!document.getElementById('font-local-status').textContent) {
        setLocalFontStatus('点击按钮读取本机字体（需在弹窗中允许访问）');
    }
    if (btn.dataset.localFontInit !== '1') {
        btn.dataset.localFontInit = '1';
        btn.addEventListener('click', readLocalFonts);
    }
}

function updatePosition() {
    const wrapper = document.getElementById('article-wrapper');
    const article = document.getElementById('article-container');
    const pSlider = document.getElementById('position-slider');
    if (!pSlider || !wrapper || !article) return;
    const percent = parseInt(pSlider.value) || 0;
    const maxShift = (window.innerWidth - wrapper.offsetWidth) / 2;
    const targetX = (percent / 100) * maxShift;
    article.style.transform = `translateX(${targetX}px)`;
    const posVal = document.getElementById('position-val');
    if (posVal) {
        if (percent === 0) posVal.innerText = "居中";
        else if (percent < 0) posVal.innerText = `L${Math.abs(percent)}%`;
        else posVal.innerText = `R${percent}%`;
    }
    localStorage.setItem('blog-pos', percent);
}

function formatInlineSize(val) {
    const num = parseInt(val, 10) || 0;
    let cssStr = '';
    let labelStr = '';
    if (num === 0) {
        cssStr = '1em';
        labelStr = '0px';
    } else if (num > 0) {
        cssStr = `calc(1em + ${num}px)`;
        labelStr = `+${num}px`;
    } else {
        cssStr = `calc(1em - ${Math.abs(num)}px)`;
        labelStr = `${num}px`;
    }
    return { cssStr, labelStr };
}

// ==================== 绑定所有控件 ====================
function bindControls() {
    const article = document.getElementById('article-container');

    // ----- 版面调节 -----
    const wSlider = document.getElementById('width-slider');
    const sSlider = document.getElementById('size-slider');
    const pSlider = document.getElementById('position-slider');
    const lSlider = document.getElementById('line-slider');
    const cText = document.getElementById('color-text');
    const cBg = document.getElementById('color-bg');

    // ----- 样式调节 -----
    const lightThemeSelect = document.getElementById('light-theme-select');
    const darkThemeSelect = document.getElementById('dark-theme-select');
    const quoteStyleSelect = document.getElementById('quote-style-select');

    // ----- 代码样式调节 -----
    const codeFormatSelect = document.getElementById('code-format-select');
    const codeThemeSelect = document.getElementById('code-theme-select');
    const codeInlineThemeSelect = document.getElementById('code-inline-theme-select');
    const codeInlineSlider = document.getElementById('code-inline-slider');
    const codeInlinePadSlider = document.getElementById('code-inline-pad-slider');
    const codeBlockSlider = document.getElementById('code-block-slider');
    const codeLineNumbersToggle = document.getElementById('code-line-numbers-toggle');
    const codeHeaderToggle = document.getElementById('code-header-toggle');

    // ----- 表格样式调节 -----
    const tableFormatSelect = document.getElementById('table-format-select');
    const tableHeaderToggle = document.getElementById('table-header-toggle');

    // ----- 微调按钮 -----
    document.querySelectorAll('.slider-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = btn.getAttribute('data-target');
            const step = parseFloat(btn.getAttribute('data-step')) || 0;
            const slider = document.getElementById(targetId);
            if (slider) {
                const min = parseFloat(slider.min) || 0;
                const max = parseFloat(slider.max) || 100;
                let curVal = parseFloat(slider.value) || 0;
                let newVal = curVal + step;
                newVal = Math.max(min, Math.min(max, newVal));
                if (slider.step && slider.step.includes('.')) {
                    newVal = parseFloat(newVal.toFixed(1));
                }
                slider.value = newVal;
                slider.dispatchEvent(new Event('input'));
            }
        });
    });

    // ----- 版面宽度 -----
    wSlider?.addEventListener('input', (e) => {
        root.style.setProperty('--page-width', `${e.target.value}px`);
        const valEl = document.getElementById('width-val');
        if (valEl) valEl.innerText = `${e.target.value}px`;
        localStorage.setItem('blog-width', e.target.value);
        updatePosition();
    });

    // ----- 文字大小 -----
    sSlider?.addEventListener('input', (e) => {
        root.style.setProperty('--font-size', `${e.target.value}px`);
        const valEl = document.getElementById('size-val');
        if (valEl) valEl.innerText = `${e.target.value}px`;
        localStorage.setItem('blog-size', e.target.value);
    });

    // ----- 版面位置 -----
    pSlider?.addEventListener('input', updatePosition);
    window.addEventListener('resize', updatePosition);

    // ----- 动态字体配置区域（等宽/衬线开关 + 字体下拉）-----
    initFontRegions();

    // ----- 行距 -----
    lSlider?.addEventListener('input', (e) => {
        root.style.setProperty('--line-height', e.target.value);
        const valEl = document.getElementById('line-val');
        if (valEl) valEl.innerText = e.target.value;
        localStorage.setItem('blog-line', e.target.value);
    });

    // ----- 文字颜色 -----
    cText?.addEventListener('input', (e) => {
        const bg = cBg?.value || '#fbfbfb';
        applyCustomReaderColors(e.target.value, bg);
        localStorage.setItem('blog-ctext', e.target.value);
        // 标记为自定义亮色
        localStorage.setItem('blog-reader-theme', 'custom');
        localStorage.setItem('last-light-theme', 'custom');
        localStorage.setItem('blog-theme-mode', 'light');
        const themeBtn = document.getElementById('bar-theme');
        if (themeBtn) {
            themeBtn.classList.remove('active');
            themeBtn.querySelector('.bar-icon').textContent = '☀️';
            themeBtn.querySelector('.bar-label').textContent = '亮色';
        }
    });

    // ----- 背景颜色 -----
    cBg?.addEventListener('input', (e) => {
        const text = cText?.value || '#222222';
        applyCustomReaderColors(text, e.target.value);
        localStorage.setItem('blog-cbg', e.target.value);
        localStorage.setItem('blog-reader-theme', 'custom');
        localStorage.setItem('last-light-theme', 'custom');
        localStorage.setItem('blog-theme-mode', 'light');
        const themeBtn = document.getElementById('bar-theme');
        if (themeBtn) {
            themeBtn.classList.remove('active');
            themeBtn.querySelector('.bar-icon').textContent = '☀️';
            themeBtn.querySelector('.bar-label').textContent = '亮色';
        }
    });

    // ----- 日间主题下拉 -----
    lightThemeSelect?.addEventListener('change', (e) => {
        const themeName = e.target.value;
        if (themeName === 'custom') {
            // 使用当前颜色选择器的值
            const text = cText?.value || '#222222';
            const bg = cBg?.value || '#fbfbfb';
            applyCustomReaderColors(text, bg);
            localStorage.setItem('blog-reader-theme', 'custom');
            localStorage.setItem('last-light-theme', 'custom');
            localStorage.setItem('blog-theme-mode', 'light');
        } else {
            applyReaderTheme(themeName);
            localStorage.setItem('blog-reader-theme', themeName);
            localStorage.setItem('last-light-theme', themeName);
            localStorage.setItem('blog-theme-mode', 'light');
        }
        // 更新底部按钮状态
        const themeBtn = document.getElementById('bar-theme');
        if (themeBtn) {
            themeBtn.classList.remove('active');
            themeBtn.querySelector('.bar-icon').textContent = '☀️';
            themeBtn.querySelector('.bar-label').textContent = '亮色';
        }
        // 如果夜间主题下拉也选中 custom，不需要自动切换
    });

    // ----- 夜间主题下拉 -----
    darkThemeSelect?.addEventListener('change', (e) => {
        const themeName = e.target.value;
        if (themeName === 'custom') {
            const text = cText?.value || '#222222';
            const bg = cBg?.value || '#fbfbfb';
            applyCustomReaderColors(text, bg);
            localStorage.setItem('blog-reader-theme', 'custom');
            localStorage.setItem('last-dark-theme', 'custom');
            localStorage.setItem('blog-theme-mode', 'dark');
        } else {
            applyReaderTheme(themeName);
            localStorage.setItem('blog-reader-theme', themeName);
            localStorage.setItem('last-dark-theme', themeName);
            localStorage.setItem('blog-theme-mode', 'dark');
        }
        const themeBtn = document.getElementById('bar-theme');
        if (themeBtn) {
            themeBtn.classList.add('active');
            themeBtn.querySelector('.bar-icon').textContent = '🌙';
            themeBtn.querySelector('.bar-label').textContent = '暗色';
        }
    });

    // ----- 引用样式 -----
    quoteStyleSelect?.addEventListener('change', (e) => {
        if (article) article.setAttribute('data-quote-style', e.target.value);
        localStorage.setItem('blog-quote-style', e.target.value);
    });

    // ----- 代码显示格式 -----
    codeFormatSelect?.addEventListener('change', (e) => {
        if (article) article.setAttribute('data-code-format', e.target.value);
        localStorage.setItem('blog-code-format', e.target.value);
    });

    // ----- 代码块主题 -----
    codeThemeSelect?.addEventListener('change', (e) => {
        if (article) article.setAttribute('data-code-theme', e.target.value);
        localStorage.setItem('blog-code-theme', e.target.value);
    });

    // ----- 行内代码主题 -----
    codeInlineThemeSelect?.addEventListener('change', (e) => {
        if (article) article.setAttribute('data-code-inline-theme', e.target.value);
        localStorage.setItem('blog-code-inline-theme', e.target.value);
    });

    // ----- 行内字号偏移 -----
    codeInlineSlider?.addEventListener('input', (e) => {
        const offsetVal = e.target.value;
        const { cssStr, labelStr } = formatInlineSize(offsetVal);
        root.style.setProperty('--code-inline-size', cssStr);
        const valEl = document.getElementById('code-inline-val');
        if (valEl) valEl.innerText = labelStr;
        localStorage.setItem('blog-code-inline-offset', offsetVal);
    });

    // ----- 行内边距 -----
    codeInlinePadSlider?.addEventListener('input', (e) => {
        const padVal = e.target.value;
        root.style.setProperty('--code-inline-pad-y', `${padVal}px`);
        const valEl = document.getElementById('code-inline-pad-val');
        if (valEl) valEl.innerText = `${padVal}px`;
        localStorage.setItem('blog-code-inline-pad', padVal);
    });

    // ----- 块级字号 -----
    codeBlockSlider?.addEventListener('input', (e) => {
        root.style.setProperty('--code-block-size', `${e.target.value}px`);
        const valEl = document.getElementById('code-block-val');
        if (valEl) valEl.innerText = `${e.target.value}px`;
        localStorage.setItem('blog-code-block-size', e.target.value);
    });

    // ----- 显示行号 -----
    codeLineNumbersToggle?.addEventListener('change', (e) => {
        if (article) article.setAttribute('data-code-line-numbers', e.target.checked ? 'on' : 'off');
        localStorage.setItem('blog-code-line-numbers', e.target.checked ? 'on' : 'off');
    });

    // ----- 顶部工具栏 -----
    codeHeaderToggle?.addEventListener('change', (e) => {
        if (article) article.setAttribute('data-code-header', e.target.checked ? 'on' : 'off');
        localStorage.setItem('blog-code-header', e.target.checked ? 'on' : 'off');
    });

    // ----- 表格显示格式 -----
    if (tableFormatSelect) {
        tableFormatSelect.addEventListener('change', (e) => {
            const format = e.target.value;
            localStorage.setItem('table-format', format);
            applyGlobalTableFormat(format);
        });
    }

    // ----- 显示标题栏 -----
    if (tableHeaderToggle) {
        tableHeaderToggle.addEventListener('change', (e) => {
            const show = e.target.checked; // 开关状态为"显示标题栏"，checked 表示显示
            localStorage.setItem('table-show-header', show ? 'true' : 'false');
            applyGlobalTableHeader(show);
        });
    }

}

// ==================== 恢复保存的设置 ====================
function restoreSavedSettings() {
    const article = document.getElementById('article-container');
    const wSlider = document.getElementById('width-slider');
    const sSlider = document.getElementById('size-slider');
    const pSlider = document.getElementById('position-slider');
    const lSlider = document.getElementById('line-slider');
    const cText = document.getElementById('color-text');
    const cBg = document.getElementById('color-bg');
    const lightThemeSelect = document.getElementById('light-theme-select');
    const darkThemeSelect = document.getElementById('dark-theme-select');
    const quoteStyleSelect = document.getElementById('quote-style-select');
    const codeFormatSelect = document.getElementById('code-format-select');
    const codeThemeSelect = document.getElementById('code-theme-select');
    const codeInlineThemeSelect = document.getElementById('code-inline-theme-select');
    const codeInlineSlider = document.getElementById('code-inline-slider');
    const codeInlinePadSlider = document.getElementById('code-inline-pad-slider');
    const codeBlockSlider = document.getElementById('code-block-slider');
    const codeLineNumbersToggle = document.getElementById('code-line-numbers-toggle');
    const codeHeaderToggle = document.getElementById('code-header-toggle');
    const tableFormatSelect = document.getElementById('table-format-select');
    const tableHeaderToggle = document.getElementById('table-header-toggle');

    // 读取保存的值，若没有则使用默认值
    const savedWidth = localStorage.getItem('blog-width');
    const savedSize = localStorage.getItem('blog-size');
    const savedPos = localStorage.getItem('blog-pos');
    const savedLine = localStorage.getItem('blog-line');
    const savedCText = localStorage.getItem('blog-ctext');
    const savedCBg = localStorage.getItem('blog-cbg');
    // 当前主题
    const savedTheme = localStorage.getItem('blog-reader-theme') || 'lightmind';
    // 日间/夜间主题选择器的默认值：根据当前主题是亮还是暗决定
    const isDark = savedTheme.includes('dark');
    const defaultLightTheme = localStorage.getItem('last-light-theme') || 'lightmind';
    const defaultDarkTheme = localStorage.getItem('last-dark-theme') || 'lightmind-dark';

    // 代码默认设置
    const savedCodeFormat = localStorage.getItem('blog-code-format') || 'global';
    const savedCodeTheme = localStorage.getItem('blog-code-theme') || 'global';
    const savedCodeInlineTheme = localStorage.getItem('blog-code-inline-theme') || 'global';
    const savedCodeInlineOffset = localStorage.getItem('blog-code-inline-offset') ?? '-2';
    const savedCodeInlinePad = localStorage.getItem('blog-code-inline-pad') ?? '0';
    const savedCodeBlockSize = localStorage.getItem('blog-code-block-size');
    const savedCodeLineNumbers = localStorage.getItem('blog-code-line-numbers') || 'off'; // 默认关
    const savedCodeHeader = localStorage.getItem('blog-code-header') || 'off'; // 默认关
    const savedQuoteStyle = localStorage.getItem('blog-quote-style') || 'global';

    const savedTableFormat = localStorage.getItem('table-format') || 'adaptive';
    const savedTableShowHeader = localStorage.getItem('table-show-header') === 'true';

    // ----- 恢复基础样式 -----
    if (savedWidth && wSlider) {
        wSlider.value = savedWidth;
        root.style.setProperty('--page-width', `${savedWidth}px`);
        const valEl = document.getElementById('width-val');
        if (valEl) valEl.innerText = `${savedWidth}px`;
    }
    if (savedSize && sSlider) {
        sSlider.value = savedSize;
        root.style.setProperty('--font-size', `${savedSize}px`);
        const valEl = document.getElementById('size-val');
        if (valEl) valEl.innerText = `${savedSize}px`;
    }
    if (savedPos && pSlider) {
        pSlider.value = savedPos;
    }
    if (savedLine && lSlider) {
        lSlider.value = savedLine;
        root.style.setProperty('--line-height', savedLine);
        const valEl = document.getElementById('line-val');
        if (valEl) valEl.innerText = savedLine;
    }

    // 恢复主题
    if (savedTheme === 'custom') {
        const customText = savedCText || '#222222';
        const customBg = savedCBg || '#fbfbfb';
        if (cText) cText.value = customText;
        if (cBg) cBg.value = customBg;
        applyCustomReaderColors(customText, customBg);
        // 标记为自定义
        localStorage.setItem('last-light-theme', 'custom');
        localStorage.setItem('blog-theme-mode', 'light');
    } else {
        applyReaderTheme(savedTheme);
        const theme = readerThemeMap[savedTheme] || readerThemeMap['lightmind'];
        if (cText) cText.value = theme.text;
        if (cBg) cBg.value = theme.bg;
        if (isDark) {
            localStorage.setItem('last-dark-theme', savedTheme);
            localStorage.setItem('blog-theme-mode', 'dark');
        } else {
            localStorage.setItem('last-light-theme', savedTheme);
            localStorage.setItem('blog-theme-mode', 'light');
        }
    }

    // 设置下拉框值（custom 选项已移除：若保存值无效则回退到对应默认主题）
    const resolveSelectValue = (select, value, fallback) => {
        if (!select) return fallback;
        if (value && Array.from(select.options).some(o => o.value === value)) return value;
        return fallback;
    };
    if (lightThemeSelect) {
        lightThemeSelect.value = resolveSelectValue(lightThemeSelect, isDark ? defaultLightTheme : savedTheme, 'lightmind');
    }
    if (darkThemeSelect) {
        darkThemeSelect.value = resolveSelectValue(darkThemeSelect, isDark ? savedTheme : defaultDarkTheme, 'lightmind-dark');
    }

    // ----- 恢复代码设置 -----
    if (article) {
        article.setAttribute('data-code-format', savedCodeFormat);
        article.setAttribute('data-code-theme', savedCodeTheme);
        article.setAttribute('data-code-inline-theme', savedCodeInlineTheme);
        article.setAttribute('data-code-line-numbers', savedCodeLineNumbers);
        article.setAttribute('data-code-header', savedCodeHeader);
        article.setAttribute('data-quote-style', savedQuoteStyle);
    }
    if (codeFormatSelect) codeFormatSelect.value = savedCodeFormat;
    if (codeThemeSelect) codeThemeSelect.value = savedCodeTheme;
    if (codeInlineThemeSelect) codeInlineThemeSelect.value = savedCodeInlineTheme;
    if (quoteStyleSelect) quoteStyleSelect.value = savedQuoteStyle;
    if (codeLineNumbersToggle) codeLineNumbersToggle.checked = savedCodeLineNumbers === 'on';
    if (codeHeaderToggle) codeHeaderToggle.checked = savedCodeHeader === 'on';

    if (codeInlineSlider) {
        codeInlineSlider.value = savedCodeInlineOffset;
        const { cssStr, labelStr } = formatInlineSize(savedCodeInlineOffset);
        root.style.setProperty('--code-inline-size', cssStr);
        const valEl = document.getElementById('code-inline-val');
        if (valEl) valEl.innerText = labelStr;
    }
    if (codeInlinePadSlider) {
        codeInlinePadSlider.value = savedCodeInlinePad;
        root.style.setProperty('--code-inline-pad-y', `${savedCodeInlinePad}px`);
        const valEl = document.getElementById('code-inline-pad-val');
        if (valEl) valEl.innerText = `${savedCodeInlinePad}px`;
    }
    if (savedCodeBlockSize && codeBlockSlider) {
        codeBlockSlider.value = savedCodeBlockSize;
        root.style.setProperty('--code-block-size', `${savedCodeBlockSize}px`);
        const valEl = document.getElementById('code-block-val');
        if (valEl) valEl.innerText = `${savedCodeBlockSize}px`;
    }

    // ----- 恢复动态字体配置区域（含旧矩阵迁移）-----
    restoreFontRegions();

    // ----- 恢复表格设置 -----
    if (tableFormatSelect) tableFormatSelect.value = savedTableFormat;
    if (tableHeaderToggle) tableHeaderToggle.checked = savedTableShowHeader; // 默认显示

    setTimeout(() => {
        applyGlobalTableFormat(savedTableFormat);
        applyGlobalTableHeader(savedTableShowHeader);
    }, 100);

    // ----- 恢复底部主题按钮状态 -----
    const themeBtn = document.getElementById('bar-theme');
    if (themeBtn) {
        const mode = localStorage.getItem('blog-theme-mode') || 'light';
        const isDarkMode = mode === 'dark';
        themeBtn.classList.toggle('active', isDarkMode);
        themeBtn.querySelector('.bar-icon').textContent = isDarkMode ? '🌙' : '☀️';
        themeBtn.querySelector('.bar-label').textContent = isDarkMode ? '暗色' : '亮色';
    }

    updatePosition();
}

// ==================== 全局表格应用函数 ====================
function applyGlobalTableFormat(format) {
    const wrappers = document.querySelectorAll('.table-wrapper');
    wrappers.forEach(wrapper => {
        const table = wrapper.querySelector('table');
        if (table) {
            wrapper.dataset.tableFormat = format;
            if (typeof updateTableFormat === 'function') {
                updateTableFormat(wrapper, format);
            }
        }
    });
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith('table-format-override-')) {
            localStorage.removeItem(key);
        }
    });
}

function applyGlobalTableHeader(show) {
    const wrappers = document.querySelectorAll('.table-wrapper');
    wrappers.forEach(wrapper => {
        const toolbar = wrapper.querySelector('.table-toolbar');
        if (toolbar) {
            toolbar.style.display = show ? 'flex' : 'none';
        }
    });
}

// ==================== 导出供其他模块使用 ====================
window.applyGlobalTableFormat = applyGlobalTableFormat;
window.applyGlobalTableHeader = applyGlobalTableHeader;
window.bindControls = bindControls;
window.restoreSavedSettings = restoreSavedSettings;
window.readLocalFonts = readLocalFonts;
window.detectFontFeatures = detectFontFeatures;
window.updatePosition = updatePosition;
window.formatInlineSize = formatInlineSize;
