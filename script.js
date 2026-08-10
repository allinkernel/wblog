const root = document.documentElement;

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

/* 正文阅读主题：只设置阅读层 Token；代码块/行内代码/引用可以选择独立主题。 */
const readerThemeMap = {
    'custom': {text:'#222222', bg:'#fbfbfb', surface:'#ffffff', surface2:'#f6f8fa', border:'#d0d7de', muted:'#57606a', link:'#0969da', hover:'#0550ae', accent:'#1890ff', quoteBg:'rgba(0,0,0,.03)', quoteBorder:'#d0d7de', quoteMark:'rgba(0,0,0,.22)'},
    'github-light': {text:'#1f2328', bg:'#ffffff', surface:'#ffffff', surface2:'#f6f8fa', border:'#d0d7de', muted:'#57606a', link:'#0969da', hover:'#0550ae', accent:'#0969da', quoteBg:'#f6f8fa', quoteBorder:'#d0d7de', quoteMark:'rgba(31,35,40,.22)'},
    'github-dark': {text:'#c9d1d9', bg:'#0d1117', surface:'#161b22', surface2:'#21262d', border:'#30363d', muted:'#8b949e', link:'#58a6ff', hover:'#79c0ff', accent:'#58a6ff', quoteBg:'rgba(56,139,253,.12)', quoteBorder:'#3b82f6', quoteMark:'rgba(201,209,217,.25)'},
    'claude-light': {text:'#3f3a36', bg:'#f7f4ee', surface:'#fbf9f5', surface2:'#eee9df', border:'#d9d1c5', muted:'#766d63', link:'#a75d32', hover:'#874621', accent:'#c66a3d', quoteBg:'#eee9df', quoteBorder:'#cfa98d', quoteMark:'rgba(92,69,53,.22)'},
    'claude-dark': {text:'#e8e1d9', bg:'#1f1d1a', surface:'#292622', surface2:'#332e29', border:'#4a433c', muted:'#a99f95', link:'#e0a27d', hover:'#f0b898', accent:'#d88b63', quoteBg:'rgba(216,139,99,.10)', quoteBorder:'#9b6a51', quoteMark:'rgba(232,225,217,.24)'},
    'notion-light': {text:'#37352f', bg:'#ffffff', surface:'#ffffff', surface2:'#f7f6f3', border:'#e6e6e3', muted:'#787774', link:'#2383e2', hover:'#1b6fbe', accent:'#2383e2', quoteBg:'#f7f6f3', quoteBorder:'#cfcfcb', quoteMark:'rgba(55,53,47,.22)'},
    'solarized-light': {text:'#657b83', bg:'#fdf6e3', surface:'#eee8d5', surface2:'#f6f0dc', border:'#d8cfb4', muted:'#93a1a1', link:'#268bd2', hover:'#2074b0', accent:'#b58900', quoteBg:'rgba(238,232,213,.75)', quoteBorder:'#93a1a1', quoteMark:'rgba(101,123,131,.25)'},
    'solarized-dark': {text:'#839496', bg:'#002b36', surface:'#073642', surface2:'#0a3b47', border:'#28535d', muted:'#657b83', link:'#2aa198', hover:'#5fcfc4', accent:'#b58900', quoteBg:'rgba(7,54,66,.8)', quoteBorder:'#586e75', quoteMark:'rgba(131,148,150,.25)'},
    'dracula': {text:'#f8f8f2', bg:'#282a36', surface:'#21222c', surface2:'#343746', border:'#44475a', muted:'#a5a8bd', link:'#8be9fd', hover:'#b6f3ff', accent:'#bd93f9', quoteBg:'rgba(189,147,249,.10)', quoteBorder:'#6272a4', quoteMark:'rgba(248,248,242,.24)'},
    'stack-overflow': {text:'#232629', bg:'#ffffff', surface:'#ffffff', surface2:'#f1f2f3', border:'#d6d9dc', muted:'#6a737c', link:'#0077cc', hover:'#005999', accent:'#f48024', quoteBg:'#f1f2f3', quoteBorder:'#d6d9dc', quoteMark:'rgba(35,38,41,.22)'},
    'catppuccin-latte': {text:'#4c4f69', bg:'#eff1f5', surface:'#e6e9ef', surface2:'#e6e9ef', border:'#ccd0da', muted:'#7c7f93', link:'#1e66f5', hover:'#1250c7', accent:'#8839ef', quoteBg:'rgba(136,57,239,.08)', quoteBorder:'#b4befe', quoteMark:'rgba(76,79,105,.22)'},
    'catppuccin-mocha': {text:'#cdd6f4', bg:'#1e1e2e', surface:'#181825', surface2:'#313244', border:'#45475a', muted:'#a6adc8', link:'#89b4fa', hover:'#b4d0ff', accent:'#cba6f7', quoteBg:'rgba(203,166,247,.10)', quoteBorder:'#585b70', quoteMark:'rgba(205,214,244,.24)'},
    'nord': {text:'#d8dee9', bg:'#2e3440', surface:'#3b4252', surface2:'#434c5e', border:'#4c566a', muted:'#8fbcbb', link:'#88c0d0', hover:'#a3d7e3', accent:'#81a1c1', quoteBg:'rgba(136,192,208,.10)', quoteBorder:'#5e81ac', quoteMark:'rgba(216,222,233,.24)'},
    'texi2html': {text:'#000000', bg:'#ffffff', surface:'#ffffff', surface2:'#ffffff', border:'#c8c8c8', muted:'#555555', link:'#0000ee', hover:'#551a8b', accent:'#000000', quoteBg:'transparent', quoteBorder:'#000000', quoteMark:'rgba(0,0,0,.22)'}
};

