# nginx路由逻辑

在构建完毕后，会在源码目录的`out/dist`下生成模板、manifest、articles/，如下
```bash
 $ tree out/dist
 out/dist
 ├── articles
 │   └── linux
 │       ├── build-linux
 │       │   ├── index.html
 │       │   ├── ubuntu平台编译安装linux内核
 │       │   │   └── index.html
 │       │   ├── ubuntu平台编译安装内核模块
 │       │   │   └── index.html
 │       │   ├── 构建内核-__all目标
 │       │   │   ├── index.html
 │       │   │   └── 声明式构建框架-Makfile.build
 │       │   │       ├── index.html
 │       │   │       ├── make命令的环境变量及参数
 │       │   │       │   └── index.html
 │       │   │       ├── scripts目录下的工具
 │       │   │       │   └── index.html
 │       │   │       ├── 内核构建系统中各种函数与规则解析
 │       │   │       │   └── index.html
 │       │   │       └── 内核构建系统中各种目标
 │       │   │           └── index.html
 │       │   ├── 编译独立的内核模块
 │       │   │   └── index.html
 │       │   └── 配置内核-%config目标
 │       │       ├── index.html
 │       │       └── lexer.l和parse.y
 │       │           └── index.html
 │       └── index.html
 ├── manifest.json
 └── template -> ../../template

网站的工作逻辑是
1. 无论传过来的uri`http[s]://XXX:8888/a/b/c`的格式是什么，都直接返回`/template/template.html`，让其加载`navigation.js`脚本来处理后续加载逻辑，因为所有的文章都需要template.html的渲染。
2. 如果传过来的是css/js等，由于这些文件是为template.html服务的，且路径也是在template/下，所以必须直接返回，不要加载template.html
3. template.html加载navigation.js之后，这个脚本处理uri的逻辑如下：
```javascript
if (path === '/' || path === '/index.html') {
    fileToFetch = '/template/index.html';
} else if (path.endsWith('/index')) {
    fileToFetch = `/articles${path}.html`;
} else {
    fileToFetch = `/articles${path}`;
}

```
如果你传入的uri不包含articles，它会直接加上/articles发给nginx，接收到后，就直接由template.html渲染了


所以nginx的配置就很简单了

```
server {
    listen 8888;
    server_name localhost;
    root /home/mindul/self/wblog_new/out/dist;   # 这个路径要自行调整以适配服务器

    # 如果请求的是静态资源，nginx直接返回
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|webp|woff2?|ttf|eot|json)$ {
        expires 7d;
        try_files $uri =404;
    }

    # 剩下的请求中，只要不存在对应的文件
    # nginx就应该返回/template/template.html
    location / {
        try_files $uri /template/template.html;
    }
    # out/dist/manifest.json是可以直接请求到的，其他的文件不会有此情况
     

    # 浏览器接受到template.html加载navigation.js后
    # 将请求的uri前边加上articles/再次传给nginx
    # 由于所有html都保存在out/dist/articles/目录下
    # 所以这第二次的api间接请求文件就可以正常工作了
    location /articles/ {
        try_files $uri $uri.html =404;
    }

}
