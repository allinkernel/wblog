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
        else if (percent < 0) posVal.innerText = `L ${Math.abs(percent)}%`;
        else posVal.innerText = `R ${percent}%`;
    }
    
    localStorage.setItem('blog-pos', percent);
}

/* 🎯 重构核心：生成逐行 Flex 结构的代码块，消除折叠换行时的行号错位问题 */
function enhanceCodeBlocks() {
    const article = document.getElementById('article-container');
    if (!article) return;

    const preNodes = article.querySelectorAll('pre');
    preNodes.forEach((pre) => {
        // 防止重复增强
        if (pre.closest('.code-block-wrapper')) return;

        const codeNode = pre.querySelector('code') || pre;
        const rawText = codeNode.innerText;

        // 提取代码语言/类型
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

        // 按行切割 HTML 内容以保留转义和标签
        const lineContentArray = codeNode.innerHTML.replace(/\r\n/g, '\n').split('\n');
        // 处理末尾空行
        if (lineContentArray.length > 1 && lineContentArray[lineContentArray.length - 1] === '') {
            lineContentArray.pop();
        }

        const lineCount = lineContentArray.length || 1;
        const maxDigitLen = String(lineCount).length;
        // 计算行号宽度（支持大数字）
        const numWidthPx = Math.max(34, maxDigitLen * 10 + 12);

        let linesHtml = '';
        lineContentArray.forEach((lineText, idx) => {
            const lineNum = idx + 1;
            const content = lineText === '' ? ' ' : lineText;
            linesHtml += `
                <div class="code-line">
                    <span class="line-num" style="min-width: ${numWidthPx}px;">${lineNum}</span>
                    <span class="line-code">${content}</span>
                </div>
            `;
        });

        // 构建 UI 框架
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';

        const header = document.createElement('div');
        header.className = 'code-block-header';
        header.innerHTML = `
            <span class="code-lang-label">${lang}</span>
            <button class="copy-code-btn" title="复制文本">复制</button>
        `;

        // 一键复制原文本
        const copyBtn = header.querySelector('.copy-code-btn');
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(rawText).then(() => {
                copyBtn.innerText = '已复制!';
                setTimeout(() => { copyBtn.innerText = '复制'; }, 2000);
            }).catch(() => {
                copyBtn.innerText = '失败';
            });
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

function bindControls() {
    const article = document.getElementById('article-container');
    const wSlider = document.getElementById('width-slider');
    const sSlider = document.getElementById('size-slider');
    const pSlider = document.getElementById('position-slider');
    const lSlider = document.getElementById('line-slider');
    const cText = document.getElementById('color-text');
    const cBg = document.getElementById('color-bg');

    /* 代码控制元素 */
    const codeFormatSelect = document.getElementById('code-format-select');
    const codeThemeSelect = document.getElementById('code-theme-select');
    const codeInlineThemeSelect = document.getElementById('code-inline-theme-select'); // 🎯 绑定的行内主题选择器
    const codeInlineSlider = document.getElementById('code-inline-slider');
    const codeBlockSlider = document.getElementById('code-block-slider');

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
        root.style.setProperty('--text-color', e.target.value);
        localStorage.setItem('blog-ctext', e.target.value);
    });

    cBg?.addEventListener('input', (e) => {
        root.style.setProperty('--bg-color', e.target.value);
        localStorage.setItem('blog-cbg', e.target.value);
    });

    /* 代码显示格式 */
    codeFormatSelect?.addEventListener('change', (e) => {
        if (article) article.setAttribute('data-code-format', e.target.value);
        localStorage.setItem('blog-code-format', e.target.value);
    });

    /* 代码块主题 */
    codeThemeSelect?.addEventListener('change', (e) => {
        if (article) article.setAttribute('data-code-theme', e.target.value);
        localStorage.setItem('blog-code-theme', e.target.value);
    });

    /* 🎯 代码行内主题监听器 */
    codeInlineThemeSelect?.addEventListener('change', (e) => {
        if (article) article.setAttribute('data-code-inline-theme', e.target.value);
        localStorage.setItem('blog-code-inline-theme', e.target.value);
    });

    codeInlineSlider?.addEventListener('input', (e) => {
        root.style.setProperty('--code-inline-size', `${e.target.value}px`);
        const valEl = document.getElementById('code-inline-val');
        if (valEl) valEl.innerText = `${e.target.value}px`;
        localStorage.setItem('blog-code-inline-size', e.target.value);
    });

    codeBlockSlider?.addEventListener('input', (e) => {
        root.style.setProperty('--code-block-size', `${e.target.value}px`);
        const valEl = document.getElementById('code-block-val');
        if (valEl) valEl.innerText = `${e.target.value}px`;
        localStorage.setItem('blog-code-block-size', e.target.value);
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

    const codeFormatSelect = document.getElementById('code-format-select');
    const codeThemeSelect = document.getElementById('code-theme-select');
    const codeInlineThemeSelect = document.getElementById('code-inline-theme-select');
    const codeInlineSlider = document.getElementById('code-inline-slider');
    const codeBlockSlider = document.getElementById('code-block-slider');

    const savedWidth = localStorage.getItem('blog-width');
    const savedSize = localStorage.getItem('blog-size');
    const savedPos = localStorage.getItem('blog-pos');
    const savedLine = localStorage.getItem('blog-line');
    const savedCText = localStorage.getItem('blog-ctext');
    const savedCBg = localStorage.getItem('blog-cbg');

    /* 🎯 恢复代码全套主题与格式选项 */
    const savedCodeFormat = localStorage.getItem('blog-code-format') || 'scroll';
    const savedCodeTheme = localStorage.getItem('blog-code-theme') || 'default';
    const savedCodeInlineTheme = localStorage.getItem('blog-code-inline-theme') || 'default';
    const savedCodeInlineSize = localStorage.getItem('blog-code-inline-size');
    const savedCodeBlockSize = localStorage.getItem('blog-code-block-size');

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
    if (savedCText && cText) {
        cText.value = savedCText;
        root.style.setProperty('--text-color', savedCText);
    }
    if (savedCBg && cBg) {
        cBg.value = savedCBg;
        root.style.setProperty('--bg-color', savedCBg);
    }

    if (article) {
        article.setAttribute('data-code-format', savedCodeFormat);
        article.setAttribute('data-code-theme', savedCodeTheme);
        article.setAttribute('data-code-inline-theme', savedCodeInlineTheme);
    }
    if (codeFormatSelect) codeFormatSelect.value = savedCodeFormat;
    if (codeThemeSelect) codeThemeSelect.value = savedCodeTheme;
    if (codeInlineThemeSelect) codeInlineThemeSelect.value = savedCodeInlineTheme;

    if (savedCodeInlineSize && codeInlineSlider) {
        codeInlineSlider.value = savedCodeInlineSize;
        root.style.setProperty('--code-inline-size', `${savedCodeInlineSize}px`);
        const valEl = document.getElementById('code-inline-val');
        if (valEl) valEl.innerText = `${savedCodeInlineSize}px`;
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

window.addEventListener('DOMContentLoaded', () => {
    const article = document.getElementById('article-container');

    initPanelMinimizers();
    bindControls();
    initImageLightbox();

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

                // 🎯 触发增强重构
                enhanceCodeBlocks();
                generateTOC();
            }
        })
        .catch(() => {
            if (article) {
                article.innerHTML = "<p style='color:red'>内容加载失败，请检查路径</p>";
            }
        });

    initArticleTree();
    restoreSavedSettings();
});

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
