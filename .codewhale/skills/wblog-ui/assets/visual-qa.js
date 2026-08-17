// 真机验证（修正版）：滚动条重构 / 字体拆分 / 表格背景延伸
const { chromium } = require('/home/mindul/pw-browser/node_modules/playwright');
const fs = require('fs');
const SHOT_DIR = '/tmp/wblog-shots';
fs.mkdirSync(SHOT_DIR, { recursive: true });

(async () => {
    const browser = await chromium.launch({ headless: true });
    // 视口调矮，确保设置面板内容可滚动
    const context = await browser.newContext({ viewport: { width: 1440, height: 640 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));

    await page.goto('http://localhost:8931/template/template.html', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('#bar-settings', { timeout: 10000 });
    await page.click('#bar-settings');
    await page.click('.settings-tab[data-tab="tab-font"]');
    await page.waitForSelector('#tab-font.active');
    await page.waitForTimeout(300);

    // ===== 1. 字体拆分（亮色）=====
    const groups = await page.evaluate(() => [...document.querySelectorAll('.font-region')].map(r => r.dataset.fontGroup));
    console.log('字体区域顺序:', groups.join(' -> '));
    await page.screenshot({ path: `${SHOT_DIR}/5-font-tab-split-light.png` });

    // ===== 2. 滚动条（亮色）：激活面板可滚动 + 悬停显示 =====
    const sbLight = await page.evaluate(() => {
        const p = document.querySelector('.settings-pane.active');
        p.scrollTop = p.scrollHeight;
        return {
            canScroll: p.scrollHeight > p.clientHeight,
            scrollTop: Math.round(p.scrollTop),
            scrollHeight: p.scrollHeight,
            clientHeight: p.clientHeight,
            scrollbarColor: getComputedStyle(p).scrollbarColor,
        };
    });
    console.log('亮色激活面板滚动条:', JSON.stringify(sbLight));
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${SHOT_DIR}/6-scrollbar-hover-light.png` });

    // ===== 3. 表格背景延伸（亮色）=====
    await page.evaluate(() => {
        const article = document.getElementById('article-container');
        article.innerHTML = '<h2>宽表格测试</h2>';
        const wrapper = document.createElement('div');
        wrapper.className = 'table-wrapper';
        const table = document.createElement('table');
        table.className = 'table-enhanced-inner table-format-scroll';
        const thead = document.createElement('thead');
        const trh = document.createElement('tr');
        const tbody = document.createElement('tbody');
        const trb = document.createElement('tr');
        for (let i = 1; i <= 30; i++) {
            const th = document.createElement('th');
            th.textContent = '列 ' + i;
            th.style.whiteSpace = 'nowrap';
            trh.appendChild(th);
            const td = document.createElement('td');
            td.textContent = '内容值 ' + i + ' 较长的单元格文字';
            td.style.whiteSpace = 'nowrap';
            trb.appendChild(td);
        }
        thead.appendChild(trh);
        tbody.appendChild(trb);
        table.appendChild(thead);
        table.appendChild(tbody);
        wrapper.appendChild(table);
        article.appendChild(wrapper);
    });
    await page.waitForTimeout(300);
    const tableMetrics = await page.evaluate(() => {
        const wrapper = document.querySelector('.table-wrapper');
        const table = document.querySelector('.table-enhanced-inner');
        return {
            wrapperClient: wrapper.clientWidth,
            wrapperScroll: wrapper.scrollWidth,
            tableWidth: Math.round(table.getBoundingClientRect().width),
            tableMinWidth: getComputedStyle(table).minWidth,
            wrapperBg: getComputedStyle(wrapper).backgroundColor,
        };
    });
    console.log('表格宽度指标(亮):', JSON.stringify(tableMetrics));
    await page.evaluate(() => { document.querySelector('.table-wrapper').scrollLeft = 99999; });
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${SHOT_DIR}/9-table-scroll-right-light.png` });

    // ===== 4. 暗色主题：滚动条 + 字体 Tab + 表格 =====
    await page.click('#bar-theme');
    await page.waitForTimeout(400);
    const sbDark = await page.evaluate(() => {
        const p = document.querySelector('.settings-pane.active');
        p.scrollTop = p.scrollHeight;
        return {
            scrollbarColor: getComputedStyle(p).scrollbarColor,
            thumbVar: getComputedStyle(document.documentElement).getPropertyValue('--scrollbar-thumb').trim(),
            bodyThumbVar: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim(),
        };
    });
    console.log('暗色激活面板滚动条:', JSON.stringify(sbDark));
    await page.screenshot({ path: `${SHOT_DIR}/7-scrollbar-dark.png` });
    await page.screenshot({ path: `${SHOT_DIR}/8-font-tab-dark.png` });
    await page.screenshot({ path: `${SHOT_DIR}/10-table-scroll-right-dark.png` });

    console.log('--- pageerror:', errors.length ? errors.join('\n') : '无');
    await browser.close();
})().catch(e => { console.error('失败:', e.message); process.exit(1); });
