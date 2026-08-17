# 从 Typora 主题生成 wblog 模板主题

把 `input/` 下的 Typora 主题 CSS（如 `lightmind.css` / `lightmind-dark.css`）移植为模板可选阅读主题的标准流程。

## 适用场景

- 用户提供 Typora 主题 CSS，要求加入 `template` 的可选主题配色（亮色 / 暗色各一套）。

## 移植流程

### 1. 读取 Typora 主题的设计令牌

Typora 主题 CSS 开头通常有 `:root { ... }` 设计令牌区。提取：

| 令牌 | 含义 |
|---|---|
| `--bg-page` / `--bg-write` / `--bg-soft` | 页面外底 / 写作区 / 次表面 |
| `--fg-main` / `--fg-muted` / `--fg-heading` | 正文 / 次要 / 标题文字 |
| `--accent` / `--accent-deep` / `--accent-soft` | 强调 / 深强调（hover）/ 柔和强调 |
| `--bg-quote` / `--bg-inline-code` | 引用块 / 行内代码底色 |
| `--code-bg` / `--code-line` | 代码块底 / 边框 |

### 2. 映射到 `theme.js` 的 `readerThemeMap` 字段

```js
'主题名': {
    text:   <-- fg-main
    bg:     <-- bg-page
    surface:<-- bg-write        // 面板/卡片，比页面略亮
    surface2:<-- bg-soft        // 表头、次要表面
    border: <-- 主题边框色；无显式变量时用 accent 低透明度 rgba(accent, 0.28~0.35)
    muted:  <-- fg-muted
    link:   <-- accent
    hover:  <-- accent-deep     // 暗色主题注意：暗底上用「更亮」的强调色
    accent: <-- accent
    quoteBg:<-- bg-quote
    quoteBorder:<-- accent-soft
    quoteMark: rgba(fg-main, 0.22)  // 浅色用 0.22，暗色用 0.25
}
```

### 3. 加入下拉选项（`template.html`）

日间/夜间下拉各加 `<option value="主题名">描述</option>`，**第一项作为默认**（label 写「xxx 默认」）。

### 4. 更新默认主题引用（全局替换，保留 GitHub 选项本身）

搜索 `github-light` / `github-dark` 全部默认引用并替换为新主题名：

- `js/controls.js`：`savedTheme`、`defaultLightTheme`、`defaultDarkTheme`、`readerThemeMap[...]` fallback、`resolveSelectValue` fallback
- `js/main.js`：`applyThemeMode`（亮/暗默认）、`currentTheme` 默认、`getDefaultConfig`（readerTheme/lightTheme/darkTheme）、`saveUserConfig`、`initThemeMode`、`setSelectIfValid` fallback
- `js/navigation.js`：文章加载后 `currentTheme` fallback

`readerThemeMap` 里的 `github-light/github-dark` 定义与下拉里的 GitHub 选项**保留**（老用户 localStorage 存的旧主题名仍能命中，无需迁移脚本）。

### 5. 验证

1. `node --check template/js/*.js`
2. e2e 加断言：下拉首项 value/label、`readerThemeMap` 含新主题、`applyReaderTheme('新主题')` 后 `--bg-color`/`--theme-link` 变量正确
3. Playwright 截图：注入演示内容（h1/p/blockquote/table），亮/暗各截一张，检查 `body` 背景与正文 `font-family`

## 踩坑记录

- **暗色 hover 用更亮的强调色**：暗底上 `accent-deep` 通常比 `accent` 亮（如 lightmind-dark：`#7fbe92` → hover `#a8d4b6`），照搬亮色映射会让 hover 不可见。
- **border 别用深文字色**：Typora 原主题边框多是 `rgba(accent, 0.15~0.35)` 半透明，直接套用该风格最和谐。
- **主题名含 `dark` 后缀**：`isDark = savedTheme.includes('dark')` 决定主题归入日间还是夜间，暗色主题命名必须带 `dark`。
- **老用户兼容**：新增主题时保留旧主题定义与选项，`resolveSelectValue`/`setSelectIfValid` 会在保存值无效时回退默认，不会白屏。
- **正文默认字体**：如需统一默认正文字体（如 LXGW WenKai），改 `base.css` 的 `--font-body` 默认值（字体栈第一个字族），所有主题的「默认（跟随全局）」选项都会生效。

## 标题装饰迁移（重要）

Typora 主题里 `#write h1/h2` 的 `border-bottom` 横线、`h3::before` 装饰条、`h4~h6` 的颜色层级**都是主题个性**，必须迁移，否则观感与 Typora 不一致。模板中写到 `theme.css` 的 `#article-container[data-reader-theme="主题名"]` 作用域（亮/暗都要写，`:is()` 合并选择器），要点：

