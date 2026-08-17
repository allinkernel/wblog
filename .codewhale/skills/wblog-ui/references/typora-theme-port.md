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
