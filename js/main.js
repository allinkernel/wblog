// ==================== 主入口 ====================
window.addEventListener('DOMContentLoaded', () => {
    // 1. 先初始化主题（在加载文章之前）
    initThemeMode();

    initBottomBar();
    bindControls();
    initCanvasPan();
    initImageLightbox();
    initCodeLightbox();
    initCodeSelectAll();

    const currentPath = window.location.pathname;
    loadArticleContent(currentPath);
    initArticleTree();
    restoreSavedSettings();

    // 初始化配置方案（首次访问默认 user1，以当前散键为起点）
    initConfigModule();
});

// ==================== 底部 Bar 初始化（含拖拽） ====================
let barOffsetX = 0;
let barOffsetY = 0;

function togglePanel(panelId) {
    const panel = document.getElementById(panelId);
    if (!panel) return;
    const isHidden = panel.classList.toggle('panel-hidden');
    const barMap = {
        'panel-tree': 'bar-tree',
        'panel-toc': 'bar-toc',
        'panel-settings': 'bar-settings'
    };
    const barId = barMap[panelId];
    if (barId) {
        const barBtn = document.getElementById(barId);
        if (barBtn) barBtn.classList.toggle('active', !isHidden);
    }
    localStorage.setItem(`panel-${panelId}`, isHidden ? 'hidden' : 'visible');
    updateBatchButtons();
}

function setPanelVisible(panelId, visible) {
    const panel = document.getElementById(panelId);
    if (!panel) return;
    panel.classList.toggle('panel-hidden', !visible);
    const barMap = {
        'panel-tree': 'bar-tree',
        'panel-toc': 'bar-toc',
        'panel-settings': 'bar-settings'
    };
    const barId = barMap[panelId];
    if (barId) {
        const barBtn = document.getElementById(barId);
        if (barBtn) barBtn.classList.toggle('active', visible);
    }
    localStorage.setItem(`panel-${panelId}`, visible ? 'visible' : 'hidden');
    updateBatchButtons();
}

function initPanelVisibility() {
    const panelIds = ['panel-tree', 'panel-toc', 'panel-settings'];
    panelIds.forEach(id => {
        const state = localStorage.getItem(`panel-${id}`);
        setPanelVisible(id, state === 'visible');
    });
    updateBatchButtons();
}

// ==================== 批量面板切换 ====================
function getPanelIdsBySide(side) {
    if (side === 'left') {
        return ['panel-tree', 'panel-toc'];
    } else if (side === 'right') {
        return ['panel-settings'];
    }
    return [];
}

function areAllPanelsVisible(side) {
    const ids = getPanelIdsBySide(side);
    return ids.every(id => {
        const panel = document.getElementById(id);
        return panel && !panel.classList.contains('panel-hidden');
    });
}

function toggleAllPanels(side) {
    const ids = getPanelIdsBySide(side);
    const allVisible = areAllPanelsVisible(side);
    const newState = !allVisible;
    ids.forEach(id => {
        setPanelVisible(id, newState);
    });
    updateBatchButtons();
}

function updateBatchButtons() {
    const leftAllBtn = document.getElementById('bar-left-all');
    const rightAllBtn = document.getElementById('bar-right-all');
    if (leftAllBtn) {
        leftAllBtn.classList.toggle('active', areAllPanelsVisible('left'));
    }
    if (rightAllBtn) {
        rightAllBtn.classList.toggle('active', areAllPanelsVisible('right'));
    }
}

function loadBarPosition() {
    const saved = localStorage.getItem('bar-position');
    if (saved) {
        try {
            const pos = JSON.parse(saved);
            barOffsetX = pos.x || 0;
            barOffsetY = pos.y || 0;
        } catch (e) {
            barOffsetX = 0;
            barOffsetY = 0;
        }
    }
    applyBarPosition();
}

function saveBarPosition() {
    localStorage.setItem('bar-position', JSON.stringify({ x: barOffsetX, y: barOffsetY }));
}

function applyBarPosition() {
    const bar = document.getElementById('bottom-bar');
    if (!bar) return;
    bar.style.transform = `translate(calc(-50% + ${barOffsetX}px), ${barOffsetY}px)`;
}