function setReaderThemeVariables(theme) {
    root.style.setProperty('--text-color', theme.text);
    root.style.setProperty('--bg-color', theme.bg);
    root.style.setProperty('--theme-surface', theme.surface);
    root.style.setProperty('--theme-surface-2', theme.surface2);
    root.style.setProperty('--theme-border', theme.border);
    root.style.setProperty('--theme-muted', theme.muted);
    root.style.setProperty('--theme-link', theme.link);
    root.style.setProperty('--theme-link-hover', theme.hover);
    root.style.setProperty('--theme-accent', theme.accent);
    root.style.setProperty('--theme-quote-bg', theme.quoteBg);
    root.style.setProperty('--theme-quote-border', theme.quoteBorder);
    root.style.setProperty('--theme-quote-mark', theme.quoteMark);
}

function applyReaderTheme(themeName) {
    const article = document.getElementById('article-container');
    const theme = readerThemeMap[themeName] || readerThemeMap.custom;
    if (!article) return;
    article.setAttribute('data-reader-theme', themeName);
    setReaderThemeVariables(theme);
}

function hexToRgb(hex) {
    const m = String(hex || '').replace('#','').match(/^([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!m) return null;
    const h = m[1].length === 3 ? m[1].split('').map(x => x + x).join('') : m[1];
    return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16) };
}

function mixHex(a, b, amount) {
    const x = hexToRgb(a), y = hexToRgb(b);
    if (!x || !y) return a;
    const t = Math.max(0, Math.min(1, amount));
    const c = k => Math.round(x[k] * (1-t) + y[k] * t).toString(16).padStart(2,'0');
    return `#${c('r')}${c('g')}${c('b')}`;
}

function applyCustomReaderColors(text, bg) {
    const rgb = hexToRgb(bg);
    const dark = rgb ? (0.299*rgb.r + 0.587*rgb.g + 0.114*rgb.b) < 150 : false;
    const surface = dark ? mixHex(bg, '#ffffff', 0.055) : mixHex(bg, '#ffffff', 0.72);
    const surface2 = dark ? mixHex(bg, '#ffffff', 0.10) : mixHex(bg, '#000000', 0.035);
    const border = dark ? mixHex(bg, '#ffffff', 0.18) : mixHex(bg, '#000000', 0.14);
    const muted = dark ? mixHex(text, bg, 0.48) : mixHex(text, bg, 0.52);
    const link = dark ? '#66b3ff' : '#0969da';
    const hover = dark ? '#8bc7ff' : '#0550ae';
    const accent = dark ? '#8ab4ff' : '#1890ff';
    const quoteBorder = dark ? mixHex(link, bg, 0.35) : mixHex(link, bg, 0.45);
    const quoteBg = dark ? `rgba(102,179,255,.10)` : `rgba(0,0,0,.035)`;
    const quoteMark = dark ? 'rgba(255,255,255,.24)' : 'rgba(0,0,0,.22)';
    const theme = {text, bg, surface, surface2, border, muted, link, hover, accent, quoteBg, quoteBorder, quoteMark};
    setReaderThemeVariables(theme);
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

function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    } else {
        return new Promise((resolve, reject) => {
            try {
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                textArea.style.top = "-9999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                if (successful) resolve();
                else reject(new Error("execCommand 复制失败"));
            } catch (err) {
                reject(err);
            }
        });
    }
}

