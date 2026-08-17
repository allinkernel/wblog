// 端到端 DOM 测试：加载 template.html + 全部 JS，验证设置面板重构
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = '/home/mindul/self/wblog_new';
const html = fs.readFileSync(path.join(ROOT, 'template/template.html'), 'utf8');

const dom = new JSDOM(html, {
    url: 'http://localhost/',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
});
const { window } = dom;
const { document } = window;

// ---- 注入 fetch stub（manifest 404，文章内容返回简单 HTML）----
window.fetch = (url) => {
    if (url === '/manifest.json') {
        return Promise.resolve({ ok: false, status: 404, text: () => Promise.resolve('') });
    }
    if (url === '/template/index.html') {
        const content = `
            <h1>测试标题</h1><h2>小节</h2>
            <p>正文段落 <code>inline code</code> 继续</p>
            <pre><code class="language-c">int main() { return 0; }</code></pre>
            <blockquote><p>引用内容</p></blockquote>
            <table><thead><tr><th>列A</th><th>列B</th></tr></thead>
            <tbody><tr><td>1</td><td>2</td></tr></tbody></table>
        `;
        return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve(content) });
    }
    return Promise.resolve({ ok: false, status: 404, text: () => Promise.resolve('') });
};

// ---- 模拟老用户 localStorage（含旧字体矩阵 + 已移除的 custom 主题）----
window.localStorage.setItem('matrix-font-body', 'serif-mono');
window.localStorage.setItem('matrix-font-code', 'sans-mono');
window.localStorage.setItem('matrix-font-heading', 'inherit');
window.localStorage.setItem('blog-reader-theme', 'custom');
window.localStorage.setItem('blog-ctext', '#112233');
window.localStorage.setItem('blog-cbg', '#445566');
window.localStorage.setItem('last-light-theme', 'custom');
window.localStorage.setItem('blog-code-format', 'scroll'); // 老用户：横向滚动

// ---- innerText polyfill（jsdom 未实现）----
if (!('innerText' in window.HTMLElement.prototype)) {
    Object.defineProperty(window.HTMLElement.prototype, 'innerText', {
        get() { return this.textContent; },
        set(v) { this.textContent = v; },
    });
}

// ---- 依次执行 JS（拼接为同一全局作用域，与浏览器多个 <script> 共享词法声明一致）----
// 在脚本执行前 mock 安全上下文与 Local Font Access API（jsdom 无 isSecureContext/queryLocalFonts）
Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true });
window.queryLocalFonts = () => Promise.resolve([
    { family: 'Test Mono X' },
    { family: 'Test Mono X' }, // 重复项应去重
    { family: 'Test Sans Y' },
    { family: 'Test Serif Z' }
]);
const jsFiles = ['theme.js', 'code.js', 'navigation.js', 'controls.js', 'main.js'];
const bundle = jsFiles.map(f => fs.readFileSync(path.join(ROOT, 'template/js', f), 'utf8')).join('\n;\n');
try {
    window.eval(bundle);
} catch (e) {
    console.error('执行脚本报错:', e.message);
    process.exit(1);
}

// 不手动 dispatch：jsdom 构造后会异步触发一次 DOMContentLoaded（真实浏览器亦然）
// 监听器在 eval 后注册，由 jsdom 自动触发执行

let fail = 0;
const check = (name, cond) => { console.log((cond ? 'OK   ' : 'FAIL ') + name); if (!cond) fail++; };

