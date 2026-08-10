# 安装说明

## 编译方法
此项目直接依赖于`wtool`，所以必须保证wtool在系统上已经正确安装好了
在根目录下直接执行`zsh build.sh`，此脚本所做的工作如下：
1. 调用`generate_ninja.py`读取每个子目录下的wsw_blog.xml，直接生成`build.ninja`，其中是md等类型文件翻译成html的命令；
2. 调用`ninja`执行这个`build.ninja`，生成html到`out/dist/articles`和`out/dist/manifest.json`
3. 将当前这个模板仓库，直接软连接到`out/dist/template`

编译完毕后，需要通过`nginx`启动`web`服务器，指定静态网站根目录时指定到`out/dist`的绝对路径就行了，下边会讲

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


  #mail {
  #       # See sample authentication script at:
  #       # http://wiki.nginx.org/ImapAuthenticateWithApachePhpScript
  #
  #       # auth_http localhost/auth.php;
  #       # pop3_capabilities "TOP" "USER";
  #       # imap_capabilities "IMAP4rev1" "UIDPLUS";
  #
  #       server {
  #               listen     localhost:110;
  #               protocol   pop3;
  #               proxy      on;
  #       }
  #
  #       server {
  #               listen     localhost:143;
  #               protocol   imap;
  #               proxy      on;
  #       }
  #}
  ```

2. 特定服务配置文件，比如我的文章和模板保存在目录`/home/mindul/self/wblog/out/dist`下，
配置文件中的`root`就必须配置到这个目录
```
$ cat /etc/nginx/conf.d/my-static-site.conf
server {
    listen 8888;                      # 监听 8080
    server_name localhost;            # 可以是域名或 IP
    root /home/mindul/self/wblog/out/dist;          # 对应目录 A
    index index.html;

    location / {
        try_files $uri $uri/ /template/template.html;
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