/* ==========================================================================
   🖐️ 可控 PDF 风格画布小手平移功能 (Canvas Pan Tool + Alt 键反转)
   ========================================================================== */
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

function makeReadOnlyEditable(el) {
    if (!el) return;
    el.setAttribute('contenteditable', 'true');
    el.setAttribute('spellcheck', 'false');
    el.setAttribute('tabindex', '0');

    el.addEventListener('beforeinput', (e) => e.preventDefault());
    el.addEventListener('paste', (e) => e.preventDefault());
    el.addEventListener('drop', (e) => e.preventDefault());
}

function enhanceAllCode() {
    const article = document.getElementById('article-container');
    if (!article) return;

    const targets = article.querySelectorAll('code:not(pre code), .code-lines');
    targets.forEach(el => {
        makeReadOnlyEditable(el);
    });
}

function initCodeSelectAll() {
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
            const selection = window.getSelection();
            if (!selection || !selection.rangeCount) return;

            const anchorNode = selection.anchorNode;
            if (!anchorNode) return;

            const element = anchorNode.nodeType === Node.ELEMENT_NODE ? anchorNode : anchorNode.parentElement;
            const codeWrapper = element?.closest('.code-block-wrapper, .code-lightbox-content');

            if (codeWrapper) {
                const targetContainer = codeWrapper.querySelector('.code-lines') || codeWrapper.querySelector('.code-lightbox-body');
                
                if (targetContainer) {
                    e.preventDefault();

                    const range = document.createRange();
                    range.selectNodeContents(targetContainer);

                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }
        }
    });
}

function initCodeLightbox() {
    if (document.getElementById('code-lightbox-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'code-lightbox-overlay';
    overlay.className = 'code-lightbox-overlay';
    overlay.innerHTML = `
        <div class="code-lightbox-content" id="code-lightbox-content">
            <div class="code-lightbox-header">
                <span class="code-lightbox-title" id="code-lightbox-title">CODE</span>
                <div class="code-lightbox-actions">
                    <button class="copy-code-btn" id="code-lightbox-copy-btn">复制</button>
                    <span class="code-lightbox-close" id="code-lightbox-close">&times;</span>
                </div>
            </div>
            <div class="code-lightbox-body" id="code-lightbox-body"></div>
        </div>
    `;
    document.body.appendChild(overlay);

    const closeBtn = document.getElementById('code-lightbox-close');
    const closeLightbox = () => {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    closeBtn.addEventListener('click', closeLightbox);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeLightbox();
        }
    });
}

