# 使用 Nginx 作为基础镜像
FROM nginx:latest

# 删除默认 Nginx 配置
RUN rm /etc/nginx/conf.d/default.conf

# 复制 Nginx 配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制前端构建文件到 Nginx 目录
COPY dist /usr/share/nginx/html

# 暴露端口
EXPOSE 5002

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
