@echo off
chcp 65001 >nul
echo ====================================
echo 智能备忘录 - Docker Compose 部署
echo ====================================
echo.

:: 停止旧容器
echo [步骤1] 停止旧容器...
docker-compose down
echo.

:: 构建并启动
echo [步骤2] 构建并启动服务...
docker-compose up -d --build

if %ERRORLEVEL% neq 0 (
    echo [错误] 部署失败！
    pause
    exit /b 1
)

echo.
echo ====================================
echo 部署完成！
echo ====================================
echo 前端地址: http://localhost:3000
echo.
echo 常用命令:
echo   查看状态: docker-compose ps
echo   查看日志: docker-compose logs -f
echo   停止服务: docker-compose down
echo   重启服务: docker-compose restart
echo ====================================
echo.

pause
