const root = document.documentElement;
const wrapper = document.getElementById('article-wrapper');
const article = document.getElementById('article-container');

// 获取页面全部滑块与选择器元素
const wSlider = document.getElementById('width-slider');
const sSlider = document.getElementById('size-slider');
const pSlider = document.getElementById('position-slider');
const lSlider = document.getElementById('line-slider');     // 【新增】
const cText = document.getElementById('color-text');         // 【新增】
const cBg = document.getElementById('color-bg');             // 【新增】
const fSelect = document.getElementById('font-select');

// 1. 位置计算函数（自适应贴边）
function updatePosition() {
    const percent = parseInt(pSlider.value);
    const maxShift = (window.innerWidth - wrapper.offsetWidth) / 2;
    const targetX = (percent / 100) * maxShift;
    
    article.style.transform = `translateX(${targetX}px)`;
    
    if (percent === 0) document.getElementById('position-val').innerText = "居中";
    else if (percent < 0) document.getElementById('position-val').innerText = `L ${Math.abs(percent)}%`;
    else document.getElementById('position-val').innerText = `R ${percent}%`;
    
    localStorage.setItem('blog-pos', percent);
}

// 2. 原生事件流绑定（数据改动瞬间投喂给 CSS 变量，同时存盘）
wSlider.addEventListener('input', (e) => {
    root.style.setProperty('--page-width', `${e.target.value}px`);
    document.getElementById('width-val').innerText = `${e.target.value}px`;
    localStorage.setItem('blog-width', e.target.value);
    updatePosition(); 
});

sSlider.addEventListener('input', (e) => {
    root.style.setProperty('--font-size', `${e.target.value}px`);
    document.getElementById('size-val').innerText = `${e.target.value}px`;
    localStorage.setItem('blog-size', e.target.value);
});

pSlider.addEventListener('input', updatePosition);
window.addEventListener('resize', updatePosition);

fSelect.addEventListener('change', (e) => {
    article.className = e.target.value;
    localStorage.setItem('blog-font', e.target.value);
});

// 【新增监听：行间距】
lSlider.addEventListener('input', (e) => {
    root.style.setProperty('--line-height', e.target.value);
    document.getElementById('line-val').innerText = e.target.value;
    localStorage.setItem('blog-line', e.target.value);
});

// 【新增监听：文字颜色】
cText.addEventListener('input', (e) => {
    root.style.setProperty('--text-color', e.target.value);
    localStorage.setItem('blog-ctext', e.target.value);
});

// 【新增监听：网页背景颜色】
cBg.addEventListener('input', (e) => {
    root.style.setProperty('--bg-color', e.target.value);
    localStorage.setItem('blog-cbg', e.target.value);
});


// 3. 自动化大纲生成器（修复版）
function generateTOC() {
    const tocContainer = document.getElementById('toc-container');
    if (!tocContainer) return;

    // 1. 扩大匹配范围，包含 h1, h2, h3, h4
    const rawHeadings = article.querySelectorAll('h1, h2, h3, h4');

    // 2. 过滤掉 texi2html 文档总标题（通常带 settitle 类），其余全保留
    const headings = Array.from(rawHeadings).filter(h => !h.classList.contains('settitle'));
    
    if (headings.length === 0) {
        tocContainer.innerHTML = "<span style='color:#999'>本文无大纲节点</span>";
        return;
    }
    
    const ul = document.createElement('ul');
    headings.forEach((heading, index) => {
        const anchorId = `toc-anchor-${index}`;
        heading.id = anchorId;
        
        const li = document.createElement('li');
        // 动态匹配对应的 class：toc-item-h1, toc-item-h2, toc-item-h3 等
        li.className = `toc-item-${heading.tagName.toLowerCase()}`;
        
        const a = document.createElement('a');
        a.href = `#${anchorId}`;
        a.innerText = heading.innerText.trim();
        
        li.appendChild(a);
        ul.appendChild(li);
    });
    
    tocContainer.innerHTML = '';
    tocContainer.appendChild(ul);
}

