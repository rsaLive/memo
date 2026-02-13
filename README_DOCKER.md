# 前端 Docker 部署完整指南

## 📦 已创建的文件

### 核心文件（必需）
1. ✅ `Dockerfile` - Docker镜像构建文件（多阶段构建）
2. ✅ `nginx.conf` - Nginx Web服务器配置
3. ✅ `.dockerignore` - Docker构建排除文件

### 脚本文件（方便使用）
4. ✅ `docker-build.bat` - Windows一键构建脚本 ⭐
5. ✅ `docker-compose.yml` - Docker Compose配置
6. ✅ `docker-run.bat` - Compose一键启动脚本

### 文档文件
7. ✅ `QUICK_START.md` - 快速开始指南 ⭐
8. ✅ `DOCKER_DEPLOY.md` - 详细部署文档
9. ✅ `.env.example` - 环境变量示例

---

## 🚀 快速开始（3步搞定）

### Step 1: 确保Docker已安装
```bash
docker --version
```

### Step 2: 双击运行脚本
**Windows**: 双击 `docker-build.bat`

### Step 3: 浏览器访问
打开 http://localhost:3000

**就这么简单！** 🎉

---

## 📋 详细说明

### Dockerfile 架构

```
┌─────────────────────────────────────┐
│  阶段1: 构建 (node:18-alpine)      │
│  ├─ 安装依赖 (npm install)         │
│  ├─ 复制源码                       │
│  └─ 构建生产版本 (npm run build)  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  阶段2: 运行 (nginx:alpine)        │
│  ├─ 复制构建产物 (dist/)           │
│  ├─ 复制nginx配置                  │
│  └─ 启动nginx服务                  │
└─────────────────────────────────────┘
```

### 优势
- 📦 **镜像小** - 最终镜像约 50MB
- 🚀 **启动快** - nginx轻量高效
- 🔒 **安全** - 不包含源代码
- ⚡ **性能好** - nginx + gzip压缩

---

## 🎯 三种部署方式

### 方式1: 使用 docker-build.bat（推荐新手）
```bash
# 双击运行即可，脚本会自动完成所有步骤
docker-build.bat
```

**优点**: 
- ✅ 全自动化
- ✅ 有进度提示
- ✅ 显示常用命令

---

### 方式2: 使用 Docker Compose（推荐生产）
```bash
# 双击运行
docker-run.bat

# 或手动执行
docker-compose up -d --build
```

**优点**: 
- ✅ 可以同时管理前后端
- ✅ 配置集中管理
- ✅ 容易扩展（添加数据库等）

---

### 方式3: 手动Docker命令（推荐学习）
```bash
# 1. 构建镜像
docker build -t memo-frontend:latest .

# 2. 运行容器
docker run -d \
  --name memo-frontend \
  -p 3000:80 \
  --restart unless-stopped \
  memo-frontend:latest

# 3. 查看状态
docker ps
docker logs memo-frontend
```

**优点**: 
- ✅ 灵活控制
- ✅ 理解原理
- ✅ 便于调试

---

## 🔧 配置说明

### 端口配置

**Docker Build方式**:
编辑 `docker-build.bat`:
```batch
set PORT=8080  # 改成你的端口
```

**Docker Compose方式**:
编辑 `docker-compose.yml`:
```yaml
ports:
  - "8080:80"  # 前面是宿主机端口
```

**手动命令方式**:
```bash
docker run -d -p 8080:80 memo-frontend:latest
#              ↑    ↑
#         宿主机  容器
```

---

### API地址配置

#### 选项1: 使用环境变量（推荐）
创建 `.env` 文件:
```env
VITE_API_URL=http://your-backend:8001
```

#### 选项2: nginx反向代理（推荐生产）
编辑 `nginx.conf`:
```nginx
location /api/ {
    proxy_pass http://backend:8001/api/;
}
```

#### 选项3: 修改源代码
在源码中直接修改API地址

---

## 📊 性能特性

### 已启用的优化

1. **Gzip压缩** ✅
   - 压缩文本类型文件
   - 减少传输大小

2. **静态资源缓存** ✅
   - js/css/图片缓存1年
   - 减少重复加载

3. **SPA路由支持** ✅
   - 所有路由返回index.html
   - 支持前端路由

