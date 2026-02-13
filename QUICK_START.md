# 🚀 前端 Docker 部署 - 快速开始

## ⚡ 快速部署（推荐）

### Windows 用户
**双击运行** `docker-build.bat` 即可！

脚本会自动完成：
1. ✅ 停止旧容器
2. ✅ 删除旧镜像
3. ✅ 构建新镜像
4. ✅ 启动容器
5. ✅ 映射端口 3000:80

完成后访问：**http://localhost:3000**

---

## 📋 前置条件

确保已安装：
- ✅ Docker Desktop (Windows)
- ✅ 或 Docker Engine (Linux/Mac)

检查Docker是否安装：
```bash
docker --version
docker-compose --version
```

---

## 🔧 部署步骤

### 方法1：单独部署前端（最简单）

```bash
# 1. 进入项目目录
cd D:\GOPATH\src\memo

# 2. 双击运行构建脚本
docker-build.bat

# 3. 完成！访问 http://localhost:3000
```

### 方法2：使用 Docker Compose（前后端一起）

```bash
# 1. 进入项目目录
cd D:\GOPATH\src\memo

# 2. 双击运行
docker-run.bat

# 3. 完成！访问 http://localhost:3000
```

### 方法3：手动命令（了解细节）

```bash
# 构建镜像
docker build -t memo-frontend:latest .

# 运行容器
docker run -d \
  --name memo-frontend \
  -p 3000:80 \
  --restart unless-stopped \
  memo-frontend:latest

# 查看状态
docker ps

# 查看日志
docker logs memo-frontend
```

---

## 📁 项目文件说明

```
memo/
├── Dockerfile              # Docker镜像构建文件 ⭐
├── nginx.conf             # Nginx配置文件
├── .dockerignore          # Docker忽略文件
├── docker-build.bat       # Windows构建脚本 ⭐
├── docker-compose.yml     # Docker Compose配置
├── docker-run.bat         # Compose启动脚本
├── package.json           # 项目依赖
├── src/                   # 源代码
└── dist/                  # 构建产物（自动生成）
```

---

## 🎯 构建流程说明

### Dockerfile 做了什么？

**第一阶段：构建**
```dockerfile
FROM node:18-alpine        # 使用Node.js 18
WORKDIR /app               # 设置工作目录
COPY package*.json ./      # 复制依赖文件
RUN npm install            # 安装依赖
COPY . .                   # 复制源代码
RUN npm run build          # 构建生产版本
```

**第二阶段：运行**
```dockerfile
FROM nginx:alpine          # 使用轻量Nginx
COPY --from=builder /app/dist /usr/share/nginx/html  # 复制构建产物
COPY nginx.conf /etc/nginx/conf.d/default.conf       # 复制配置
EXPOSE 80                  # 暴露80端口
CMD ["nginx", "-g", "daemon off;"]  # 启动nginx
```

### 为什么使用多阶段构建？

- ✅ **镜像更小**：最终镜像只包含nginx和静态文件
- ✅ **更安全**：不包含源代码和node_modules
- ✅ **更快**：启动速度更快

---

## 🔍 验证部署

### 1. 检查容器状态
```bash
docker ps
```

应该看到：
```
CONTAINER ID   IMAGE                    STATUS         PORTS
xxxxxxxxxxxx   memo-frontend:latest     Up 2 minutes   0.0.0.0:3000->80/tcp
```

### 2. 检查日志
```bash
docker logs memo-frontend
```

### 3. 访问健康检查
```bash
curl http://localhost:3000/health
```

应该返回：`healthy`

### 4. 浏览器访问
打开 http://localhost:3000

---

## ⚙️ 修改配置

### 修改端口

**在 docker-build.bat 中：**
```batch
set PORT=8080  # 改成你想要的端口
```

**在 docker-compose.yml 中：**
```yaml
ports:
  - "8080:80"  # 改成你想要的端口
```

### 修改 API 地址

**方式1：修改源代码**
在 `src/utils/api.js` 或相关文件中修改API地址

**方式2：使用nginx代理**
在 `nginx.conf` 中配置：
```nginx
location /api/ {
    proxy_pass http://your-backend:8001/api/;
}
```

---

## 🛠️ 常见操作

### 查看日志
```bash
# 查看所有日志
docker logs memo-frontend

# 实时查看日志
docker logs -f memo-frontend

# 查看最后100行
docker logs --tail 100 memo-frontend
```

### 重启容器
```bash
docker restart memo-frontend
```

### 停止容器
```bash
docker stop memo-frontend
```

### 启动容器
```bash
docker start memo-frontend
```

### 删除容器
```bash
docker rm -f memo-frontend
```

### 进入容器
```bash
docker exec -it memo-frontend sh

# 进入后可以查看文件
ls /usr/share/nginx/html
cat /etc/nginx/conf.d/default.conf
exit
```

---

## 🔄 更新部署

代码更新后重新部署：

```bash
# 方式1：使用脚本（最简单）
docker-build.bat

# 方式2：手动执行
docker stop memo-frontend
docker rm memo-frontend
docker build -t memo-frontend:latest .
docker run -d --name memo-frontend -p 3000:80 memo-frontend:latest
```

---

## ❓ 常见问题

### Q1: 端口被占用？
```bash
# 查看端口占用
netstat -ano | findstr :3000

# 修改端口或停止占用进程
```

### Q2: 构建失败？
```bash
# 查看详细错误
docker build -t memo-frontend:latest . --no-cache

# 检查磁盘空间
docker system df

# 清理空间
docker system prune -a
```

### Q3: 访问404？
- 检查nginx配置
- 查看日志：`docker logs memo-frontend`
- 确认dist目录已生成

### Q4: 容器启动失败？
```bash
# 查看容器日志
docker logs memo-frontend

# 查看容器详情
docker inspect memo-frontend
```

---

## 📊 性能优化

### 镜像大小
```bash
# 查看镜像大小
docker images memo-frontend

# 优化后应该在 50MB 左右
```

### 访问速度
- ✅ 已启用 gzip 压缩
- ✅ 已配置静态资源缓存
- ✅ 使用 nginx alpine 镜像

---

## 🌐 生产环境

### 使用域名访问

1. 修改 nginx.conf 的 server_name
2. 配置DNS解析
3. 使用反向代理（推荐Nginx或Caddy）

### HTTPS配置

推荐使用 Let's Encrypt 免费证书

---

## 📝 脚本说明

### docker-build.bat 做了什么？

1. 停止并删除旧容器
2. 删除旧镜像
3. 构建新镜像
4. 启动容器
5. 显示访问信息

### 可以自定义的变量

```batch
set IMAGE_NAME=memo-frontend    # 镜像名称
set IMAGE_TAG=latest            # 镜像标签
set CONTAINER_NAME=memo-frontend-container  # 容器名称
set PORT=3000                   # 映射端口
```

---

## ✅ 检查清单

部署前确认：
- [ ] Docker已安装并运行
- [ ] 端口3000未被占用
- [ ] 项目代码已更新到最新
- [ ] package.json配置正确

部署后确认：
- [ ] 容器正常运行（docker ps）
- [ ] 日志无错误（docker logs）
- [ ] 浏览器可以访问
- [ ] 功能正常

---

## 🎉 成功！

如果一切顺利，你现在应该可以通过 http://localhost:3000 访问应用了！

有问题请查看 `DOCKER_DEPLOY.md` 详细文档。

---

更新时间：2026-02-13
