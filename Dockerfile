# 多阶段构建 - 第一阶段：构建前端
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 复制测试服配置文件作为 .env (Docker 构建使用测试服配置)
COPY .env.test .env

# 构建生产版本
RUN npm run build

# 第二阶段：使用 nginx 提供静态文件服务
FROM nginx:alpine

# 复制构建产物到 nginx 默认目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置文件（如果有自定义配置）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
