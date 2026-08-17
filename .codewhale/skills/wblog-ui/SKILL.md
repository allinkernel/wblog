---
name: wblog-ui
description: Use when adjusting the wblog_new blog frontend template (template/ directory) — settings panel UI, theme colors, fonts, scrollbars, code blocks, tables, or verifying UI changes with jsdom/Playwright.
---

# wblog_new UI 工作台

wblog_new 前端模板（`template/`）的架构地图、关键机制、验证工作流与踩坑记录。改 UI 前先读本节，改完按「验证工作流」执行。

## 架构地图（文件职责）

- `template/template.html` — 唯一页面骨架：底部 Bar（`#bar-*`）、右侧面板（`#panel-*`，含设置面板 `#panel-settings`）、`#article-container` 渲染区。面板按 `panel-* ↔ bar-*` 映射。
- `css/base.css` — 全局 token：CSS 变量（`--theme-*`）、字体栈（`--font-stack-*`）、全局滚动条体系、正文排版。
- `css/theme.css` — 阅读主题适配（blockquote 多样式、暗色覆盖，广泛使用 `!important` 覆盖 base/panels）。
- `css/panels.css` — 面板/设置面板组件（Tab 栏、卡片分组 `.settings-group`、开关 `.switch`、字体区域 `.font-region`）。
- `css/code.css` — 代码块（`.code-block-*`）与表格（`.table-wrapper`/`.table-enhanced-inner`/三种格式）。
- `css/bottom-bar.css` — 底部悬浮按钮栏。
- `js/main.js` — 初始化入口（DOMContentLoaded）、面板开合、Tab 切换、主题模式、导出全局函数。
- `js/controls.js` — 全部设置控件的绑定/恢复（含字体配置、本机字体读取、旧配置迁移）。
- `js/theme.js` — `readerThemeMap` 主题定义；`setReaderThemeVariables` 向 `:root` 注入 `--theme-*`/`--text-color`/`--bg-color`。
- `js/code.js` — 代码块/表格增强（`enhanceTables`、`updateTableFormat(wrapper, format)`）。
- `js/navigation.js` — 文章加载、大纲树。

## 关键机制（改 UI 前必读）

1. **主题系统**：颜色必须用 CSS 变量。`--theme-surface/--theme-border/--theme-muted/--theme-link/--text-color/--bg-color` 由 `theme.js` 注入 `:root`，亮/暗自动切换。派生色用 `color-mix(in srgb, var(--text-color) 25%, transparent)`（项目已依赖 color-mix，Chrome 111+）。主题模式标记 `data-reader-theme` 挂在 `#article-container` 上；全局亮/暗由 `main.js applyThemeMode` 切换。
2. **设置面板**：Windows 属性窗口式 Tab — `.settings-tab-bar`（`flex-shrink:0` 固定）+ `.settings-pane`（`overflow-y:auto` 独立滚动，非激活 `display:none`）。面板开合状态存 `localStorage('panel-<id>')`。✕ 关闭按钮 `.panel-close-btn`。
3. **字体配置**：6 组（heading/body/inline-code/code-block/link/quote）→ CSS 变量 `--font-heading/--font-body/--font-inline-code/--font-code-block/--font-link/--font-quote`。映射表 `fontGroupMap` 与开关→类别函数 `getFontCategory` 在 `controls.js`。`code`（行内）与 `pre/pre code`（块级）**必须分开**控制，行内代码别误改代码块。
4. **本机字体读取**：Local Font Access API（`queryLocalFonts`），仅安全上下文（HTTPS 或 localhost）可用；Canvas 探测分类（等宽 `i`/`m` 宽度差 <1.5px；衬线用大写 `I` 顶行跨度/竖线跨度比 >1.6）；结果缓存 `localStorage('wblog-local-fonts-v1')`；不支持/非安全/拒绝时优雅降级到预置库 `FONT_LIBRARY`。
5. **全局滚动条**：`base.css` 统一体系 — `--scrollbar-size:6px`、滑块透明 + 容器 `:hover` 显示（`--scrollbar-thumb` 用 `color-mix` 派生自动适配亮暗）。新增滚动容器时把选择器加进 base.css 的 8 组 `::-webkit-scrollbar` 列表（含 hover 变体），并配 Firefox `scrollbar-width/scrollbar-color`。
6. **表格三种格式**（`updateTableFormat` 切换，类加在 `<table>` 上）：
   - `scroll`：`overflow-x:auto` + `.table-enhanced-inner { width:max-content; min-width:100% }` 背景跟随全宽。
   - `adaptive`：wrapper 必须 `width:fit-content; min-width:100%`（`max-width:none !important` 覆盖 JS 内联 `max-width:100%`），否则背景被钳制在版面宽、表格右侧露白。
   - `wrap`：`width:100%` + `table-layout:fixed` + 单元格 `break-word`。
   - `updateTableFormat` 重置段必须清理 `wrapper.style.width/minWidth/maxWidth`，防止切格式残留。

