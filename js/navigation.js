// 文章树、大纲生成、无刷新导航
let currentManifest = null;

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
            a.addEventListener('click', function(e) {
                e.stopPropagation();
                const targetId = this.getAttribute('href').substring(1);
                const targetEl = document.getElementById(targetId);
                if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                history.pushState(null, '', `#${targetId}`);
                e.preventDefault();
                return false;
            });
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

function initArticleTree() {
    const treeContainer = document.getElementById('tree-container');
    if (!treeContainer) return;
    fetch('/manifest.json')
        .then(res => {
            if (!res.ok) throw new Error("无法获取 manifest.json");
            return res.json();
        })
        .then(manifest => {
            currentManifest = manifest;
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
                a.dataset.path = nodeUrl;
                a.innerText = nodeName;
                if (nodeUrl === currentPath) {
                    a.classList.add('active');
                }
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    const path = a.dataset.path;
                    if (path) {
                        navigateTo(path);
                    }
                });
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

function loadArticleContent(path) {
    if (path && path.startsWith('#')) {
        return;
    }
    const article = document.getElementById('article-container');
    if (!article) return;
    article.innerHTML = '<p>正在读取正文内容...</p>';
    let fileToFetch;
    if (path === '/' || path === '/index.html') {
        fileToFetch = '/template/index.html';
    } else if (path.endsWith('/index')) {
        fileToFetch = `/articles${path}.html`;
    } else {
        fileToFetch = `/articles${path}`;
    }
    fetch(fileToFetch)
        .then(response => {
            if (!response.ok) throw new Error('文件不存在');
            return response.text();
        })
        .then(htmlData => {
            article.innerHTML = htmlData;
            article.querySelectorAll('img').forEach(img => {
                img.style.zoom = '';
            });
            try { enhanceCodeBlocks(); } catch(e) { console.error("enhanceCodeBlocks 报错:", e); }
            try { enhanceAllCode(); } catch(e) { console.error("enhanceAllCode 报错:", e); }
            try { generateTOC(); } catch(e) { console.error("generateTOC 报错:", e); }
            try { enhanceTables(); } catch(e) { console.error("enhanceTables 报错:", e); }
            try { initTableEnhancement(); } catch(e) { console.error("initTableEnhancement 报错:", e); }
            updateActiveTreeLink(path);

            // ===== 关键修复：重新应用当前用户选择的主题（而不是强制 github 主题） =====
            const currentTheme = localStorage.getItem('blog-reader-theme') || 'github-light';
            applyReaderTheme(currentTheme);

            // 同步底部主题按钮状态：根据当前主题名称是否包含 'dark' 判断明暗
            const isDarkTheme = currentTheme.includes('dark');
            const themeBtn = document.getElementById('bar-theme');
            if (themeBtn) {
                themeBtn.classList.toggle('active', isDarkTheme);
                themeBtn.querySelector('.bar-icon').textContent = isDarkTheme ? '🌙' : '☀️';
                themeBtn.querySelector('.bar-label').textContent = isDarkTheme ? '暗色' : '亮色';
            }
            // 更新 blog-theme-mode 以便后续切换按钮使用
            localStorage.setItem('blog-theme-mode', isDarkTheme ? 'dark' : 'light');
        })
        .catch((err) => {
            console.error("加载文章失败:", err);
            article.innerHTML = "<p style='color:red'>内容加载失败，请检查路径</p>";
        });
}

function navigateTo(path) {
    if (path && path.startsWith('#')) {
        return;
    }
    history.pushState(null, '', path);
    loadArticleContent(path);
}

function updateActiveTreeLink(path) {
    document.querySelectorAll('.tree-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.path === path) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('popstate', () => {
    const path = window.location.pathname;
    if (window.location.hash) {
        const pathname = window.location.pathname;
        loadArticleContent(pathname);
    } else {
        loadArticleContent(path);
    }
});
