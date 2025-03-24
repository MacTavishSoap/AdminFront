# 使用 Node.js 进行构建
FROM node:18 AS build

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package.json package-lock.json ./

# 安装依赖
RUN npm install

# 复制所有项目文件
COPY . .

# 运行 Vite 构建
RUN npm run build

# ---- 生产环境 ----
# 使用 Nginx 作为静态文件服务器
FROM nginx:alpine

# 设置 Nginx 工作目录
WORKDIR /usr/share/nginx/html

# 清理默认的 Nginx 静态资源
RUN rm -rf ./*

# 复制前端构建的 dist 目录到 Nginx 静态目录
COPY --from=build /app/dist .

# 复制自定义的 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
