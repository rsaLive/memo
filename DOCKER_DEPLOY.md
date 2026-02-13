# Docker 部署文档

## 📦 文件说明

### 核心文件
- `Dockerfile` - Docker镜像构建文件
- `nginx.conf` - Nginx配置文件
- `.dockerignore` - Docker忽略文件
- `docker-build.bat` - Windows构建脚本
- `docker-compose.yml` - Docker Compose配置
- `docker-run.bat` - Docker Compose启动脚本

## 🚀 部署方式

### 方式1：单独部署前端（推荐快速测试）

#### 步骤1：构建并运行
```bash
# Windows用户直接双击运行
docker-build.bat

# 或者手动执行命令
docker build -t memo-frontend:latest .
docker run -d --name memo-frontend -p 3000:80 memo-frontend:latest
```

#### 步骤2：访问
浏览器打开：http://localhost:3000

### 方式2：使用 Docker Compose（推荐生产环境）

#### 步骤1：启动所有服务
```bash
# Windows用户直接双击运行
docker-run.bat

# 或者手动执行命令
docker-compose up -d --build
```

#### 步骤2：访问
- 前端：http://localhost:3000
- 后端：http://localhost:8001

## 🔧 配置说明

### 端口配置
在 `docker-build.bat` 中修改：
```batch
set PORT=3000  # 改成你想要的端口
```

在 `docker-compose.yml` 中修改：
```yaml
ports:
  - "3000:80"  # 改成 "你的端口:80"
```

### API地址配置
如果后端API不在同一服务器，需要修改前端代码中的API地址：

1. 修改 `src/utils/api.js` 或相关配置文件
2. 或者使用环境变量
3. 或者使用nginx代理（见nginx.conf）

### Nginx代理配置
如果需要代理后端API，在 `nginx.conf` 中：
```nginx
location /api/ {
    proxy_pass http://your-backend:8001/api/;
}
```

## 📋 常用命令

### 镜像管理
```bash
# 查看镜像
docker images

# 删除镜像
docker rmi memo-frontend:latest

# 清理未使用的镜像
docker image prune -a
```

### 容器管理
```bash
# 查看运行中的容器
docker ps

# 查看所有容器
docker ps -a

# 停止容器
docker stop memo-frontend

# 启动容器
docker start memo-frontend

# 重启容器
docker restart memo-frontend

# 删除容器
docker rm -f memo-frontend

# 查看日志
docker logs memo-frontend
docker logs -f memo-frontend  # 实时查看

# 进入容器
docker exec -it memo-frontend sh
```

### Docker Compose管理
```bash
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose down

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs
docker-compose logs -f frontend  # 查看前端日志

# 重启服务
docker-compose restart

# 重新构建
docker-compose up -d --build
```

## 🔍 故障排查

### 问题1：容器无法启动
```bash
# 查看容器日志
docker logs memo-frontend

# 查看详细错误
docker inspect memo-frontend
```

### 问题2：端口被占用
```bash
# Windows查看端口占用
netstat -ano | findstr :3000

# 修改端口或停止占用进程
```

### 问题3：构建失败
```bash
# 清理缓存重新构建
docker build --no-cache -t memo-frontend:latest .

# 检查磁盘空间
docker system df

# 清理磁盘空间
docker system prune -a
```

### 问题4：访问404
- 检查nginx配置是否正确
- 检查构建产物是否在 `dist` 目录
- 查看nginx日志：`docker logs memo-frontend`

### 问题5：API请求失败
- 检查后端服务是否启动
- 检查前端API地址配置
- 检查网络连接和防火墙

## 🌐 生产环境部署

### 1. 使用环境变量
创建 `.env` 文件：
```env
VITE_API_URL=https://your-api-domain.com
VITE_APP_VERSION=1.0.0
```

### 2. 使用反向代理
推荐使用 Nginx 或 Caddy 作为反向代理：
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
    }
}
```

### 3. HTTPS配置
在nginx.conf中添加SSL配置或使用Let's Encrypt。

### 4. 性能优化
- 启用gzip压缩（已在nginx.conf中配置）
- 使用CDN加速静态资源
- 配置浏览器缓存

## 📊 监控和维护

### 健康检查
```bash
# 访问健康检查端点
curl http://localhost:3000/health

# Docker健康检查
docker inspect memo-frontend | grep Health
```

### 日志管理
```bash
# 限制日志大小（在docker-compose.yml中）
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### 自动重启
容器已配置 `restart: unless-stopped`，会在异常退出时自动重启。

## 🔐 安全建议

1. **不要在镜像中包含敏感信息**
   - 使用 `.dockerignore` 排除 `.env` 文件
   - 使用环境变量注入配置

2. **定期更新基础镜像**
   ```bash
   docker pull node:18-alpine
   docker pull nginx:alpine
   ```

3. **扫描安全漏洞**
   ```bash
   docker scan memo-frontend:latest
   ```

4. **限制容器权限**
   - 不使用root用户运行
   - 限制容器资源

## 📈 性能优化

### 多阶段构建
已使用多阶段构建减小镜像大小：
- 构建阶段：使用完整node镜像
- 运行阶段：使用轻量nginx镜像

### 镜像大小
```bash
# 查看镜像大小
docker images memo-frontend

# 优化建议
- 使用alpine基础镜像
- 清理不必要的文件
- 合并RUN命令
```

## 🔄 更新部署

### 更新代码后重新部署
```bash
# 方式1：使用脚本
docker-build.bat

# 方式2：使用compose
docker-compose up -d --build

# 方式3：手动更新
docker stop memo-frontend
docker rm memo-frontend
docker build -t memo-frontend:latest .
docker run -d --name memo-frontend -p 3000:80 memo-frontend:latest
```

## 📞 技术支持

如遇问题：
1. 查看日志：`docker logs memo-frontend`
2. 检查配置文件
3. 参考本文档故障排查部分
4. 联系技术团队

---

更新时间：2026-02-13
版本：v1.0