// 4. 初始化控制方块的“展开/最小化”状态流
function initPanelMinimizers() {
    document.querySelectorAll('.panel-box').forEach(box => {
        const header = box.querySelector('.panel-header');
        const minBtn = box.querySelector('.min-btn');
        const boxId = box.id;

        if (localStorage.getItem(`min-${boxId}`) === 'true') {
            box.classList.add('minimized');
        }

        minBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            box.classList.add('minimized');
            localStorage.setItem(`min-${boxId}`, 'true');
        });

        header.addEventListener('click', () => {
            if (box.classList.contains('minimized')) {
                box.classList.remove('minimized');
                localStorage.setItem(`min-${boxId}`, 'false');
            }
        });
    });
}

// 5. 页面加载中心调度
window.addEventListener('DOMContentLoaded', () => {
    initPanelMinimizers();

    // 载入正文与大纲
    // fetch('body.html')
    //     .then(response => response.text())
    //     .then(htmlData => {
    //         article.innerHTML = htmlData;
    //         generateTOC(); 
    //     })
    //     .catch(() => {
    //         document.getElementById('toc-container').innerHTML = "<span style='color:red'>大纲加载失败</span>";
    //     });

    // 1. 获取当前 URL 路径（例如：/linux/linux.html）
    const currentPath = window.location.pathname;

    // 2. 拼接绝对 Fetch 路径
    let fileToFetch;
    if (currentPath === '/' || currentPath === '/index.html') {
        fileToFetch = '/template/body.html'; 
    } else {
        // currentPath 自带开头的 '/'，例如 '/linux/linux.html'
        // 拼接后得到 '/data/linux/linux.html'
        fileToFetch = `/data${currentPath}`;
    }

    // 3. 请求文章正文
    fetch(fileToFetch)
        .then(response => {
            if (!response.ok) throw new Error('文件不存在');
            return response.text();
        })
        .then(htmlData => {
            article.innerHTML = htmlData;
            generateTOC();
        })
        .catch(() => {
            article.innerHTML = "<p style='color:red'>内容加载失败，请检查路径</p>";
        });

    // 载入归档树
    fetch('/template/tree.html')
        .then(response => response.text())
        .then(htmlData => {
            document.getElementById('tree-container').innerHTML = htmlData;
        })
        .catch(() => {
            document.getElementById('tree-container').innerHTML = "<span style='color:red'>列表加载失败</span>";
        });

    // 读取并还原所有的历史配置数据（包含新增的行距与颜色）
    const savedWidth = localStorage.getItem('blog-width');
    const savedSize = localStorage.getItem('blog-size');
    const savedFont = localStorage.getItem('blog-font');
    const savedPos = localStorage.getItem('blog-pos');
    const savedLine = localStorage.getItem('blog-line');   // 【新增】
    const savedCText = localStorage.getItem('blog-ctext'); // 【新增】
    const savedCBg = localStorage.getItem('blog-cbg');     // 【新增】

    if (savedWidth) {
        wSlider.value = savedWidth;
        root.style.setProperty('--page-width', `${savedWidth}px`);
        document.getElementById('width-val').innerText = `${savedWidth}px`;
    }
    if (savedSize) {
        sSlider.value = savedSize;
        root.style.setProperty('--font-size', `${savedSize}px`);
        document.getElementById('size-val').innerText = `${savedSize}px`;
    }
    if (savedFont) {
        fSelect.value = savedFont;
        article.className = savedFont;
    }
    if (savedPos) {
        pSlider.value = savedPos;
    }
    // 【还原行距控制】
    if (savedLine) {
        lSlider.value = savedLine;
        root.style.setProperty('--line-height', savedLine);
        document.getElementById('line-val').innerText = savedLine;
    }
    // 【还原文字颜色控制】
    if (savedCText) {
        cText.value = savedCText;
        root.style.setProperty('--text-color', savedCText);
    }
    // 【还原网页背景控制】
    if (savedCBg) {
        cBg.value = savedCBg;
        root.style.setProperty('--bg-color', savedCBg);
    }
    
    updatePosition();
});
