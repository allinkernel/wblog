// ==================== 阅读主题管理 ====================
const root = document.documentElement;

const readerThemeMap = {
    'custom': {text:'#222222', bg:'#fbfbfb', surface:'#ffffff', surface2:'#f6f8fa', border:'#d0d7de', muted:'#57606a', link:'#0969da', hover:'#0550ae', accent:'#1890ff', quoteBg:'rgba(0,0,0,.03)', quoteBorder:'#d0d7de', quoteMark:'rgba(0,0,0,.22)'},
    // lightmind：山林氛围 Typora 主题（input/lightmind.css）适配
    'lightmind': {
        text: '#2c3a32',
        bg: '#f4f1e8',
        surface: '#faf7ef',
        surface2: '#ece8db',
        border: 'rgba(74,124,89,0.30)',
        muted: '#6b7a6f',
        link: '#4a7c59',
        hover: '#2f5a40',
        accent: '#4a7c59',
        quoteBg: '#ecefe6',
        quoteBorder: '#8fb39b',
        quoteMark: 'rgba(44,58,50,0.22)'
    },
    // lightmind-dark：暗夜森林版（input/lightmind-dark.css）适配
    'lightmind-dark': {
        text: '#d4dccf',
        bg: '#161d1a',
        surface: '#1d2622',
        surface2: '#232d28',
        border: 'rgba(127,190,146,0.28)',
        muted: '#9ba89e',
        link: '#7fbe92',
        hover: '#a8d4b6',
        accent: '#7fbe92',
        quoteBg: '#1d2722',
        quoteBorder: '#5a7d68',
        quoteMark: 'rgba(212,220,207,0.25)'
    },
    // mdmdt：Typora 主题（input/mdmdt.css）适配 — 极浅蓝白纸面 + 主蓝强调
    'mdmdt': {
        text: '#000000',
        bg: '#fafafc',
        surface: '#fafafc',
        surface2: '#ececee',
        border: '#d2d2d2',
        muted: '#666666',
        link: '#3e69d7',
        hover: '#2f56b8',
        accent: '#3e69d7',
        quoteBg: 'rgba(62,105,215,0.06)',
        quoteBorder: '#3e69d7',
        quoteMark: 'rgba(0,0,0,0.20)'
    },
    // mdmdt-dark：暗夜版（input/mdmdt-dark.css）适配
    'mdmdt-dark': {
        text: '#d0d0d0',
        bg: '#1b1b1f',
        surface: '#1b1b1f',
        surface2: '#282a32',
        border: '#464b50',
        muted: '#9aa0a8',
        link: '#3e69d7',
        hover: '#5a83e0',
        accent: '#3e69d7',
        quoteBg: 'rgba(62,105,215,0.12)',
        quoteBorder: '#3e69d7',
        quoteMark: 'rgba(208,208,208,0.22)'
    },
    'github-light': {
        text: '#1f2328',
        bg: '#ffffff',
        surface: '#ffffff',
        surface2: '#f6f8fa',
        border: '#d0d7de',
        muted: '#57606a',
        link: '#0969da',
        hover: '#0550ae',
        accent: '#0969da',
        quoteBg: '#f6f8fa',
        quoteBorder: '#d0d7de',
        quoteMark: 'rgba(31,35,40,0.22)'
    },
    'github-dark': {
        text: '#f0f6fc',
        bg: '#0d1117',
        surface: '#161b22',
        surface2: '#21262d',
        border: '#30363d',
        muted: '#8b949e',
        link: '#58a6ff',
        hover: '#79c0ff',
        accent: '#58a6ff',
        quoteBg: 'rgba(56,139,253,0.12)',
        quoteBorder: '#3b82f6',
        quoteMark: 'rgba(240,246,252,0.25)'
    },
    'claude-light': {text:'#3f3a36', bg:'#f7f4ee', surface:'#fbf9f5', surface2:'#eee9df', border:'#d9d1c5', muted:'#766d63', link:'#a75d32', hover:'#874621', accent:'#c66a3d', quoteBg:'#eee9df', quoteBorder:'#cfa98d', quoteMark:'rgba(92,69,53,.22)'},
    'claude-dark': {text:'#e8e1d9', bg:'#1f1d1a', surface:'#292622', surface2:'#332e29', border:'#4a433c', muted:'#a99f95', link:'#e0a27d', hover:'#f0b898', accent:'#d88b63', quoteBg:'rgba(216,139,99,.10)', quoteBorder:'#9b6a51', quoteMark:'rgba(232,225,217,.24)'},
    'notion-light': {text:'#37352f', bg:'#ffffff', surface:'#ffffff', surface2:'#f7f6f3', border:'#e6e6e3', muted:'#787774', link:'#2383e2', hover:'#1b6fbe', accent:'#2383e2', quoteBg:'#f7f6f3', quoteBorder:'#cfcfcb', quoteMark:'rgba(55,53,47,.22)'},
    'solarized-light': {text:'#657b83', bg:'#fdf6e3', surface:'#eee8d5', surface2:'#f6f0dc', border:'#d8cfb4', muted:'#93a1a1', link:'#268bd2', hover:'#2074b0', accent:'#b58900', quoteBg:'rgba(238,232,213,.75)', quoteBorder:'#93a1a1', quoteMark:'rgba(101,123,131,.25)'},
    'solarized-dark': {text:'#839496', bg:'#002b36', surface:'#073642', surface2:'#0a3b47', border:'#28535d', muted:'#657b83', link:'#2aa198', hover:'#5fcfc4', accent:'#b58900', quoteBg:'rgba(7,54,66,.8)', quoteBorder:'#586e75', quoteMark:'rgba(131,148,150,.25)'},
    'dracula': {text:'#f8f8f2', bg:'#282a36', surface:'#21222c', surface2:'#343746', border:'#44475a', muted:'#a5a8bd', link:'#8be9fd', hover:'#b6f3ff', accent:'#bd93f9', quoteBg:'rgba(189,147,249,.10)', quoteBorder:'#6272a4', quoteMark:'rgba(248,248,242,.24)'},
    'stack-overflow': {text:'#232629', bg:'#ffffff', surface:'#ffffff', surface2:'#f1f2f3', border:'#d6d9dc', muted:'#6a737c', link:'#0077cc', hover:'#005999', accent:'#f48024', quoteBg:'#f1f2f3', quoteBorder:'#d6d9dc', quoteMark:'rgba(35,38,41,.22)'},
    'catppuccin-latte': {text:'#4c4f69', bg:'#eff1f5', surface:'#e6e9ef', surface2:'#e6e9ef', border:'#ccd0da', muted:'#7c7f93', link:'#1e66f5', hover:'#1250c7', accent:'#8839ef', quoteBg:'rgba(136,57,239,.08)', quoteBorder:'#b4befe', quoteMark:'rgba(76,79,105,.22)'},
    'catppuccin-mocha': {text:'#cdd6f4', bg:'#1e1e2e', surface:'#181825', surface2:'#313244', border:'#45475a', muted:'#a6adc8', link:'#89b4fa', hover:'#b4d0ff', accent:'#cba6f7', quoteBg:'rgba(203,166,247,.10)', quoteBorder:'#585b70', quoteMark:'rgba(205,214,244,.24)'},
    'nord': {text:'#d8dee9', bg:'#2e3440', surface:'#3b4252', surface2:'#434c5e', border:'#4c566a', muted:'#8fbcbb', link:'#88c0d0', hover:'#a3d7e3', accent:'#81a1c1', quoteBg:'rgba(136,192,208,.10)', quoteBorder:'#5e81ac', quoteMark:'rgba(216,222,233,.24)'},
    'texi2html': {
        text: '#000000',
        bg: '#ffffff',
        surface: '#ffffff',
        surface2: '#ffffff',
        border: '#c8c8c8',
        muted: '#555555',
        link: '#0000ee',
        hover: '#551a8b',
        accent: '#000000',
        quoteBg: 'transparent',
        quoteBorder: '#000000',
        quoteMark: 'rgba(0,0,0,.22)'
    }
};