function openCodeLightbox(lang, rawText, codeBlockWrapper) {
    initCodeLightbox();

    const overlay = document.getElementById('code-lightbox-overlay');
    const content = document.getElementById('code-lightbox-content');
    const title = document.getElementById('code-lightbox-title');
    const body = document.getElementById('code-lightbox-body');
    const copyBtn = document.getElementById('code-lightbox-copy-btn');

    title.innerText = lang;

    const newCopyBtn = copyBtn.cloneNode(true);
    copyBtn.parentNode.replaceChild(newCopyBtn, copyBtn);
    newCopyBtn.addEventListener('click', () => {
        copyToClipboard(rawText).then(() => {
            newCopyBtn.innerText = '已复制!';
            newCopyBtn.classList.add('copied');
            setTimeout(() => {
                newCopyBtn.innerText = '复制';
                newCopyBtn.classList.remove('copied');
            }, 2000);
        });
    });

    const article = document.getElementById('article-container');
    const theme = codeBlockWrapper.getAttribute('data-code-theme') ||
                  article?.getAttribute('data-code-theme') || 'default';
    content.setAttribute('data-code-theme', theme);
    content.setAttribute('data-code-line-numbers', article?.getAttribute('data-code-line-numbers') || 'on');
    content.setAttribute('data-code-header', article?.getAttribute('data-code-header') || 'on');

    body.innerHTML = '';
    const linesContainer = codeBlockWrapper.querySelector('.code-lines');
    if (linesContainer) {
        const clonedLines = linesContainer.cloneNode(true);
        body.appendChild(clonedLines);
        makeReadOnlyEditable(clonedLines);
    } else {
        body.textContent = rawText;
        makeReadOnlyEditable(body);
    }

    if (window.Prism) {
        window.Prism.highlightAllUnder(body);
    } else if (window.hljs) {
        body.querySelectorAll('pre code').forEach((el) => window.hljs.highlightElement(el));
    }

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function enhanceCodeBlocks() {
    const article = document.getElementById('article-container');
    if (!article) return;

    const preNodes = article.querySelectorAll('pre');
    preNodes.forEach((pre) => {
        if (pre.closest('.code-block-wrapper')) return;

        const codeNode = pre.querySelector('code') || pre;
        const rawText = codeNode.textContent || codeNode.innerText || "";

        let lang = 'CODE';
        const classList = Array.from(pre.classList).concat(Array.from(codeNode.classList));
        for (const cls of classList) {
            if (cls.startsWith('language-')) {
                lang = cls.replace('language-', '').toUpperCase();
                break;
            } else if (cls.startsWith('lang-')) {
                lang = cls.replace('lang-', '').toUpperCase();
                break;
            } else if (['diff', 'bash', 'c', 'cpp', 'python', 'javascript', 'js', 'html', 'css', 'json', 'shell', 'sh', 'make'].includes(cls.toLowerCase())) {
                lang = cls.toUpperCase();
                break;
            }
        }

        const lineContentArray = codeNode.innerHTML.replace(/\r\n/g, '\n').split('\n');
        if (lineContentArray.length > 1 && lineContentArray[lineContentArray.length - 1] === '') {
            lineContentArray.pop();
        }

        const lineCount = lineContentArray.length || 1;
        const maxDigitLen = String(lineCount).length;
        const numWidthPx = Math.max(34, maxDigitLen * 10 + 12);

        let linesHtml = '';
        lineContentArray.forEach((lineText, idx) => {
            const lineNum = idx + 1;
            const content = lineText === '' ? ' ' : lineText;
            linesHtml += `
                <div class="code-line">
                    <span class="line-num" contenteditable="false" style="min-width: ${numWidthPx}px; user-select: none; -webkit-user-select: none; -moz-user-select: none;">${lineNum}</span>
                    <span class="line-code">${content}</span>
                </div>
            `;
        });

        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';

        const header = document.createElement('div');
        header.className = 'code-block-header';
        header.innerHTML = `
            <span class="code-lang-label">${lang}</span>
            <div class="code-header-actions">
                <select class="local-code-select local-format-select" title="仅改变当前代码块格式">
                    <option value="">格式: 跟随全局</option>
                    <option value="scroll">同宽 + 横向滚动</option>
                    <option value="wrap">同宽 + 自动换行</option>
                    <option value="adaptive">自适应最长行</option>
                </select>
                <select class="local-code-select local-theme-select" title="仅改变当前代码块主题">
                    <option value="">主题: 跟随全局</option>
                    <option value="default">默认浅色</option>
                    <option value="dark">暗黑极客</option>
                    <option value="github-dark">GitHub Dark</option>
                    <option value="solarized">Solarized Dark</option>
                    <option value="github-light">GitHub Light</option>
                    <option value="dracula">Dracula</option>
                    <option value="nord">Nord</option>
                    <option value="one-dark">One Dark</option>
                    <option value="one-light">Atom One Light</option>
                    <option value="wildcharm">Wildcharm</option>
                    <option value="nightfox">Nightfox</option>
                    <option value="tokyonight">TokyoNight</option>
                    <option value="global">跟随全局阅读主题</option>
                </select>
                <button class="copy-code-btn" title="复制文本">复制</button>
                <button class="fullscreen-code-btn" title="全屏查看代码">全屏</button>
            </div>
        `;

        const localFormatSelect = header.querySelector('.local-format-select');
        localFormatSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val) {
                wrapper.setAttribute('data-code-format', val);
            } else {
                wrapper.removeAttribute('data-code-format');
            }
        });

        const localThemeSelect = header.querySelector('.local-theme-select');
        localThemeSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val) {
                wrapper.setAttribute('data-code-theme', val);
            } else {
                wrapper.removeAttribute('data-code-theme');
            }
        });

        const copyBtn = header.querySelector('.copy-code-btn');
        copyBtn.addEventListener('click', () => {
            copyToClipboard(rawText)
                .then(() => {
                    copyBtn.innerText = '已复制!';
                    copyBtn.classList.add('copied');
                    setTimeout(() => {
                        copyBtn.innerText = '复制';
                        copyBtn.classList.remove('copied');
                    }, 2000);
                })
                .catch((err) => {
                    console.error("复制失败:", err);
                    copyBtn.innerText = '失败';
                    setTimeout(() => { copyBtn.innerText = '复制'; }, 2000);
                });
        });

        const fullscreenBtn = header.querySelector('.fullscreen-code-btn');
        fullscreenBtn.addEventListener('click', () => {
            openCodeLightbox(lang, rawText, wrapper);
        });

        const body = document.createElement('div');
        body.className = 'code-block-body';

        const linesContainer = document.createElement('div');
        linesContainer.className = 'code-lines';
        linesContainer.innerHTML = linesHtml;

        body.appendChild(linesContainer);
        wrapper.appendChild(header);
        wrapper.appendChild(body);

        pre.parentNode.replaceChild(wrapper, pre);
    });
}

