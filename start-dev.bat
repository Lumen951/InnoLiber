@echo off
echo ========================================
echo     InnoLiber 开发环境启动脚本
echo ========================================
echo.

echo [1/3] 检查Python环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python未安装或未添加到PATH
    echo 请安装Python 3.11+并添加到PATH
    pause
    exit /b 1
) else (
    echo ✅ Python环境检查通过
)

echo.
echo [2/3] 检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js未安装或未添加到PATH
    echo 请安装Node.js 18+并添加到PATH
    pause
    exit /b 1
) else (
    echo ✅ Node.js环境检查通过
)

echo.
echo [3/3] 启动Docker服务...
docker-compose up -d
if errorlevel 1 (
    echo ❌ Docker服务启动失败
    echo 请确保Docker Desktop已启动
    pause
    exit /b 1
) else (
    echo ✅ Docker服务启动成功
)

echo.
echo ========================================
echo     环境准备完成！
echo ========================================
echo.
echo 数据库连接: localhost:5432
echo Redis连接: localhost:6379
echo pgAdmin: http://localhost:5050
echo.
echo 启动后端服务:
echo    cd backend
echo    poetry install
echo    poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
echo.
echo 启动前端服务:
echo    cd frontend
echo    npm run dev
echo.
echo 访问地址:
echo    前端: http://localhost:5173
echo    后端API: http://localhost:8000
echo    API文档: http://localhost:8000/docs
echo.
echo 按任意键继续...
pause >nul