# wblog

## 项目全景
```
$ tree -L 3
.
├── LICENSE
├── README.md
├── css
│   ├── base.css
│   ├── bottom-bar.css
│   ├── code.css
│   ├── panels.css
│   └── theme.css
├── gbb
├── index.html
├── install.md
├── js
│   ├── code.js
│   ├── controls.js
│   ├── main.js
│   ├── navigation.js
│   └── theme.js
├── nginx_conf
│   ├── readme.md
│   └── template.conf
├── template.html
├── todo.md
├── .codewhale
│   ├── instructions.md
│   ├── skills
│   │   └── wblog-ui
│   │       ├── SKILL.md
│   │       └── assets
│   │           ├── e2e-ui-test.js
│   │           └── visual-qa.js
│   └── state
│       └── subagents.v1.lock
└── 新要求.html
```

1. nginx_conf中放的是nginx的配置，这个文件要配置js/navigation.js协同工作，处理路由逻辑
2. `template.html`/`css`/`js`三项是前端模板文件
3. `install.md`记录了编译、安装流程
4. `gbb`记录了一键上库执行的命令，可以通过`wtool`中的工具自行识别执行
5. `todo.md`记录未来要实现的需求，不会一直更新
6. `新要求.html`记录历史上的需求记录
7. `.codewhale`记录让deepseek自动生成的skill等
