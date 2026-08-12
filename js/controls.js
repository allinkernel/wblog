// ==================== 控件绑定与设置管理 ====================

const fontValueMap = {
    'inherit': 'inherit',
    'sans-prop': 'var(--font-stack-sans-prop)',
    'serif-prop': 'var(--font-stack-serif-prop)',
    'sans-mono': 'var(--font-stack-sans-mono)',
    'serif-mono': 'var(--font-stack-serif-mono)'
};

const radioVarMap = {
    'font-body': '--font-body',
    'font-code': '--font-code',
    'font-heading': '--font-heading',
    'font-link': '--font-link',
    'font-quote': '--font-quote'
};

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
    const readerThemeSelect = document.getElementById('reader-theme-select');
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

    // ----- 字体矩阵（radio）-----
    document.querySelector('.font-matrix-table')?.addEventListener('change', (e) => {
        if (e.target.type === 'radio') {
            const groupName = e.target.name;
            const fontType = e.target.value;
            const varName = radioVarMap[groupName];
            if (varName && fontValueMap[fontType]) {
                root.style.setProperty(varName, fontValueMap[fontType]);
                localStorage.setItem(`matrix-${groupName}`, fontType);
            }
        }
    });

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
        if (readerThemeSelect) readerThemeSelect.value = 'custom';
        localStorage.setItem('blog-reader-theme', 'custom');
        // 自定义颜色视为亮色（因为用户可自由选择，但默认我们将其归类为亮色）
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
        if (readerThemeSelect) readerThemeSelect.value = 'custom';
        localStorage.setItem('blog-reader-theme', 'custom');
        // 自定义颜色视为亮色
        localStorage.setItem('last-light-theme', 'custom');
        localStorage.setItem('blog-theme-mode', 'light');
        const themeBtn = document.getElementById('bar-theme');
        if (themeBtn) {
            themeBtn.classList.remove('active');
            themeBtn.querySelector('.bar-icon').textContent = '☀️';
            themeBtn.querySelector('.bar-label').textContent = '亮色';
        }
    });

    // ----- 阅读主题下拉 -----
    readerThemeSelect?.addEventListener('change', (e) => {
        const themeName = e.target.value || 'custom';
        applyReaderTheme(themeName);
        localStorage.setItem('blog-reader-theme', themeName);
        const theme = readerThemeMap[themeName] || readerThemeMap.custom;
        if (cText) cText.value = theme.text;
        if (cBg) cBg.value = theme.bg;

        // ----- 同步底部明暗按钮状态 + 保存最近使用的亮色/暗色主题 -----
        const isDarkTheme = themeName.includes('dark');
        if (isDarkTheme) {
            // 保存为最近使用的暗色主题
            localStorage.setItem('last-dark-theme', themeName);
            localStorage.setItem('blog-theme-mode', 'dark');
            const themeBtn = document.getElementById('bar-theme');
            if (themeBtn) {
                themeBtn.classList.add('active');
                themeBtn.querySelector('.bar-icon').textContent = '🌙';
                themeBtn.querySelector('.bar-label').textContent = '暗色';
            }
        } else {
            // 保存为最近使用的亮色主题（除了 'custom'，它已在前面处理）
            if (themeName !== 'custom') {
                localStorage.setItem('last-light-theme', themeName);
            }
            localStorage.setItem('blog-theme-mode', 'light');
            const themeBtn = document.getElementById('bar-theme');
            if (themeBtn) {
                themeBtn.classList.remove('active');
                themeBtn.querySelector('.bar-icon').textContent = '☀️';
                themeBtn.querySelector('.bar-label').textContent = '亮色';
            }
        }
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

    // ----- 引用样式 -----
    quoteStyleSelect?.addEventListener('change', (e) => {
        if (article) article.setAttribute('data-quote-style', e.target.value);
        localStorage.setItem('blog-quote-style', e.target.value);
    });

    // ----- 表格显示格式 -----
    if (tableFormatSelect) {
        tableFormatSelect.addEventListener('change', (e) => {
            const format = e.target.value;
            localStorage.setItem('table-format', format);
            applyGlobalTableFormat(format);
        });
    }

    // ----- 隐藏标题栏 -----
    if (tableHeaderToggle) {
        tableHeaderToggle.addEventListener('change', (e) => {
            const show = e.target.checked;
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
    const readerThemeSelect = document.getElementById('reader-theme-select');
    const codeFormatSelect = document.getElementById('code-format-select');
    const codeThemeSelect = document.getElementById('code-theme-select');
    const codeInlineThemeSelect = document.getElementById('code-inline-theme-select');
    const codeInlineSlider = document.getElementById('code-inline-slider');
    const codeInlinePadSlider = document.getElementById('code-inline-pad-slider');
    const codeBlockSlider = document.getElementById('code-block-slider');
    const codeLineNumbersToggle = document.getElementById('code-line-numbers-toggle');
    const codeHeaderToggle = document.getElementById('code-header-toggle');
    const quoteStyleSelect = document.getElementById('quote-style-select');
    const tableFormatSelect = document.getElementById('table-format-select');
    const tableHeaderToggle = document.getElementById('table-header-toggle');

    const savedWidth = localStorage.getItem('blog-width');
    const savedSize = localStorage.getItem('blog-size');
    const savedPos = localStorage.getItem('blog-pos');
    const savedLine = localStorage.getItem('blog-line');
    const savedCText = localStorage.getItem('blog-ctext');
    const savedCBg = localStorage.getItem('blog-cbg');
    const savedReaderTheme = localStorage.getItem('blog-reader-theme') || 'github-light';

    const savedCodeFormat = localStorage.getItem('blog-code-format') || 'scroll';
    const savedCodeTheme = localStorage.getItem('blog-code-theme') || 'global';
    const savedCodeInlineTheme = localStorage.getItem('blog-code-inline-theme') || 'global';
    const savedCodeInlineOffset = localStorage.getItem('blog-code-inline-offset') ?? '-2';
    const savedCodeInlinePad = localStorage.getItem('blog-code-inline-pad') ?? '2';
    const savedCodeBlockSize = localStorage.getItem('blog-code-block-size');
    const savedCodeLineNumbers = localStorage.getItem('blog-code-line-numbers') || 'on';
    const savedCodeHeader = localStorage.getItem('blog-code-header') || 'on';
    const savedQuoteStyle = localStorage.getItem('blog-quote-style') || 'global';

    const savedTableFormat = localStorage.getItem('table-format') || 'adaptive';
    const savedTableShowHeader = localStorage.getItem('table-show-header') !== 'false';

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
    applyReaderTheme(savedReaderTheme);
    if (readerThemeSelect) readerThemeSelect.value = savedReaderTheme;

    if (savedReaderTheme === 'custom') {
        const customText = savedCText || '#222222';
        const customBg = savedCBg || '#fbfbfb';
        if (cText) cText.value = customText;
        if (cBg) cBg.value = customBg;
        applyCustomReaderColors(customText, customBg);
        // 自定义颜色视为亮色
        localStorage.setItem('last-light-theme', 'custom');
        localStorage.setItem('blog-theme-mode', 'light');
    } else {
        const savedTheme = readerThemeMap[savedReaderTheme] || readerThemeMap.custom;
        if (cText) cText.value = savedTheme.text;
        if (cBg) cBg.value = savedTheme.bg;
        // 保存最近使用的主题
        const isDark = savedReaderTheme.includes('dark');
        if (isDark) {
            localStorage.setItem('last-dark-theme', savedReaderTheme);
            localStorage.setItem('blog-theme-mode', 'dark');
        } else {
            localStorage.setItem('last-light-theme', savedReaderTheme);
            localStorage.setItem('blog-theme-mode', 'light');
        }
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
    if (codeLineNumbersToggle) codeLineNumbersToggle.checked = savedCodeLineNumbers !== 'off';
    if (codeHeaderToggle) codeHeaderToggle.checked = savedCodeHeader !== 'off';

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

    // ----- 恢复字体矩阵 radio -----
    const fontTable = document.querySelector('.font-matrix-table');
    if (fontTable) {
        Object.keys(radioVarMap).forEach((groupName) => {
            const savedValue = localStorage.getItem(`matrix-${groupName}`);
            let targetRadio = null;
            if (savedValue) {
                targetRadio = fontTable.querySelector(`input[name="${groupName}"][value="${savedValue}"]`);
            }
            if (!targetRadio) {
                targetRadio = fontTable.querySelector(`input[name="${groupName}"]:checked`);
            }
            if (targetRadio) {
                targetRadio.checked = true;
                const fontType = targetRadio.value;
                if (fontValueMap[fontType]) {
                    root.style.setProperty(radioVarMap[groupName], fontValueMap[fontType]);
                }
            }
        });
    }

    // ----- 恢复表格设置 -----
    if (tableFormatSelect) {
        tableFormatSelect.value = savedTableFormat;
    }
    if (tableHeaderToggle) {
        tableHeaderToggle.checked = savedTableShowHeader;
    }

    setTimeout(() => {
        applyGlobalTableFormat(savedTableFormat);
        applyGlobalTableHeader(savedTableShowHeader);
    }, 100);

    // ----- 恢复主题按钮状态 -----
    const currentTheme = localStorage.getItem('blog-reader-theme') || 'github-light';
    const isDark = currentTheme.includes('dark');
    const themeBtn = document.getElementById('bar-theme');
    if (themeBtn) {
        themeBtn.classList.toggle('active', isDark);
        themeBtn.querySelector('.bar-icon').textContent = isDark ? '🌙' : '☀️';
        themeBtn.querySelector('.bar-label').textContent = isDark ? '暗色' : '亮色';
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
window.updatePosition = updatePosition;
window.formatInlineSize = formatInlineSize;
