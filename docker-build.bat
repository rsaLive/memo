@echo off
chcp 65001 >nul
echo ====================================
echo 智能备忘录 - 前端 Docker 构建脚本
echo ====================================
echo.

:: 设置变量
set IMAGE_NAME=memo-frontend
set IMAGE_TAG=latest
set CONTAINER_NAME=memo-frontend-container
set PORT=3000

set TIMESTAMP=%datetime:~0,8%-%datetime:~8,6%
echo 构建时间戳: %TIMESTAMP%

:: 显示构建信息
echo [信息] 镜像名称: %IMAGE_NAME%:%IMAGE_TAG%
echo [信息] 容器名称: %CONTAINER_NAME%
echo [信息] 端口映射: %PORT%:80
echo.

:: 停止并删除旧容器（如果存在）
echo [步骤1] 清理旧容器...
docker stop %CONTAINER_NAME% 2>nul
docker rm %CONTAINER_NAME% 2>nul
echo [完成] 旧容器已清理
echo.

:: 删除旧镜像（可选）
echo [步骤2] 删除旧镜像...
docker rmi %IMAGE_NAME%:%IMAGE_TAG% 2>nul
echo [完成] 旧镜像已删除
echo.

:: 构建新镜像（使用 --no-cache 强制重新构建）
echo [步骤3] 构建 Docker 镜像...
docker build --no-cache -t %IMAGE_NAME%:%IMAGE_TAG% .
if %ERRORLEVEL% neq 0 (
    echo [错误] Docker 镜像构建失败！
    pause
    exit /b 1
)
echo [完成] Docker 镜像构建成功！
echo.

docker tag memo-frontend:latest hub.sanxiwl.cn:30443/test/memo-frontend:latest
echo 推送镜像到私有仓库...
docker push hub.sanxiwl.cn:30443/test/memo-frontend:latest

echo 推送成功

@REM :: 运行容器
@REM echo [步骤4] 启动容器...
@REM docker run -d ^
@REM     --name %CONTAINER_NAME% ^
@REM     -p %PORT%:80 ^
@REM     --restart unless-stopped ^
@REM     %IMAGE_NAME%:%IMAGE_TAG%

@REM if %ERRORLEVEL% neq 0 (
@REM     echo [错误] 容器启动失败！
@REM     pause
@REM     exit /b 1
@REM )
@REM echo [完成] 容器启动成功！
@REM echo.

@REM :: 显示容器信息
@REM echo ====================================
@REM echo 部署完成！
@REM echo ====================================
@REM echo 访问地址: http://localhost:%PORT%
@REM echo 容器名称: %CONTAINER_NAME%
@REM echo 镜像版本: %IMAGE_NAME%:%IMAGE_TAG%
@REM echo.
@REM echo 常用命令:
@REM echo   查看日志: docker logs %CONTAINER_NAME%
@REM echo   停止容器: docker stop %CONTAINER_NAME%
@REM echo   启动容器: docker start %CONTAINER_NAME%
@REM echo   重启容器: docker restart %CONTAINER_NAME%
@REM echo   删除容器: docker rm -f %CONTAINER_NAME%
@REM echo ====================================
@REM echo.

pause