function initBottomBar() {
    loadBarPosition();

    // ----- 明暗主题切换按钮 -----
    const themeBtn = document.getElementById('bar-theme');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleThemeMode);
    }

    // ----- 配置方案按钮（弹出抽屉） -----
    const defaultBtn = document.getElementById('bar-default');
    if (defaultBtn) {
        defaultBtn.addEventListener('click', toggleProfileDrawer);
    }

    // ----- 画布小手 -----
    const canvasBtn = document.getElementById('bar-canvas');
    const canvasToggle = document.getElementById('canvas-toggle');
    if (canvasBtn && canvasToggle) {
        const isChecked = canvasToggle.checked;
        canvasBtn.classList.toggle('active', isChecked);
        canvasBtn.addEventListener('click', () => {
            canvasToggle.checked = !canvasToggle.checked;
            canvasToggle.dispatchEvent(new Event('change'));
            canvasBtn.classList.toggle('active', canvasToggle.checked);
        });
        canvasToggle.addEventListener('change', () => {
            canvasBtn.classList.toggle('active', canvasToggle.checked);
        });
    }

    // ----- 面板按钮映射 -----
    const panelMap = {
        'bar-tree': 'panel-tree',
        'bar-toc': 'panel-toc',
        'bar-settings': 'panel-settings'
    };
    Object.keys(panelMap).forEach(barId => {
        const btn = document.getElementById(barId);
        if (!btn) return;
        const panelId = panelMap[barId];
        btn.addEventListener('click', () => {
            togglePanel(panelId);
        });
    });

    // ----- 设置面板 Tab 页签切换 -----
    initSettingsTabs();

    // ----- 面板标题栏点击切换 -----
    document.querySelectorAll('.panel-header').forEach(header => {
        const panelBox = header.closest('.panel-box');
        if (!panelBox) return;
        header.removeEventListener('click', header._panelToggleHandler);
        const handler = function(e) {
            if (e.target.closest('.min-btn, .panel-close-btn')) return;
            togglePanel(panelBox.id);
        };
        header._panelToggleHandler = handler;
        header.addEventListener('click', handler);
    });

    // ----- 面板关闭按钮（✕）-----
    document.querySelectorAll('.panel-close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const panelBox = btn.closest('.panel-box');
            if (panelBox) setPanelVisible(panelBox.id, false);
        });
    });

    // ----- 恢复面板状态（默认关闭） -----
    initPanelVisibility();

    // ----- 拖拽功能 -----
    const bar = document.getElementById('bottom-bar');
    const dragHandle = document.querySelector('.bar-drag-handle');
    if (!bar || !dragHandle) return;

    let isDragging = false;
    let startMouseX = 0, startMouseY = 0;
    let startOffsetX = 0, startOffsetY = 0;

    dragHandle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isDragging = true;
        startMouseX = e.clientX;
        startMouseY = e.clientY;
        startOffsetX = barOffsetX;
        startOffsetY = barOffsetY;
        document.body.style.cursor = 'grabbing';
        dragHandle.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startMouseX;
        const dy = e.clientY - startMouseY;
        barOffsetX = startOffsetX + dx;
        barOffsetY = startOffsetY + dy;
        applyBarPosition();
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            document.body.style.cursor = '';
            dragHandle.style.cursor = 'grab';
            saveBarPosition();
        }
    });

    window.addEventListener('resize', () => {
        const rect = bar.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;
        if (barOffsetX < -rect.width / 2) barOffsetX = -rect.width / 2 + 10;
        if (barOffsetX > window.innerWidth - rect.width / 2 - 10) barOffsetX = window.innerWidth - rect.width / 2 - 10;
        if (barOffsetY < -rect.height + 10) barOffsetY = -rect.height + 10;
        if (barOffsetY > window.innerHeight - 10) barOffsetY = window.innerHeight - 10;
        applyBarPosition();
        saveBarPosition();
    });
}

// ==================== 设置面板 Tab 切换 ====================
function initSettingsTabs() {
    const tabBar = document.getElementById('settings-tab-bar');
    if (!tabBar) return;
    tabBar.addEventListener('click', (e) => {
        const tab = e.target.closest('.settings-tab');
        if (!tab) return;
        const tabId = tab.dataset.tab;
        if (!tabId) return;
        tabBar.querySelectorAll('.settings-tab').forEach(t => {
            t.classList.toggle('active', t === tab);
        });
        document.querySelectorAll('.settings-pane').forEach(pane => {
            pane.classList.toggle('active', pane.id === tabId);
        });
    });
}