function generateTOC() {
    const tocContainer = document.getElementById('toc-container');
    const article = document.getElementById('article-container');
    if (!tocContainer || !article) return;

    const rawHeadings = article.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headings = Array.from(rawHeadings).filter(h => !h.classList.contains('settitle'));
    
    if (headings.length === 0) {
        tocContainer.innerHTML = "<span style='color:#999'>本文无大纲节点</span>";
        return;
    }

    const rootTree = { level: 0, children: [] };
    const stack = [rootTree];

    headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.substring(1), 10);
        const anchorId = heading.id || `toc-anchor-${index}`;
        heading.id = anchorId;

        const node = {
            level: level,
            id: anchorId,
            text: heading.innerText.trim(),
            children: []
        };

        while (stack.length > 1 && stack[stack.length - 1].level >= level) {
            stack.pop();
        }

        stack[stack.length - 1].children.push(node);
        stack.push(node);
    });

    function buildTOCList(nodes) {
        const ul = document.createElement('ul');
        ul.className = 'toc-tree';

        nodes.forEach(node => {
            const li = document.createElement('li');
            li.className = `toc-item toc-item-h${node.level}`;

            const itemRow = document.createElement('div');
            itemRow.className = 'toc-item-row';

            if (node.children.length > 0) {
                const toggle = document.createElement('span');
                toggle.className = 'toc-toggle';
                toggle.innerText = '▼';
                
                toggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const subUl = li.querySelector(':scope > ul');
                    if (subUl) {
                        const isHidden = subUl.style.display === 'none';
                        subUl.style.display = isHidden ? 'block' : 'none';
                        toggle.innerText = isHidden ? '▼' : '▶';
                    }
                });
                itemRow.appendChild(toggle);
            } else {
                const spacer = document.createElement('span');
                spacer.className = 'toc-spacer';
                itemRow.appendChild(spacer);
            }

            const a = document.createElement('a');
            a.href = `#${node.id}`;
            a.innerText = node.text;
            itemRow.appendChild(a);

            li.appendChild(itemRow);

            if (node.children.length > 0) {
                const subUl = buildTOCList(node.children);
                li.appendChild(subUl);
            }

            ul.appendChild(li);
        });

        return ul;
    }

    tocContainer.innerHTML = '';
    tocContainer.appendChild(buildTOCList(rootTree.children));
}

function initPanelMinimizers() {
    document.querySelectorAll('.panel-box').forEach(box => {
        const header = box.querySelector('.panel-header');
        const boxId = box.id;

        if (boxId && localStorage.getItem(`min-${boxId}`) === 'true') {
            box.classList.add('minimized');
        }

        header?.addEventListener('click', () => {
            box.classList.toggle('minimized');
            const isMin = box.classList.contains('minimized');
            if (boxId) localStorage.setItem(`min-${boxId}`, isMin ? 'true' : 'false');
        });
    });
}