// 等待异步加载文章内容完成
setTimeout(() => {
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => [...document.querySelectorAll(sel)];

    // ---- 1. 面板与按钮结构 ----
    check('仅存在 3 个面板（tree/toc/settings）', $$('.panel-box').map(p => p.id).sort().join(',') === 'panel-settings,panel-toc,panel-tree');
    check('旧面板已移除', !$('#panel-config') && !$('#panel-font') && !$('#panel-style') && !$('#panel-code-style') && !$('#panel-table-style'));
    check('设置面板标题为 ⚙️ 设置', $('#panel-settings .panel-title').textContent === '设置' && $('#panel-settings .panel-icon').textContent === '⚙️');
    check('存在 ✕ 关闭按钮', !!$('#panel-settings .panel-close-btn'));
    check('底部只有 1 个设置按钮', !!$('#bar-settings') && !$('#bar-config') && !$('#bar-font') && !$('#bar-style') && !$('#bar-code') && !$('#bar-table'));

    // ---- 2. Tab 架构 ----
    const tabs = $$('.settings-tab');
    check('7 个一级 Tab', tabs.length === 7);
    check('Tab 顺序', tabs.map(t => t.dataset.tab).join(',') === 'tab-theme,tab-layout,tab-font,tab-inline-code,tab-code-block,tab-quote,tab-table');
    check('默认激活主题 Tab', $('#tab-theme').classList.contains('active') && tabs[0].classList.contains('active'));

    // 点击【代码块】Tab
    tabs[4].click();
    check('点击后激活代码块 Tab', $('#tab-code-block').classList.contains('active') && $('#tab-theme').classList.contains('active') === false);

    // ---- 3. 代码块 Tab 内容 ----
    const fmtSel = $('#code-format-select');
    check('显示格式 4 个选项且顺序正确', [...fmtSel.options].map(o => o.value).join(',') === 'global,scroll,wrap,adaptive');
    check('显示格式文字精简', [...fmtSel.options].map(o => o.textContent).join('|') === '继承主题|横向滚动|自动换行|自适应宽');
    check('HTML 默认 selected 为 global（无历史设置时）', fmtSel.querySelector('option[selected]')?.value === 'global');
    check('块级主题首个选项为「继承主题」', $('#code-theme-select').options[0].textContent === '继承主题');
    check('块级主题无 default 字样', ![...$('#code-theme-select').options].some(o => o.textContent.includes('default')));

    // ---- 4. 主题 Tab：custom 选项移除 ----
    $('#settings-tab-bar').querySelector('[data-tab="tab-theme"]').click();
    check('日间主题无 custom 选项', ![...$('#light-theme-select').options].some(o => o.value === 'custom'));
    check('夜间主题无 custom 选项', ![...$('#dark-theme-select').options].some(o => o.value === 'custom'));
    check('主题 Tab 含颜色选择器', !!$('#color-text') && !!$('#color-bg'));
    check('custom 主题恢复：颜色选择器值为保存值', $('#color-text').value === '#112233' && $('#color-bg').value === '#445566');
    check('custom 主题下拉回退默认（不空白）', ['github-light','github-dark'].includes($('#light-theme-select').value));
    check('老 codeFormat=scroll 保留选中', $('#code-format-select').value === 'scroll');

    // ---- 5. 字体动态区域 ----
    $('#settings-tab-bar').querySelector('[data-tab="tab-font"]').click();
    const regions = $$('.font-region');
    check('6 个字体区域（含行内代码/代码块拆分）', regions.length === 6);
    check('区域顺序', regions.map(r => r.dataset.fontGroup).join(',') === 'heading,body,inline-code,code-block,link,quote');
    check('字体矩阵表格已移除', !$('.font-matrix-table'));
    check('每个区域含 等宽/衬线 开关 + 下拉', regions.every(r => r.querySelector('.font-mono-toggle') && r.querySelector('.font-serif-toggle') && r.querySelector('.font-family-select')));

    // 迁移验证：matrix-font-body=serif-mono → mono on + serif on + Courier
    const bodyRegion = $('.font-region[data-font-group="body"]');
    check('迁移 body: 等宽开', bodyRegion.querySelector('.font-mono-toggle').checked === true);
    check('迁移 body: 衬线开', bodyRegion.querySelector('.font-serif-toggle').checked === true);
    check('迁移 body: 选中 Courier New', bodyRegion.querySelector('.font-family-select').value === '"Courier New", monospace');
    check('迁移写入 localStorage', window.localStorage.getItem('font-body-mono') === 'on' && window.localStorage.getItem('font-body-family') === '"Courier New", monospace');

    // 迁移验证：matrix-font-code=sans-mono → 行内代码/代码块两份均 mono on + serif off
    const inlineCodeRegion = $('.font-region[data-font-group="inline-code"]');
    const codeBlockRegion = $('.font-region[data-font-group="code-block"]');
    check('迁移 行内代码: mono 开', inlineCodeRegion.querySelector('.font-mono-toggle').checked === true);
    check('迁移 行内代码: serif 关', inlineCodeRegion.querySelector('.font-serif-toggle').checked === false);
    check('迁移 代码块: mono 开', codeBlockRegion.querySelector('.font-mono-toggle').checked === true);
    check('迁移 代码块: serif 关', codeBlockRegion.querySelector('.font-serif-toggle').checked === false);
    check('迁移写入两份 localStorage', window.localStorage.getItem('font-inline-code-mono') === 'on' && window.localStorage.getItem('font-code-block-mono') === 'on');

    const headingRegion = $('.font-region[data-font-group="heading"]');
    check('迁移 heading(inherit): 开关全关', headingRegion.querySelector('.font-mono-toggle').checked === false && headingRegion.querySelector('.font-serif-toggle').checked === false);
    check('迁移 heading: 选中「默认（跟随全局）」', headingRegion.querySelector('.font-family-select').value === 'inherit');

    // 动态筛选：切换 body 开关，下拉列表类别变化
    const bodySelect = bodyRegion.querySelector('.font-family-select');
    const bodyMono = bodyRegion.querySelector('.font-mono-toggle');
    const bodySerif = bodyRegion.querySelector('.font-serif-toggle');
    // 当前 mono+serif → mono-serif 类别
    check('body 当前列表含等宽衬线字体（Courier）', [...bodySelect.options].some(o => o.value === '"Courier New", monospace'));
    // 关掉衬线 → mono-sans：Courier 应消失，Consolas 出现
    bodySerif.click();
    check('关闭衬线后 Courier 消失（类别筛选）', ![...bodySelect.options].some(o => o.value === '"Courier New", monospace'));
    check('关闭衬线后 Consolas 出现', [...bodySelect.options].some(o => o.value === 'Consolas, monospace'));
    check('切换后选中回退默认', bodySelect.value === 'inherit');
    // 选择字体 → CSS 变量设置
    bodySelect.value = 'Consolas, monospace';
    bodySelect.dispatchEvent(new window.Event('change', { bubbles: true }));
    check('选择字体后 --font-body 生效', document.documentElement.style.getPropertyValue('--font-body') === 'Consolas, monospace');
    check('字体选择写入 localStorage', window.localStorage.getItem('font-body-family') === 'Consolas, monospace');
    check('下拉 title 显示选中项全名', bodySelect.title === 'Consolas');

    // 行内代码 / 代码块独立控制 CSS 变量
    const inlineSel = inlineCodeRegion.querySelector('.font-family-select');
    inlineSel.value = 'Consolas, monospace';
    inlineSel.dispatchEvent(new window.Event('change', { bubbles: true }));
    check('行内代码字体 -> --font-inline-code', document.documentElement.style.getPropertyValue('--font-inline-code') === 'Consolas, monospace');
    const blockSel = codeBlockRegion.querySelector('.font-family-select');
    blockSel.value = '"DejaVu Sans Mono", monospace';
    blockSel.dispatchEvent(new window.Event('change', { bubbles: true }));
    check('代码块字体 -> --font-code-block', document.documentElement.style.getPropertyValue('--font-code-block') === '"DejaVu Sans Mono", monospace');

    // 滚动条与表格修复的 CSS 规则存在性
    const baseCss = fs.readFileSync(path.join(ROOT, 'template/css/base.css'), 'utf8');
    const codeCss = fs.readFileSync(path.join(ROOT, 'template/css/code.css'), 'utf8');
    check('滚动条：透明轨道 + 悬停显示（CSS）', /::-webkit-scrollbar-track[^{]*\{[^}]*transparent/s.test(baseCss) && /:hover::-webkit-scrollbar-thumb[^{]*\{[^}]*var\(--scrollbar-thumb\)/s.test(baseCss));
    check('滚动条：滑块细圆角（CSS）', /--scrollbar-size:\s*6px/.test(baseCss) && /border-radius:\s*calc\(var\(--scrollbar-size\) \/ 2\)/.test(baseCss));
    check('表格背景跟随内容宽度（CSS）', /\.table-wrapper:has\(\.table-format-scroll\) \.table-enhanced-inner[^{]*\{[^}]*width:\s*max-content[^}]*min-width:\s*100%/s.test(codeCss));
    check('自适应表格 wrapper 跟随内容宽度（CSS）', /\.table-wrapper:has\(\.table-format-adaptive\)[^{]*\{[^}]*width:\s*fit-content[^}]*min-width:\s*100%[^}]*max-width:\s*none/s.test(codeCss));
    const codeJs = fs.readFileSync(path.join(ROOT, 'template/js/code.js'), 'utf8');
    check('表格格式切换重置 wrapper 宽度（JS）', /\.style\.width = '';[^}]*\.style\.minWidth = '';[^}]*\.style\.maxWidth = '';/s.test(codeJs));
    check('code/pre 字体分离（CSS）', /--font-inline-code/.test(baseCss) && /--font-code-block/.test(baseCss) && /pre code[^{]*\{[^}]*var\(--font-code-block\)/.test(baseCss));

    // ---- 6. 面板按钮映射与关闭 ----
    $('#bar-settings').click();
    check('点击设置按钮显示面板', !$('#panel-settings').classList.contains('panel-hidden'));
    $('#bar-settings').click();
    check('再次点击隐藏面板', $('#panel-settings').classList.contains('panel-hidden'));
    $('#panel-settings .panel-close-btn').click();
    check('✕ 关闭面板', $('#panel-settings').classList.contains('panel-hidden'));

    // ---- 7. 其他 Tab 内容归属 ----
    const tabContents = {
        'tab-layout': ['canvas-toggle', 'width-slider', 'position-slider'],
        'tab-inline-code': ['code-inline-theme-select', 'code-inline-slider', 'code-inline-pad-slider'],
        'tab-code-block': ['code-format-select', 'code-theme-select', 'code-block-slider', 'code-line-numbers-toggle', 'code-header-toggle'],
        'tab-quote': ['quote-style-select'],
        'tab-table': ['table-format-select', 'table-header-toggle'],
        'tab-theme': ['light-theme-select', 'dark-theme-select', 'color-text', 'color-bg'],
    };
    for (const [tabId, ids] of Object.entries(tabContents)) {
        const pane = document.getElementById(tabId);
        check(`${tabId} 归属正确`, ids.every(id => pane.contains(document.getElementById(id))));
    }

    // ---- 8. 布局滚动（jsdom 计算样式不支持 flex，改为验证 CSS 源码规则）----
    const panelsCss = fs.readFileSync(path.join(ROOT, 'template/css/panels.css'), 'utf8');
    check('Tab 栏 flex-shrink: 0（CSS）', /\.settings-tab-bar[^{]*\{[^}]*flex-shrink:\s*0/s.test(panelsCss));
    check('内容区 overflow-y: auto（CSS）', /\.settings-pane\s*\{[^}]*overflow-y:\s*auto/s.test(panelsCss));
    check('内容区独立滚动+Tab 固定（.settings-panel-content 结构）', !!$('.settings-panel-content') && !!$('.settings-tab-bar'));
    check('卡片分组存在', $$('.settings-group').length >= 5 && $$('.settings-group-title').length >= 5);

    // ---- 9. 本机字体读取（Local Font Access API）----
    (async () => {
        check('存在「读取本机字体」按钮', !!$('#font-local-btn'));
        check('安全上下文+API 可用时按钮可点击', !$('#font-local-btn').disabled && /点击按钮读取本机字体/.test($('#font-local-status').textContent));

        await window.readLocalFonts();
        check('读取后状态提示成功', /已读取 3 个字体/.test($('#font-local-status').textContent));
        check('按钮变为「重新读取」', $('#font-local-btn').textContent === '重新读取本机字体');

        // jsdom 无 canvas，分类回退 prop-sans；查找任意含本机字体分组的下拉
        const selects = $$('.font-family-select');
        const withLocal = selects.filter(s => [...s.querySelectorAll('optgroup')].some(g => /本机字体/.test(g.label)));
        check('下拉列表出现本机字体分组', withLocal.length >= 1);
        const og = withLocal.length ? [...withLocal[0].querySelectorAll('optgroup')].find(g => /本机字体/.test(g.label)) : null;
        check('本机字体分组含 3 个选项', og && og.querySelectorAll('option').length === 3);
        check('本机字体选项悬停显示全名', og && [...og.querySelectorAll('option')].every(o => o.title === o.textContent && o.title.length > 0));
        check('本机字体 value 为带引号的字体栈', og && og.querySelector('option').value === '"Test Mono X"');

        // 缓存写入与恢复
        const cached = JSON.parse(window.localStorage.getItem('wblog-local-fonts-v1') || 'null');
        check('缓存已写入 localStorage', cached && cached['prop-sans'].length === 3);
        window.restoreSavedSettings(); // 再次初始化走缓存路径
        check('缓存恢复提示', /已加载 3 个本机字体缓存/.test($('#font-local-status').textContent));

        // 能力降级分支：浏览器不支持 -> 非安全上下文
        delete window.queryLocalFonts;
        window.restoreSavedSettings();
        check('无 API 时禁用并提示不支持', $('#font-local-btn').disabled && /不支持 Local Font Access API/.test($('#font-local-status').textContent));
        window.queryLocalFonts = () => Promise.resolve([]);
        Object.defineProperty(window, 'isSecureContext', { value: false, configurable: true });
        window.restoreSavedSettings();
        check('非安全上下文时禁用并提示 HTTPS', $('#font-local-btn').disabled && /HTTPS\s*或\s*localhost/.test($('#font-local-status').textContent));
    })().then(() => {
        console.log(fail === 0 ? '\n=== 端到端测试全部通过 ===' : `\n=== ${fail} 项失败 ===`);
        process.exit(fail === 0 ? 0 : 1);
    });
}, 300);
