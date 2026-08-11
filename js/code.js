// 代码相关功能
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
    targets.forEach(el => makeReadOnlyEditable(el));
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
        if (e.target === overlay) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) closeLightbox();
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