// ==================== 画布小手功能 ====================
function initCanvasPan() {
    const panStyle = document.createElement('style');
    panStyle.innerHTML = `
        body.canvas-mode-active {
            cursor: grab;
            user-select: none !important;
            -webkit-user-select: none !important;
        }
        body.canvas-mode-active.is-panning {
            cursor: grabbing !important;
        }
        body.canvas-mode-active .code-block-wrapper, 
        body.canvas-mode-active code, 
        body.canvas-mode-active pre,
        body.canvas-mode-active input, 
        body.canvas-mode-active select, 
        body.canvas-mode-active button, 
        body.canvas-mode-active textarea, 
        body.canvas-mode-active a,
        body.canvas-mode-active .panel-box, 
        body.canvas-mode-active #code-lightbox-overlay, 
        body.canvas-mode-active #lightbox-overlay {
            cursor: auto;
            user-select: auto !important;
            -webkit-user-select: auto !important;
        }
        body.canvas-mode-active button, 
        body.canvas-mode-active select, 
        body.canvas-mode-active a, 
        body.canvas-mode-active input[type="range"], 
        body.canvas-mode-active input[type="checkbox"], 
        body.canvas-mode-active .tree-toggle, 
        body.canvas-mode-active .toc-toggle,
        body.canvas-mode-active .switch {
            cursor: pointer;
        }
        body.canvas-mode-active .code-lines, 
        body.canvas-mode-active code:not(pre code) {
            cursor: text;
        }
    `;
    document.head.appendChild(panStyle);

    let isCanvasActiveBase = localStorage.getItem('blog-canvas-toggle') === 'true';
    let isAltPressed = false;
    let isPanning = false;
    let startX = 0, startY = 0;
    let startPercent = 0;
    let startScrollTop = 0;

    const getEffectiveCanvasState = () => {
        return isAltPressed ? !isCanvasActiveBase : isCanvasActiveBase;
    };

    const updateCanvasUI = () => {
        const active = getEffectiveCanvasState();
        if (active) {
            document.body.classList.add('canvas-mode-active');
        } else {
            document.body.classList.remove('canvas-mode-active');
        }
    };

    const toggleInput = document.getElementById('canvas-toggle');
    if (toggleInput) {
        toggleInput.checked = isCanvasActiveBase;
        toggleInput.addEventListener('change', (e) => {
            isCanvasActiveBase = e.target.checked;
            localStorage.setItem('blog-canvas-toggle', isCanvasActiveBase);
            updateCanvasUI();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Alt' && !e.repeat) {
            e.preventDefault();
            isAltPressed = true;
            updateCanvasUI();
        }
    });
    document.addEventListener('keyup', (e) => {
        if (e.key === 'Alt') {
            e.preventDefault();
            isAltPressed = false;
            updateCanvasUI();
        }
    });
    window.addEventListener('blur', () => {
        if (isAltPressed) {
            isAltPressed = false;
            updateCanvasUI();
        }
    });

    document.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        if (!getEffectiveCanvasState()) return;
        if (e.target.closest('.code-block-wrapper, code, pre, input, select, button, textarea, a, .panel-box, .lightbox-overlay, .code-lightbox-overlay')) {
            return;
        }
        const slider = document.getElementById('position-slider');
        if (!slider) return;
        isPanning = true;
        startX = e.clientX;
        startY = e.clientY;
        startPercent = parseInt(slider.value) || 0;
        startScrollTop = window.scrollY || document.documentElement.scrollTop;
        document.body.classList.add('is-panning');
    });

    document.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        e.preventDefault();
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        window.scrollTo({
            top: startScrollTop - dy,
            behavior: 'instant'
        });
        const wrapper = document.getElementById('article-wrapper');
        const slider = document.getElementById('position-slider');
        if (wrapper && slider) {
            const maxShift = (window.innerWidth - wrapper.offsetWidth) / 2;
            const denom = Math.abs(maxShift) > 20 ? maxShift : (window.innerWidth / 2);
            const deltaPercent = (dx / denom) * 100;
            const minVal = slider.min ? parseInt(slider.min) : -100;
            const maxVal = slider.max ? parseInt(slider.max) : 100;
            let newPercent = Math.round(startPercent + deltaPercent);
            newPercent = Math.max(minVal, Math.min(maxVal, newPercent));
            slider.value = newPercent;
            updatePosition();
        }
    });

    const stopPanning = () => {
        if (isPanning) {
            isPanning = false;
            document.body.classList.remove('is-panning');
        }
    };
    document.addEventListener('mouseup', stopPanning);
    updateCanvasUI();
}