4. **健康检查** ✅
   - /health端点
   - 监控容器状态

---

## 🛠️ 常用命令速查

### 容器管理
```bash
# 启动
docker start memo-frontend

# 停止
docker stop memo-frontend

# 重启
docker restart memo-frontend

# 删除
docker rm -f memo-frontend

# 查看日志
docker logs -f memo-frontend

# 进入容器
docker exec -it memo-frontend sh
```

### 镜像管理
```bash
# 查看镜像
docker images

# 删除镜像
docker rmi memo-frontend:latest

# 清理未使用镜像
docker image prune -a
```

### Docker Compose
```bash
# 启动
docker-compose up -d

# 停止
docker-compose down

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 重启
docker-compose restart
```

---

## 🔍 故障排查

### 问题1: 端口被占用
```bash
# Windows查看端口
netstat -ano | findstr :3000

# 解决方案
1. 修改端口
2. 或停止占用进程
```

### 问题2: 构建失败
```bash
# 无缓存重新构建
docker build --no-cache -t memo-frontend:latest .

# 查看构建日志
docker build -t memo-frontend:latest . --progress=plain
```

### 问题3: 容器无法启动
```bash
# 查看详细日志
docker logs memo-frontend

# 查看容器配置
docker inspect memo-frontend

# 进入容器排查
docker exec -it memo-frontend sh
```

### 问题4: 访问404
**可能原因**:
- nginx配置错误
- dist目录为空
- 路由配置问题

**排查步骤**:
```bash
# 1. 查看nginx日志
docker logs memo-frontend

# 2. 进入容器检查文件
docker exec -it memo-frontend sh
ls /usr/share/nginx/html

# 3. 查看nginx配置
docker exec -it memo-frontend cat /etc/nginx/conf.d/default.conf
```

---

## 🌐 生产环境部署

### 使用反向代理
推荐使用Nginx或Caddy作为反向代理:

```nginx
# /etc/nginx/sites-available/memo
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### HTTPS配置
使用Let's Encrypt免费证书:
```bash
# 安装certbot
apt install certbot python3-certbot-nginx

# 申请证书
certbot --nginx -d your-domain.com
```

---

## 📈 监控和维护

### 健康检查
```bash
# 访问健康检查端点
curl http://localhost:3000/health

# Docker健康检查（在docker-compose.yml中已配置）
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
  interval: 30s
```

### 日志管理
在 `docker-compose.yml` 中限制日志大小:
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### 自动重启
已配置 `restart: unless-stopped`，容器会在异常退出时自动重启。

---

## 🔄 CI/CD集成

### GitHub Actions示例
```yaml
name: Build and Deploy

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build Docker image
        run: docker build -t memo-frontend:latest .
      
      - name: Push to registry
        run: docker push memo-frontend:latest
```

---

## 🎓 学习资源

- [Docker官方文档](https://docs.docker.com/)
- [Nginx官方文档](https://nginx.org/en/docs/)
- [Docker Compose文档](https://docs.docker.com/compose/)

---

## ✅ 部署检查清单

### 部署前
- [ ] Docker已安装
- [ ] 端口未被占用
- [ ] 代码已更新
- [ ] 配置已修改

### 部署后
- [ ] 容器正常运行
- [ ] 日志无错误
- [ ] 页面可访问
- [ ] 功能正常

---

## 🆘 获取帮助

1. **查看文档**
   - `QUICK_START.md` - 快速开始
   - `DOCKER_DEPLOY.md` - 详细文档
   - 本文件 - 完整指南

2. **查看日志**
   ```bash
   docker logs memo-frontend
   ```

3. **检查配置**
   - Dockerfile
   - nginx.conf
   - docker-compose.yml

---

## 📝 版本信息

- Docker: >= 20.10
- Node.js: 18 (构建阶段)
- Nginx: alpine (运行阶段)
- 前端框架: React + Vite

---

## 🎉 总结

你现在拥有：
- ✅ 完整的Docker部署配置
- ✅ 一键部署脚本
- ✅ 详细的文档
- ✅ 生产级别的nginx配置
- ✅ 完善的故障排查指南

**开始部署吧！** 祝你好运！🚀

---

更新时间：2026-02-13
作者：AI Assistant
