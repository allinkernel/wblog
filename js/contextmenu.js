// ==================== 右键菜单（行内代码 / 代码块 / 表格） ====================
// 行内代码：复制行内代码（替代被移除的 contenteditable 内 Ctrl+A 全选复制）
// 代码块：复制代码块 / 全屏查看 / 调整格式 / 调整显示样式（主题）/ 调整字体大小
// 表格：复制表格内容

const CODE_THEMES = [
    ['', '跟随全局'],
    ['default', '默认浅色'],
    ['dark', '暗黑极客'],
    ['github-dark', 'GitHub Dark'],
    ['solarized', 'Solarized Dark'],
    ['github-light', 'GitHub Light'],
    ['dracula', 'Dracula'],
    ['nord', 'Nord'],
    ['one-dark', 'One Dark'],
    ['one-light', 'Atom One Light'],
    ['wildcharm', 'Wildcharm'],
    ['nightfox', 'Nightfox'],
    ['tokyonight', 'TokyoNight'],
    ['global', '跟随全局阅读主题'],
];

const CODE_FORMATS = [
    ['', '跟随全局'],
    ['scroll', '横向滚动'],
    ['wrap', '自动换行'],
    ['adaptive', '自适应最长行'],
];

const CODE_SIZES = [
    ['', '跟随全局'],
    ['12px', '小（12px）'],
    ['14px', '中（14px）'],
    ['16px', '大（16px）'],
    ['18px', '特大（18px）'],
];

let ctxTarget = null; // 当前菜单作用对象（行内 code 元素 / 代码块 wrapper / 表格）

function initContextMenu() {
    const menu = document.getElementById('context-menu');
    if (!menu || menu.dataset.ready) return;
    menu.dataset.ready = '1';

    document.addEventListener('contextmenu', (e) => {
        const codeWrapper = e.target.closest('.code-block-wrapper, .code-lightbox-content');
        const inlineCode = e.target.closest('code:not(pre code)');
        const table = e.target.closest('.table-wrapper .table-enhanced-inner');
        let items = null;
        if (codeWrapper) {
            ctxTarget = codeWrapper.closest('.code-block-wrapper') || codeWrapper;
            items = buildCodeBlockMenu(ctxTarget);
        } else if (inlineCode) {
            ctxTarget = inlineCode;
            items = [
                { label: '复制行内代码', action: () => copyToClipboard(inlineCode.textContent) },
            ];
        } else if (table) {
            ctxTarget = table;
            items = [
                { label: '复制表格内容', action: () => copyTableText(table) },
            ];
        }
        if (items) {
            e.preventDefault();
            showContextMenu(items, e.clientX, e.clientY);
        }
    });

    document.addEventListener('click', (e) => {
        if (menu.hidden) return;
        if (!menu.contains(e.target)) hideContextMenu();
    });
    document.addEventListener('scroll', () => hideContextMenu(), true);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') hideContextMenu();
    });
    window.addEventListener('blur', () => hideContextMenu());
    window.addEventListener('resize', () => hideContextMenu());
}

function buildCodeBlockMenu(wrapper) {
    return [
        {
            label: '复制代码块',
            action: () => {
                const pre = wrapper.querySelector('pre, .code-lines');
                return copyToClipboard((pre ? pre.textContent : wrapper.textContent).replace(/\n{2,}/g, '\n').trim());
            },
        },
        {
            label: '全屏查看',
            action: () => {
                const lang = (wrapper.querySelector('.code-lang-label') || {}).textContent || 'CODE';
                const raw = (wrapper.querySelector('pre, .code-lines') || wrapper).textContent;
                openCodeLightbox(lang, raw, wrapper);
            },
        },
        { divider: true },
        {
            label: '调整代码块格式',
            children: CODE_FORMATS.map(([v, label]) => ({
                label,
                checked: (wrapper.getAttribute('data-code-format') || '') === v,
                action: () => {
                    if (v) wrapper.setAttribute('data-code-format', v);
                    else wrapper.removeAttribute('data-code-format');
                },
            })),
        },
        {
            label: '调整代码块显示样式',
            children: CODE_THEMES.map(([v, label]) => ({
                label,
                checked: (wrapper.getAttribute('data-code-theme') || '') === v,
                action: () => {
                    if (v) wrapper.setAttribute('data-code-theme', v);
                    else wrapper.removeAttribute('data-code-theme');
                },
            })),
        },
        {
            label: '调整代码块字体大小',
            children: CODE_SIZES.map(([v, label]) => ({
                label,
                checked: (wrapper.style.getPropertyValue('--code-block-size') || '') === v,
                action: () => {
                    if (v) wrapper.style.setProperty('--code-block-size', v);
                    else wrapper.style.removeProperty('--code-block-size');
                },
            })),
        },
    ];
}

// 复制表格内容（单元格 Tab 分隔、行换行）
function copyTableText(table) {
    const rows = [...table.querySelectorAll('tr')];
    const text = rows
        .map(tr => [...tr.querySelectorAll('th, td')].map(c => (c.textContent || '').trim()).join('\t'))
        .join('\n');
    return copyToClipboard(text);
}

// ---------- 菜单渲染与定位 ----------

function renderItems(items) {
    const ul = document.createElement('ul');
    ul.className = 'ctx-list';
    items.forEach(item => {
        if (item.divider) {
            const li = document.createElement('li');
            li.className = 'ctx-divider';
            ul.appendChild(li);
            return;
        }
        const li = document.createElement('li');
        li.className = 'ctx-item';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ctx-item-btn' + (item.checked ? ' checked' : '');
        btn.innerHTML = `<span class="ctx-check">${item.checked ? '✓' : ''}</span><span class="ctx-label"></span>`;
        btn.querySelector('.ctx-label').textContent = item.label;
        if (item.children) {
            btn.innerHTML += '<span class="ctx-arrow">›</span>';
            li.appendChild(btn);
            const sub = renderItems(item.children);
            sub.className += ' ctx-submenu';
            li.appendChild(sub);
        } else {
            li.appendChild(btn);
            btn.addEventListener('click', () => {
                const ret = item.action ? item.action() : null;
                if (ret && typeof ret.then === 'function') {
                    ret.then(() => showToast('已复制')).catch(() => showToast('复制失败'));
                }
                hideContextMenu();
            });
        }
        ul.appendChild(li);
    });
    return ul;
}

function showContextMenu(items, x, y) {
    const menu = document.getElementById('context-menu');
    if (!menu) return;
    menu.innerHTML = '';
    menu.appendChild(renderItems(items));
    menu.hidden = false;
    // 定位：靠近视口边缘时翻转
    const rect = menu.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = x;
    let top = y;
    if (left + rect.width > vw - 8) left = Math.max(8, x - rect.width);
    if (top + rect.height > vh - 8) top = Math.max(8, y - rect.height);
    menu.style.left = left + 'px';
    menu.style.top = top + 'px';
}

function hideContextMenu() {
    const menu = document.getElementById('context-menu');
    if (menu) menu.hidden = true;
}

// ---------- 轻量提示 ----------

let toastTimer = null;
function showToast(msg) {
    let t = document.getElementById('ctx-toast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'ctx-toast';
        t.className = 'ctx-toast';
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 1500);
}

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', initContextMenu);

// ==================== 导出全局 ====================
window.initContextMenu = initContextMenu;
window.showContextMenu = showContextMenu;
window.hideContextMenu = hideContextMenu;
