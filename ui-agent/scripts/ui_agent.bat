@echo off
chcp 65001 >nul
title world-under-the-sea UI Agent
cd /d "%~dp0"

echo =============================================
echo   🐠 world-under-the-sea UI 重构工具集
echo =============================================
echo.
echo   [1] 单次分析截图
echo   [2] 监视模式（自动处理新截图）
echo   [3] 交互模式
echo   [4] 列出可用模型
echo   [5] 批量分析 screenshots/ 目录
echo   [6] 启动 Web 前端开发服务器
echo   [7] 启动移动端开发服务器
echo   [Q] 退出
echo.

:menu
set /p choice="请选择 [1-7/Q]: "

if "%choice%"=="1" (
    set /p img="输入截图路径: "
    call :run_analyzer "%img%"
    goto menu
)
if "%choice%"=="2" (
    echo 🔄 启动监视模式...
    call :run_analyzer --watch
    goto menu
)
if "%choice%"=="3" (
    echo 🎯 启动交互模式...
    call :run_analyzer --interactive
    goto menu
)
if "%choice%"=="4" (
    echo 📦 查询可用模型...
    call :run_analyzer --list-models
    pause
    goto menu
)
if "%choice%"=="5" (
    echo 🔄 批量分析 screenshots/ 目录...
    for %%f in (..\screenshots\*.png ..\screenshots\*.jpg ..\screenshots\*.jpeg ..\screenshots\*.webp) do (
        if exist "%%f" (
            echo.
            echo ── %%~nxf ──
            call :run_analyzer "%%f" --save-only
        )
    )
    echo.
    echo ✅ 批量分析完成！
    pause
    goto menu
)
if "%choice%"=="6" (
    echo 🌐 启动 Web 前端...
    start "Web Frontend" cmd /c "cd /d "%~dp0..\..\frontend" && npm run dev"
    goto menu
)
if "%choice%"=="7" (
    echo 📱 启动移动端...
    start "Mobile Native" cmd /c "cd /d "%~dp0..\..\mobile-native" && npm run dev"
    goto menu
)
if /i "%choice%"=="Q" exit /b

echo 无效选项，请重新输入
goto menu

:run_analyzer
d:\github\ai-agent\.venv\Scripts\python.exe screenshot_analyzer.py %*
exit /b 0
