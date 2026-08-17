# 安装说明

## 编译方法
在根目录下直接执行`./build.sh`，此脚本所做的工作如下：
1. 调用`generate_ninja.py`读取每个子目录下的wsw_blog.xml，直接生成`out/build.ninja`，其中是md等类型文件翻译成html的命令；
2. 调用`ninja`执行这个`build.ninja`，生成html到`out/dist/articles`和`out/dist/manifest.json`
3. 将当前这个模板仓库，直接软连接到`out/dist/template`

编译完毕后，需要通过`nginx`启动`web`服务器，指定静态网站根目录时指定到`out/dist`的绝对路径即可。nginx相关的配置模板可以直接查看`nginx_conf`目录下的模板文件，根据系统环境自行调整。

## 使用方法
当前目录下的模板文件会被外层的build.sh直接软连接到out/dist/template，和同目录下的其他两项共同工作
```bash 
$ ls out/dist
articles  manifest.json  template
```

## nginx配置方法
wsw_blog的模板要配合nginx使用，nginx配置文件。重点是这个nginx.conf的```user mindul```不能遗漏，否则就permission denied无法加载当前mindul用户家目录下的html网页了，后续如果要调整切换到正式服务器，考虑把博客放到/var下

1. 根配置文件，除了`user mindul`其他的都是默认的

  ``` conf
  $ cat /etc/nginx/nginx.conf
  user mindul;
  worker_processes auto;
  pid /run/nginx.pid;
  error_log /var/log/nginx/error.log;
  include /etc/nginx/modules-enabled/*.conf;

  events {
          worker_connections 768;
          # multi_accept on;
  }

  http {

          ##
          # Basic Settings
          ##

          sendfile on;
          tcp_nopush on;
          types_hash_max_size 2048;
          # server_tokens off;

          # server_names_hash_bucket_size 64;
          # server_name_in_redirect off;

          include /etc/nginx/mime.types;
          default_type application/octet-stream;

          ##
          # SSL Settings
          ##

          ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3; # Dropping SSLv3, ref: POODLE
          ssl_prefer_server_ciphers on;

          ##
          # Logging Settings
          ##

          access_log /var/log/nginx/access.log;

          ##
          # Gzip Settings
          ##

          gzip on;

          # gzip_vary on;
          # gzip_proxied any;
          # gzip_comp_level 6;
          # gzip_buffers 16 8k;
          # gzip_http_version 1.1;
          # gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

          ##
          # Virtual Host Configs
          ##

          include /etc/nginx/conf.d/*.conf;
          include /etc/nginx/sites-enabled/*;
  }
```

2. 特定服务配置文件，比如我的文章和模板保存在目录`/home/mindul/self/wblog/out/dist`下，
配置文件中的`root`就必须配置到这个目录
```
server {
    listen 8888;
    server_name localhost;
    root /home/mindul/self/wblog_new/out/dist;   # 这个路径要自行调整以适配服务器

    # 如果请求的是静态资源，nginx直接返回
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|webp|woff2?|ttf|eot)$ {
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
```

### 重启服务
配置文件更该完毕后，还需要重新启动`nginx`服务，通过执行以下命令
```bash
sudo systemctl reload nginx.service
```


### nginx日志查看方法
```bash
sudo tail -f /var/log/nginx/error.log
```

可以通过这个命令查看某个网页无法加载的原因

