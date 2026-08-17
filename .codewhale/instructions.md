# wblog_new 项目指令（自动加载总入口）

本文件每次会话自动加载；`wblog-ui` skill 为 UI 调整的详细知识库（按需加载）。历史背景文档 `build/deepseek.md` 已并入本文，无需再读。

## 项目背景

- **纯静态博客平台**：文章由 Markdown 编写，Pandoc 编译为静态 HTML；前端 SPA 风格，用户设置存 `localStorage`，无需刷新。
- **文章结构**：每篇文章一个目录，内含 `index.md`；目录下可有子目录（子文章）。
- **主题机制**：目录向上找最近的 `index.md` 归属主题（如 `kernel/linux/index.md` 定义 `linux` 主题；其父目录 `kernel/` 无 `index.md`）。
- **构建系统**：`./build.sh` → `build/generate_ninja.py` 扫描所有 `index.md` 生成 `out/build.ninja` 与 `out/dist/manifest.json` → `ninja -f out/build.ninja`（pandoc→html）输出 `out/dist/articles` → `template` 软链到 `out/dist/template`。
- **部署**：`out/dist/` 为网站根目录（类 `/var/www/html/`），Nginx 静态服务；配置模板 `template/nginx_conf/template.conf`。

## 设计原则（红线）

1. **模块化**：JS/CSS 已按功能拆分（`css/` 5 个、`js/` 5 个），严禁合并回一个文件。
2. **主题系统**：颜色必须用 CSS 变量（`--theme-*`），硬编码仅在绝对必要时；派生色用 `color-mix`。
3. **默认配置**：`localStorage` 读写用户设置；`isDefaultMode` 切换恢复默认。
4. **性能**：避免频繁 DOM 重排，用 `requestAnimationFrame`/`setTimeout` 延迟渲染。
5. 不动 `kernel/`、`build/`、`out/dist/`；`template/todo.md` 第 0 条为无关遗留勿动；改动 localStorage 键名必须写迁移。

## 前端 UI 调整工作流

- **必须加载 `wblog-ui` skill**（`.codewhale/skills/wblog-ui/SKILL.md`），按其架构地图、关键机制、验证工作流与踩坑记录执行。用户说「调整 UI / 改模板 / 改样式」等同义需求时默认走此流程。
- **验证最低要求**：`node --check` 全部 JS → 运行 `wblog-ui` skill 的 `assets/e2e-ui-test.js`（jsdom 端到端）→ 有条件再做 Playwright 真机截图（`~/pw-browser`）。未做真机检查时必须在报告中明说。
- **知识沉淀（保底约定）**：每次代码生成完毕后，将新学到的知识点按需更新到 skill（`.codewhale/skills/wblog-ui/` 的 SKILL.md 或 references/），无需用户再次提醒。例如：Typora 主题中标题下方横线、装饰条等视觉细节也属于主题的一部分，移植时必须一并迁移并记入 skill。
- 测试脚本与截图均为一次性资产：脚本固化在 skill `assets/`（勿放 /tmp）；截图输出 `/tmp/wblog-shots`。

## 环境

- WSL2 无 GUI；预览需 `setsid nohup python3 -m http.server 8931`（否则随 shell 退出被杀），Windows 浏览器访问 `http://localhost:8931/template/template.html`。
- `localhost` 属安全上下文 → Local Font Access API（本机字体读取）可测；生产环境需 HTTPS 才可用该 API。