/* 辅助函数：格式化行内代码尺寸文本 */
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

function bindControls() {
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
    const codeBlockSlider = document.getElementById('code-block-slider');
    const codeLineNumbersToggle = document.getElementById('code-line-numbers-toggle');
    const codeHeaderToggle = document.getElementById('code-header-toggle');
    const quoteStyleSelect = document.getElementById('quote-style-select');

    // 💡 监听左右 `-` 和 `+` 按钮微调 Slider
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
                
                // 处理浮点精度
                if (slider.step && slider.step.includes('.')) {
                    newVal = parseFloat(newVal.toFixed(1));
                }

                slider.value = newVal;
                slider.dispatchEvent(new Event('input'));
            }
        });
    });

    wSlider?.addEventListener('input', (e) => {
        root.style.setProperty('--page-width', `${e.target.value}px`);
        const valEl = document.getElementById('width-val');
        if (valEl) valEl.innerText = `${e.target.value}px`;
        localStorage.setItem('blog-width', e.target.value);
        updatePosition(); 
    });

    sSlider?.addEventListener('input', (e) => {
        root.style.setProperty('--font-size', `${e.target.value}px`);
        const valEl = document.getElementById('size-val');
        if (valEl) valEl.innerText = `${e.target.value}px`;
        localStorage.setItem('blog-size', e.target.value);
    });

    pSlider?.addEventListener('input', updatePosition);
    window.addEventListener('resize', updatePosition);

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

    lSlider?.addEventListener('input', (e) => {
        root.style.setProperty('--line-height', e.target.value);
        const valEl = document.getElementById('line-val');
        if (valEl) valEl.innerText = e.target.value;
        localStorage.setItem('blog-line', e.target.value);
    });

    cText?.addEventListener('input', (e) => {
        const bg = cBg?.value || '#fbfbfb';
        applyCustomReaderColors(e.target.value, bg);
        localStorage.setItem('blog-ctext', e.target.value);
        if (readerThemeSelect) readerThemeSelect.value = 'custom';
        localStorage.setItem('blog-reader-theme', 'custom');
    });

    cBg?.addEventListener('input', (e) => {
        const text = cText?.value || '#222222';
        applyCustomReaderColors(text, e.target.value);
        localStorage.setItem('blog-cbg', e.target.value);
        if (readerThemeSelect) readerThemeSelect.value = 'custom';
        localStorage.setItem('blog-reader-theme', 'custom');
    });

    readerThemeSelect?.addEventListener('change', (e) => {
        const themeName = e.target.value || 'custom';
        applyReaderTheme(themeName);
        localStorage.setItem('blog-reader-theme', themeName);
        const theme = readerThemeMap[themeName] || readerThemeMap.custom;
        if (cText) cText.value = theme.text;
        if (cBg) cBg.value = theme.bg;
    });

    codeFormatSelect?.addEventListener('change', (e) => {
        if (article) article.setAttribute('data-code-format', e.target.value);
        localStorage.setItem('blog-code-format', e.target.value);
    });

    codeThemeSelect?.addEventListener('change', (e) => {
        if (article) article.setAttribute('data-code-theme', e.target.value);
        localStorage.setItem('blog-code-theme', e.target.value);
    });

    codeInlineThemeSelect?.addEventListener('change', (e) => {
        if (article) article.setAttribute('data-code-inline-theme', e.target.value);
        localStorage.setItem('blog-code-inline-theme', e.target.value);
    });

    codeInlineSlider?.addEventListener('input', (e) => {
        const offsetVal = e.target.value;
        const { cssStr, labelStr } = formatInlineSize(offsetVal);

        root.style.setProperty('--code-inline-size', cssStr);
        const valEl = document.getElementById('code-inline-val');
        if (valEl) valEl.innerText = labelStr;
        localStorage.setItem('blog-code-inline-offset', offsetVal);
    });

    codeBlockSlider?.addEventListener('input', (e) => {
        root.style.setProperty('--code-block-size', `${e.target.value}px`);
        const valEl = document.getElementById('code-block-val');
        if (valEl) valEl.innerText = `${e.target.value}px`;
        localStorage.setItem('blog-code-block-size', e.target.value);
    });

    codeLineNumbersToggle?.addEventListener('change', (e) => {
        if (article) article.setAttribute('data-code-line-numbers', e.target.checked ? 'on' : 'off');
        localStorage.setItem('blog-code-line-numbers', e.target.checked ? 'on' : 'off');
    });

    codeHeaderToggle?.addEventListener('change', (e) => {
        if (article) article.setAttribute('data-code-header', e.target.checked ? 'on' : 'off');
        localStorage.setItem('blog-code-header', e.target.checked ? 'on' : 'off');
    });

    quoteStyleSelect?.addEventListener('change', (e) => {
        if (article) article.setAttribute('data-quote-style', e.target.value);
        localStorage.setItem('blog-quote-style', e.target.value);
    });
}

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
    const codeBlockSlider = document.getElementById('code-block-slider');
    const codeLineNumbersToggle = document.getElementById('code-line-numbers-toggle');
    const codeHeaderToggle = document.getElementById('code-header-toggle');
    const quoteStyleSelect = document.getElementById('quote-style-select');

    const savedWidth = localStorage.getItem('blog-width');
    const savedSize = localStorage.getItem('blog-size');
    const savedPos = localStorage.getItem('blog-pos');
    const savedLine = localStorage.getItem('blog-line');
    const savedCText = localStorage.getItem('blog-ctext');
    const savedCBg = localStorage.getItem('blog-cbg');
    const savedReaderTheme = localStorage.getItem('blog-reader-theme') || 'custom';

    const savedCodeFormat = localStorage.getItem('blog-code-format') || 'scroll';
    const savedCodeTheme = localStorage.getItem('blog-code-theme') || 'default';
    const savedCodeInlineTheme = localStorage.getItem('blog-code-inline-theme') || 'default';
    const savedCodeInlineOffset = localStorage.getItem('blog-code-inline-offset') ?? '-2';
    const savedCodeBlockSize = localStorage.getItem('blog-code-block-size');
    const savedCodeLineNumbers = localStorage.getItem('blog-code-line-numbers') || 'on';
    const savedCodeHeader = localStorage.getItem('blog-code-header') || 'on';
    const savedQuoteStyle = localStorage.getItem('blog-quote-style') || 'global';

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
    } else {
        const savedTheme = readerThemeMap[savedReaderTheme] || readerThemeMap.custom;
        if (cText) cText.value = savedTheme.text;
        if (cBg) cBg.value = savedTheme.bg;
    }

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

    if (savedCodeBlockSize && codeBlockSlider) {
        codeBlockSlider.value = savedCodeBlockSize;
        root.style.setProperty('--code-block-size', `${savedCodeBlockSize}px`);
        const valEl = document.getElementById('code-block-val');
        if (valEl) valEl.innerText = `${savedCodeBlockSize}px`;
    }

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
    
    updatePosition();
}

