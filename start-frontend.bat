@echo off
chcp 65001 >nul
echo ========================================
echo  启动备忘录系统前端服务
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] 检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未找到Node.js环境，请先安装Node.js
    pause
    exit /b 1
)
echo ✓ Node.js环境正常

echo.
echo [2/3] 检查依赖...
if not exist "node_modules" (
    echo 首次运行，正在安装依赖...
    call npm install
    if errorlevel 1 (
        echo 错误: 依赖安装失败
        pause
        exit /b 1
    )
) else (
    echo ✓ 依赖已安装
)

echo.
echo [3/3] 启动前端服务...
echo 前端服务将运行在: http://localhost:5173
echo 请确保后端服务已启动: http://localhost:8001
echo.
echo 按 Ctrl+C 可以停止服务
echo ========================================
echo.

call npm run dev

pause