// ==================== 图片 Lightbox ====================
function initImageLightbox() {
    if (!document.getElementById('lightbox-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'lightbox-overlay';
        overlay.className = 'lightbox-overlay';
        overlay.innerHTML = `
            <div class="lightbox-content">
                <span class="lightbox-close" id="lightbox-close">&times;</span>
                <img class="lightbox-img" id="lightbox-img" src="" alt="放大视图">
                <div class="lightbox-caption" id="lightbox-caption"></div>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    const overlay = document.getElementById('lightbox-overlay');
    const imgEl = document.getElementById('lightbox-img');
    const captionEl = document.getElementById('lightbox-caption');
    const closeBtn = document.getElementById('lightbox-close');
    const closeLightbox = () => {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    };
    const article = document.getElementById('article-container');
    if (article) {
        article.addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG') {
                imgEl.src = e.target.src;
                captionEl.innerText = e.target.alt || e.target.title || '';
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    }
    closeBtn.addEventListener('click', closeLightbox);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.classList.contains('lightbox-content')) {
            closeLightbox();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeLightbox();
        }
    });
}

// ==================== 明暗主题切换 ====================

function getCurrentThemeMode() {
    return localStorage.getItem('blog-theme-mode') || 'light';
}

function applyThemeMode(mode) {
    let themeName;
    if (mode === 'dark') {
        themeName = localStorage.getItem('last-dark-theme') || 'lightmind-dark';
    } else {
        themeName = localStorage.getItem('last-light-theme') || 'lightmind';
    }

    const currentTheme = localStorage.getItem('blog-reader-theme') || 'lightmind';
    if (currentTheme === themeName) {
        localStorage.setItem('blog-theme-mode', mode);
    }

    applyReaderTheme(themeName);
    localStorage.setItem('blog-theme-mode', mode);
    localStorage.setItem('blog-reader-theme', themeName);

    const themeBtn = document.getElementById('bar-theme');
    if (themeBtn) {
        themeBtn.classList.toggle('active', mode === 'dark');
        themeBtn.querySelector('.bar-icon').textContent = mode === 'dark' ? '🌙' : '☀️';
        themeBtn.querySelector('.bar-label').textContent = mode === 'dark' ? '暗色' : '亮色';
    }

    const isDark = mode === 'dark';
    const lightSelect = document.getElementById('light-theme-select');
    const darkSelect = document.getElementById('dark-theme-select');
    // custom 选项已移除：仅当下拉中存在该值时才选中，否则回退到默认主题
    const setSelectIfValid = (sel, val, fallback) => {
        if (!sel) return;
        if (val && Array.from(sel.options).some(o => o.value === val)) {
            sel.value = val;
        } else {
            sel.value = fallback;
        }
    };
    if (isDark) {
        setSelectIfValid(darkSelect, themeName, 'lightmind-dark');
    } else {
        setSelectIfValid(lightSelect, themeName, 'lightmind');
    }

    if (themeName === 'custom') {
        const theme = readerThemeMap.custom;
        const cText = document.getElementById('color-text');
        const cBg = document.getElementById('color-bg');
        if (cText) cText.value = theme.text;
        if (cBg) cBg.value = theme.bg;
        applyCustomReaderColors(theme.text, theme.bg);
    }
}

function toggleThemeMode() {
    const current = getCurrentThemeMode();
    const next = current === 'dark' ? 'light' : 'dark';
    applyThemeMode(next);
}

function initThemeMode() {
    const currentTheme = localStorage.getItem('blog-reader-theme') || 'lightmind';
    const isDark = currentTheme.includes('dark');
    const mode = isDark ? 'dark' : 'light';
    localStorage.setItem('blog-theme-mode', mode);
    const themeBtn = document.getElementById('bar-theme');
    if (themeBtn) {
        themeBtn.classList.toggle('active', isDark);
        themeBtn.querySelector('.bar-icon').textContent = isDark ? '🌙' : '☀️';
        themeBtn.querySelector('.bar-label').textContent = isDark ? '暗色' : '亮色';
    }
    if (isDark) {
        localStorage.setItem('last-dark-theme', currentTheme);
    } else {
        localStorage.setItem('last-light-theme', currentTheme);
    }
}

// ==================== 默认配置切换 ====================

const FONT_GROUPS = ['heading', 'body', 'code', 'link', 'quote'];

function getDefaultFontSettings() {
    const defaults = {};
    FONT_GROUPS.forEach(g => {
        defaults[g] = { mono: false, serif: false, family: 'inherit' };
    });
    return defaults;
}

function readFontSettingsFromStorage() {
    const fonts = {};
    FONT_GROUPS.forEach(g => {
        fonts[g] = {
            mono: localStorage.getItem(`font-${g}-mono`) === 'on',
            serif: localStorage.getItem(`font-${g}-serif`) === 'on',
            family: localStorage.getItem(`font-${g}-family`) || 'inherit'
        };
    });
    return fonts;
}

function writeFontSettingsToStorage(fonts) {
    FONT_GROUPS.forEach(g => {
        const s = (fonts && fonts[g]) || {};
        localStorage.setItem(`font-${g}-mono`, s.mono ? 'on' : 'off');
        localStorage.setItem(`font-${g}-serif`, s.serif ? 'on' : 'off');
        localStorage.setItem(`font-${g}-family`, s.family || 'inherit');
    });
}

function getDefaultConfig() {
    return {
        readerTheme: 'lightmind',
        lightTheme: 'lightmind',
        darkTheme: 'lightmind-dark',
        codeFormat: 'global',
        codeTheme: 'global',
        codeInlineTheme: 'global',
        codeInlineOffset: -2,
        codeInlinePad: 1,
        codeBlockSize: 14,
        codeLineNumbers: true,
        codeHeader: false,
        tableFormat: 'adaptive',
        tableShowHeader: false,
        quoteStyle: 'global',
        pageWidth: 0, // 0 = 自动（37 汉字宽）
        fontSize: 18,
        lineHeight: 1.4,
        position: 0,
        cText: '#222222',
        cBg: '#fbfbfb',
        fonts: getDefaultFontSettings(),
    };
}




// 收集当前散键状态为配置对象（所有设置变更实时写散键，这里读取即为当前 UI 状态）


// 把配置对象写回散键并刷新 UI


function applyDefaultConfig() {
    suppressSave = true; // 出厂重置期间不触发写时保存（config.js 的 CoW）
    try {
    const def = getDefaultConfig();
    // 主题跟随当前底部 bar 的亮/暗模式（默认主题 lightmind / lightmind-dark）
    const mode = localStorage.getItem('blog-theme-mode') === 'dark' ? 'dark' : 'light';
    localStorage.setItem('blog-reader-theme', mode === 'dark' ? def.darkTheme : def.readerTheme);
    localStorage.setItem('last-light-theme', def.lightTheme);
    localStorage.setItem('last-dark-theme', def.darkTheme);
    localStorage.setItem('blog-theme-mode', mode);
    localStorage.setItem('blog-code-format', def.codeFormat);
    localStorage.setItem('blog-code-theme', def.codeTheme);
    localStorage.setItem('blog-code-inline-theme', def.codeInlineTheme);
    localStorage.setItem('blog-code-inline-offset', String(def.codeInlineOffset));
    localStorage.setItem('blog-code-inline-pad', String(def.codeInlinePad));
    localStorage.setItem('blog-code-block-size', String(def.codeBlockSize));
    localStorage.setItem('blog-code-line-numbers', def.codeLineNumbers ? 'on' : 'off');
    localStorage.setItem('blog-code-header', def.codeHeader ? 'on' : 'off');
    localStorage.setItem('table-format', def.tableFormat);
    localStorage.setItem('table-show-header', def.tableShowHeader ? 'true' : 'false');
    localStorage.setItem('quote-style', def.quoteStyle);
    // 版面宽度：0 = 自动（37 汉字宽 = 74 英文字符）；否则用存储值
    const autoWidth = Math.round(37 * (def.fontSize || 18));
    localStorage.setItem('blog-width', String(def.pageWidth > 0 ? def.pageWidth : autoWidth));
    localStorage.setItem('blog-size', String(def.fontSize));
    localStorage.setItem('blog-line', String(def.lineHeight));
    localStorage.setItem('blog-pos', String(def.position));
    localStorage.setItem('blog-ctext', def.cText);
    localStorage.setItem('blog-cbg', def.cBg);
    writeFontSettingsToStorage(def.fonts);
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith('table-format-override-')) {
            localStorage.removeItem(key);
        }
    });
    restoreSavedSettings();
    location.reload();
    } finally {
        suppressSave = false;
    }
}



// 保存当前状态到指定配置槽（default 为出厂只读，不保存）


// 加载配置槽：default → 出厂；userN → 槽内容（空槽 → 出厂起点）


// 切换配置方案：先保存旧槽，再加载新槽












// ==================== 导出全局 ====================
window.initBottomBar = initBottomBar;
window.togglePanel = togglePanel;
window.setPanelVisible = setPanelVisible;
window.initPanelVisibility = initPanelVisibility;
window.loadBarPosition = loadBarPosition;
window.saveBarPosition = saveBarPosition;
window.applyBarPosition = applyBarPosition;
window.initThemeMode = initThemeMode;
window.applyThemeMode = applyThemeMode;
window.toggleThemeMode = toggleThemeMode;
window.getCurrentThemeMode = getCurrentThemeMode;
window.updateBatchButtons = updateBatchButtons;
window.toggleAllPanels = toggleAllPanels;
window.areAllPanelsVisible = areAllPanelsVisible;
window.getPanelIdsBySide = getPanelIdsBySide;