function initArticleTree() {
    const treeContainer = document.getElementById('tree-container');
    if (!treeContainer) return;

    fetch('/manifest.json')
        .then(res => {
            if (!res.ok) throw new Error("无法获取 manifest.json");
            return res.json();
        })
        .then(manifest => {
            renderManifestUI(manifest);
        })
        .catch(err => {
            treeContainer.innerHTML = `<span style="color:red">加载文章树失败: ${err.message}</span>`;
        });
}

function renderManifestUI(manifest) {
    const currentPath = decodeURIComponent(window.location.pathname);

    let activeTopicKey = null;

    function searchNodes(nodes) {
        for (const key in nodes) {
            const node = nodes[key];
            if (node.file) {
                const nodeUrl = '/' + node.file.replace(/^articles\//, '');
                if (nodeUrl === currentPath) return true;
            }
            if (node.children && searchNodes(node.children)) return true;
        }
        return false;
    }

    for (const topicKey in manifest) {
        if (manifest[topicKey].nodes && searchNodes(manifest[topicKey].nodes)) {
            activeTopicKey = topicKey;
            break;
        }
    }

    if (activeTopicKey) {
        renderTopicTree(manifest, activeTopicKey);
    } else {
        renderTopicList(manifest);
    }
}

function renderTopicList(manifest) {
    const treeContainer = document.getElementById('tree-container');
    treeContainer.innerHTML = '';

    const ul = document.createElement('ul');
    ul.className = 'topic-list';

    Object.keys(manifest).forEach(topicKey => {
        const li = document.createElement('li');
        li.className = 'topic-item';
        li.innerHTML = `<span>📦</span> <span>${topicKey}</span>`;
        li.addEventListener('click', () => {
            renderTopicTree(manifest, topicKey);
        });
        ul.appendChild(li);
    });

    treeContainer.appendChild(ul);
}

function renderTopicTree(manifest, topicKey) {
    const treeContainer = document.getElementById('tree-container');
    treeContainer.innerHTML = '';

    const backBtn = document.createElement('div');
    backBtn.className = 'tree-nav-top';
    backBtn.innerHTML = `<span>⬅</span> <span>返回主题列表 (${topicKey})</span>`;
    backBtn.addEventListener('click', () => {
        renderTopicList(manifest);
    });
    treeContainer.appendChild(backBtn);

    const topicData = manifest[topicKey];
    if (!topicData || !topicData.nodes) {
        treeContainer.appendChild(document.createTextNode('该主题无节点'));
        return;
    }

    const currentPath = decodeURIComponent(window.location.pathname);

    function buildTree(nodes) {
        const ul = document.createElement('ul');
        ul.className = 'article-tree';

        Object.keys(nodes).forEach(nodeName => {
            const node = nodes[nodeName];
            const li = document.createElement('li');
            const row = document.createElement('div');
            row.className = 'tree-node-row';

            const hasChildren = node.children && Object.keys(node.children).length > 0;

            if (hasChildren) {
                const toggle = document.createElement('span');
                toggle.className = 'tree-toggle';
                toggle.innerText = '▼';
                toggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const subUl = li.querySelector(':scope > ul');
                    if (subUl) {
                        const isHidden = subUl.style.display === 'none';
                        subUl.style.display = isHidden ? 'block' : 'none';
                        toggle.innerText = isHidden ? '▼' : '▶';
                    }
                });
                row.appendChild(toggle);
            } else {
                const spacer = document.createElement('span');
                spacer.className = 'tree-spacer';
                row.appendChild(spacer);
            }

            if (node.file) {
                const nodeUrl = '/' + node.file.replace(/^articles\//, '');
                const a = document.createElement('a');
                a.className = 'tree-link';
                a.href = nodeUrl;
                a.innerText = nodeName;

                if (nodeUrl === currentPath) {
                    a.classList.add('active');
                }
                row.appendChild(a);
            } else {
                const span = document.createElement('span');
                span.style.fontWeight = 'bold';
                span.innerText = nodeName;
                row.appendChild(span);
            }

            li.appendChild(row);

            if (hasChildren) {
                const subUl = buildTree(node.children);
                li.appendChild(subUl);
            }

            ul.appendChild(li);
        });

        return ul;
    }

    const treeEl = buildTree(topicData.nodes);
    treeContainer.appendChild(treeEl);
}

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

