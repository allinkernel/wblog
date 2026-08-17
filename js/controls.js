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

// 五个文本元素 -> CSS 变量映射
const fontGroupMap = {
    'heading': '--font-heading',
    'body': '--font-body',
    'code': '--font-code',
    'link': '--font-link',
    'quote': '--font-quote'
};

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

// 恢复（并迁移旧版字体矩阵设置）
function restoreFontRegions() {
    const groups = ['heading', 'body', 'code', 'link', 'quote'];
    const hasOldMatrix = localStorage.getItem('matrix-font-body') !== null;

    groups.forEach(group => {
        const region = document.querySelector(`.font-region[data-font-group="${group}"]`);
        if (!region) return;
        const monoToggle = region.querySelector('.font-mono-toggle');
        const serifToggle = region.querySelector('.font-serif-toggle');
        const familySelect = region.querySelector('.font-family-select');

        // 旧版字体矩阵迁移（仅在无新版设置时执行一次）
        if (hasOldMatrix && !localStorage.getItem(`font-${group}-family`)) {
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
    const savedTheme = localStorage.getItem('blog-reader-theme') || 'github-light';
    // 日间/夜间主题选择器的默认值：根据当前主题是亮还是暗决定
    const isDark = savedTheme.includes('dark');
    const defaultLightTheme = localStorage.getItem('last-light-theme') || 'github-light';
    const defaultDarkTheme = localStorage.getItem('last-dark-theme') || 'github-dark';

    // 代码默认设置
    const savedCodeFormat = localStorage.getItem('blog-code-format') || 'global';
    const savedCodeTheme = localStorage.getItem('blog-code-theme') || 'global';
    const savedCodeInlineTheme = localStorage.getItem('blog-code-inline-theme') || 'global';
    const savedCodeInlineOffset = localStorage.getItem('blog-code-inline-offset') ?? '-2';
    const savedCodeInlinePad = localStorage.getItem('blog-code-inline-pad') ?? '2';
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
        const theme = readerThemeMap[savedTheme] || readerThemeMap['github-light'];
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
        lightThemeSelect.value = resolveSelectValue(lightThemeSelect, isDark ? defaultLightTheme : savedTheme, 'github-light');
    }
    if (darkThemeSelect) {
        darkThemeSelect.value = resolveSelectValue(darkThemeSelect, isDark ? savedTheme : defaultDarkTheme, 'github-dark');
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
window.updatePosition = updatePosition;
window.formatInlineSize = formatInlineSize;