- 标题色用 `var(--theme-link-hover)`（= accent-deep）；h5 用 `var(--theme-muted)`；h6 用 `color-mix(in srgb, var(--theme-muted) 75%, var(--text-color))`。
- 横线：h1 `2px solid var(--theme-accent)`；h2 `1px solid color-mix(in srgb, var(--theme-accent) 25%, transparent)`（对应 Typora 的 `rgba(accent, .25)`）。
- 装饰条：`h3::before { content:""; display:inline-block; width:4px; height:.95em; background:var(--theme-accent); border-radius:2px; margin-right:.55em; vertical-align:-.08em; }`。
- 覆盖 base.css 的标题 `opacity`（用 `opacity:1`）与字号（Typora 用 1.85em/1.5em/1.25em/1.1em/1em/.95em 层级）。

## 全量细节清单（lightmind 实战，其余 Typora 主题照此逐项检查）

除标题外，Typora 主题还有这些视觉细节需要迁移（模板中统一放 `theme.css` 的 `[data-reader-theme="主题名"]` 作用域，用 `--theme-*` 变量 + `color-mix` 适配亮暗）：

- **表格**：隔行条纹 `tbody tr:nth-child(even) { background: var(--theme-surface-2) }`；表头绿底白字 `thead { background: var(--theme-accent) }` + `th { color: #faf7ef }`；2px 深绿外框 `border: 2px solid var(--theme-link-hover)`；单元格边框 `color-mix(in srgb, var(--theme-accent) 30~38%, transparent)`；`border-collapse: separate` + `border-spacing: 0` + `border-radius` + `overflow: hidden`。
- **引用**：卡片式（bg-quote 底 + 左 4px accent 条 + 1px 边框 + 圆角）；嵌套引用（accent-soft 左条 + 半透明白底）。模板引用有 `[data-quote-style=...]` 系统，主题样式应限定在 `[data-quote-style="global"]`（继承主题）时生效，用户显式选择的样式优先。
- **md-alert 警告块**（Typora 原生 `> [!NOTE]`，pandoc 不产生，手写 HTML 时生效）：`.md-alert` 基础样式 + 五种变体（note 蓝 / tip 绿 / important 紫 / warning 金 / caution 红），亮暗两套色值（暗色用 `rgba(accent, 0.1)` 底 + 更亮的 accent）。
- **分隔线 hr**：渐变 `linear-gradient(to right, transparent, accent-soft 30%, accent-soft 70%, transparent)`。
- **列表**：`ul > li::marker { color: var(--theme-accent) }`、`ol > li::marker { color: var(--theme-link-hover); font-weight: 600 }`。
- **链接**：`text-decoration: none` + `border-bottom: 1px solid color-mix(in srgb, var(--theme-accent) 35~50%, transparent)`。
- **代码块配色**：`[data-reader-theme=...][data-code-theme="global"] .code-block-wrapper` 覆盖 `--code-bg-color/--code-header-bg/--code-border-color/--code-header-text/--code-linenum-color/--code-text-color`（lightmind：米纸 #f4f1e8 / 暗夜海军蓝 #14181f）。
- **行内代码底色**：`[data-reader-theme=...][data-code-inline-theme="global"] code:not(pre code)` 覆盖背景为 Typora 的行内代码蒙层色（lightmind 浅绿 #e7eee5）。
- **图片**：圆角 + 阴影 + 块级居中。

## 代码块双字体：字体栈回退方案

「代码块中汉字用 A 字体、代码用 B 字体」无需 token 级高亮（当前 pandoc 未启用 `--highlight-style`，文章无 `.tok-*` 类）— 用字体栈回退天然实现：

```css
font-family: var(--font-code-block-code), var(--font-code-block-comment), monospace;
--font-code-block-code: "JetBrains Mono", "Cascadia Code", Consolas, "Liberation Mono", monospace;
--font-code-block-comment: "LXGW WenKai Mono", "LXGW WenKai", "Noto Sans Mono CJK SC", "Noto Serif CJK SC", serif;
```

拉丁字符由第一段渲染，汉字（注释/字符串）因第一段无字形自动回退到第二段。UI 上拆两个配置块（代码正文/注释）分别控制两段；旧 `font-code-*`/`font-code-block-*` 设置迁移到「代码正文」段，注释段保留新默认（不覆盖）。行内代码默认第一字体用 WenKai Mono（行内代码常含中文）。