window.addEventListener('DOMContentLoaded', () => {
    const article = document.getElementById('article-container');

    initPanelMinimizers();
    bindControls();
    initCanvasPan();
    initImageLightbox();
    initCodeLightbox();
    initCodeSelectAll();

    const currentPath = window.location.pathname;

    let fileToFetch;
    if (currentPath === '/' || currentPath === '/index.html') {
        fileToFetch = '/template/body.html'; 
    } else {
        fileToFetch = `/articles${currentPath}`;
    }

    fetch(fileToFetch)
        .then(response => {
            if (!response.ok) throw new Error('文件不存在');
            return response.text();
        })
        .then(htmlData => {
            if (article) {
                article.innerHTML = htmlData;

                article.querySelectorAll('img').forEach(img => {
                    img.style.zoom = '';
                });

                try {
                    enhanceCodeBlocks();
                } catch(e) { console.error("enhanceCodeBlocks 报错:", e); }

                try {
                    enhanceAllCode();
                } catch(e) { console.error("enhanceAllCode 报错:", e); }

                generateTOC();
            }
        })
        .catch((err) => {
            console.error("加载文章失败:", err);
            if (article) {
                article.innerHTML = "<p style='color:red'>内容加载失败，请检查路径</p>";
            }
        });

    initArticleTree();
    restoreSavedSettings();
});