## 验证工作流（每次 UI 调整必须走）

1. 语法：`node --check template/js/*.js`
2. jsdom 端到端：`cd .codewhale/skills/wblog-ui/assets && npm i jsdom && node e2e-ui-test.js`（脚本内置 47+ 断言：面板/Tab/字体迁移/本机字体/滚动条/表格 CSS 规则；jsdom 需 mock `isSecureContext`/`queryLocalFonts`，见踩坑）。
3. Playwright 真机截图（推荐，环境 WSL2 无 GUI）：`~/pw-browser` 的 Chromium；`node visual-qa.js`（先启动预览服务）。截图输出 `/tmp/wblog-shots`，Windows 侧用 `explorer.exe /tmp/wblog-shots` 或 `\\wsl$\<发行版>\tmp\wblog-shots\` 查看。
4. 报告：改了哪些文件、验证了什么、遗留什么（如「未做真机检查」要明说）。

## 环境命令

- 预览服务：`cd /home/mindul/self/wblog_new && setsid nohup python3 -m http.server 8931 >/tmp/wblog-http.log 2>&1 < /dev/null & disown`（**必须 setsid**，否则随 shell 退出被杀）。Windows 浏览器访问 `http://localhost:8931/template/template.html`（WSL2 localhost 转发，localhost 属安全上下文 → 本机字体 API 可测）。
- Playwright：`node -e "const {chromium}=require('/home/mindul/pw-browser/node_modules/playwright');..."`（已装 Chromium 151，WSL2 挂载 `/mnt/c/Windows/Fonts` 可读到真实 Windows 字体）。
- jsdom：`/tmp/wblog-test/node_modules` 或 skill assets 内 `npm i jsdom`（脚本用 `NODE_PATH=/tmp/wblog-test/node_modules node <script>` 也可）。

## 踩坑记录（已踩，勿重蹈）

- **inline-block shrink-to-fit 钳制宽度**：`display:inline-block` + `max-width:100%` 会把元素宽限制在可用宽内 → 内容溢出时背景断层（自适应表格就是这个坑）。
- **等宽字体衬线误判**：Consolas/DejaVu Sans Mono 的大写 `I` 自带横杠占满字格，衬线检测会误报 serif — 等宽字体直接归 mono-sans（等宽衬线由预置库 mono-serif 覆盖）。
- **jsdom 缺失**：`isSecureContext` 为 undefined（localhost 真实浏览器是 true）、无 `queryLocalFonts`、无 canvas（`getContext` 返回 null）— 测试脚本在 eval JS **之前** mock；`detectFontFeatures` 对无 ctx 返回默认类。
- **WSL2 服务保活**：`python3 -m http.server` 后台启动要 `setsid + nohup + disown`。
- **/tmp 会丢**：测试脚本已固化到本 skill `assets/`；截图目录重启后重建即可。
- **localStorage 键名迁移**：改动设置键名必须写迁移（参考 `controls.js migrateLegacyCodeFont`：旧 `font-code-*` → 行内代码/代码块两份）。
- **jsdom 测试环境**：`data-reader-theme`/`--theme-*` 由 `theme.js` 注入，CSS 断言用源码正则匹配（jsdom 不支持 flex 计算样式）。

## 安全与边界

- 只改 `template/` 下前端文件；不动 `kernel/`、构建产物 `out/dist/`、`build/`。
- `template/todo.md` 第 0 条是无关遗留，勿动。
- 项目背景（构建/部署/主题机制/设计原则）已并入 `.codewhale/instructions.md`（自动加载），无需再读 `build/deepseek.md`。
