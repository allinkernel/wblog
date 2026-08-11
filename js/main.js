// ==================== 主入口 ====================
window.addEventListener('DOMContentLoaded', () => {
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
        'panel-config': 'bar-config',
        'panel-font': 'bar-font',
        'panel-style': 'bar-style',
        'panel-code-style': 'bar-code'
    };
    const barId = barMap[panelId];
    if (barId) {
        const barBtn = document.getElementById(barId);
        if (barBtn) barBtn.classList.toggle('active', !isHidden);
    }
    localStorage.setItem(`panel-${panelId}`, isHidden ? 'hidden' : 'visible');
}

function setPanelVisible(panelId, visible) {
    const panel = document.getElementById(panelId);
    if (!panel) return;
    panel.classList.toggle('panel-hidden', !visible);
    const barMap = {
        'panel-tree': 'bar-tree',
        'panel-toc': 'bar-toc',
        'panel-config': 'bar-config',
        'panel-font': 'bar-font',
        'panel-style': 'bar-style',
        'panel-code-style': 'bar-code'
    };
    const barId = barMap[panelId];
    if (barId) {
        const barBtn = document.getElementById(barId);
        if (barBtn) barBtn.classList.toggle('active', visible);
    }
    localStorage.setItem(`panel-${panelId}`, visible ? 'visible' : 'hidden');
}

function initPanelVisibility() {
    const panelIds = ['panel-tree', 'panel-toc', 'panel-config', 'panel-font', 'panel-style', 'panel-code-style'];
    panelIds.forEach(id => {
        const state = localStorage.getItem(`panel-${id}`);
        setPanelVisible(id, state !== 'hidden');
    });
}

// 加载 bar 位置
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
    // 加载保存的位置
    loadBarPosition();

    // 画布小手
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

    // 面板按钮映射
    const panelMap = {
        'bar-tree': 'panel-tree',
        'bar-toc': 'panel-toc',
        'bar-config': 'panel-config',
        'bar-font': 'panel-font',
        'bar-style': 'panel-style',
        'bar-code': 'panel-code-style'
    };
    Object.keys(panelMap).forEach(barId => {
        const btn = document.getElementById(barId);
        if (!btn) return;
        const panelId = panelMap[barId];
        btn.addEventListener('click', () => {
            togglePanel(panelId);
        });
    });

    // 面板标题栏点击切换
    document.querySelectorAll('.panel-header').forEach(header => {
        const panelBox = header.closest('.panel-box');
        if (!panelBox) return;
        header.removeEventListener('click', header._panelToggleHandler);
        const handler = function(e) {
            if (e.target.closest('.min-btn')) return;
            togglePanel(panelBox.id);
        };
        header._panelToggleHandler = handler;
        header.addEventListener('click', handler);
    });

    // 恢复面板显隐状态
    initPanelVisibility();

    // ------------------ 拖拽功能 ------------------
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

    // 窗口大小变化时，确保 bar 不超出边界（可选）
    window.addEventListener('resize', () => {
        // 简单限制，防止完全移出视野
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