function setReaderThemeVariables(theme) {
    root.style.setProperty('--text-color', theme.text);
    root.style.setProperty('--bg-color', theme.bg);
    root.style.setProperty('--theme-surface', theme.surface);
    root.style.setProperty('--theme-surface-2', theme.surface2);
    root.style.setProperty('--theme-border', theme.border);
    root.style.setProperty('--theme-muted', theme.muted);
    root.style.setProperty('--theme-link', theme.link);
    root.style.setProperty('--theme-link-hover', theme.hover);
    root.style.setProperty('--theme-accent', theme.accent);
    root.style.setProperty('--theme-quote-bg', theme.quoteBg);
    root.style.setProperty('--theme-quote-border', theme.quoteBorder);
    root.style.setProperty('--theme-quote-mark', theme.quoteMark);
}

function applyReaderTheme(themeName) {
    const article = document.getElementById('article-container');
    const theme = readerThemeMap[themeName] || readerThemeMap.custom;
    if (!article) return;
    article.setAttribute('data-reader-theme', themeName);
    setReaderThemeVariables(theme);
}

function hexToRgb(hex) {
    const m = String(hex || '').replace('#','').match(/^([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!m) return null;
    const h = m[1].length === 3 ? m[1].split('').map(x => x + x).join('') : m[1];
    return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16) };
}

function mixHex(a, b, amount) {
    const x = hexToRgb(a), y = hexToRgb(b);
    if (!x || !y) return a;
    const t = Math.max(0, Math.min(1, amount));
    const c = k => Math.round(x[k] * (1-t) + y[k] * t).toString(16).padStart(2,'0');
    return `#${c('r')}${c('g')}${c('b')}`;
}

function applyCustomReaderColors(text, bg) {
    const rgb = hexToRgb(bg);
    const dark = rgb ? (0.299*rgb.r + 0.587*rgb.g + 0.114*rgb.b) < 150 : false;
    const surface = dark ? mixHex(bg, '#ffffff', 0.055) : mixHex(bg, '#ffffff', 0.72);
    const surface2 = dark ? mixHex(bg, '#ffffff', 0.10) : mixHex(bg, '#000000', 0.035);
    const border = dark ? mixHex(bg, '#ffffff', 0.18) : mixHex(bg, '#000000', 0.14);
    const muted = dark ? mixHex(text, bg, 0.48) : mixHex(text, bg, 0.52);
    const link = dark ? '#66b3ff' : '#0969da';
    const hover = dark ? '#8bc7ff' : '#0550ae';
    const accent = dark ? '#8ab4ff' : '#1890ff';
    const quoteBorder = dark ? mixHex(link, bg, 0.35) : mixHex(link, bg, 0.45);
    const quoteBg = dark ? `rgba(102,179,255,.10)` : `rgba(0,0,0,.035)`;
    const quoteMark = dark ? 'rgba(255,255,255,.24)' : 'rgba(0,0,0,.22)';
    const theme = {text, bg, surface, surface2, border, muted, link, hover, accent, quoteBg, quoteBorder, quoteMark};
    setReaderThemeVariables(theme);
}

// 导出全局
window.applyReaderTheme = applyReaderTheme;
window.applyCustomReaderColors = applyCustomReaderColors;
window.setReaderThemeVariables = setReaderThemeVariables;
window.hexToRgb = hexToRgb;
window.mixHex = mixHex;
window.readerThemeMap = readerThemeMap;
