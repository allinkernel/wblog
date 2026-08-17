# wblog_new 项目指令

- **项目背景**：先读 `build/deepseek.md`（静态博客构建、主题机制、目录结构、设计原则）。
- **前端 UI 调整**：加载 `wblog-ui` skill（`.codewhale/skills/wblog-ui/SKILL.md`），按其架构地图、验证工作流与踩坑记录执行。用户说「调整 UI / 改模板 / 改样式」等同义需求时默认走此流程。
- **验证最低要求**：`node --check` 全部 JS → 运行 `wblog-ui` skill 的 `assets/e2e-ui-test.js`（jsdom 端到端）→ 有条件再做 Playwright 真机截图（`~/pw-browser`）。未做真机检查时必须在报告中明说。
- **红线**：JS/CSS 保持模块化不合并；颜色必须用 `--theme-*` CSS 变量（派生色用 `color-mix`）；不动 `kernel/`、`build/`、`out/dist/`；`template/todo.md` 第 0 条为无关遗留勿动；改动 localStorage 键名必须写迁移。
- **环境**：WSL2 无 GUI；预览 `setsid nohup python3 -m http.server 8931`，Windows 浏览器访问 `http://localhost:8931/template/template.html`（localhost 属安全上下文，本机字体 API 可测）。
