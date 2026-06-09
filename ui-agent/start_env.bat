@echo off
chcp 65001 >nul
title world-under-the-sea UI Agent

echo =============================================
echo   🐠 world-under-the-sea UI 重构 — 一键启动
echo =============================================
echo.
echo   📂 项目根目录: %~dp0..\..
echo.
echo   正在检查环境...
echo.

:: ── 1. 检查 Ollama ──
where ollama >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   ✅ Ollama 已安装
    :: 检查服务是否运行
    curl -s http://localhost:11434/api/tags >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo   ✅ Ollama 服务运行中 (http://localhost:11434)
    ) else (
        echo   ⚠️  Ollama 服务未启动，请手动运行: ollama serve
    )
) else (
    echo   ⚠️  未检测到 Ollama，请从 https://ollama.com 安装
)

:: ── 2. 检查模型 ──
echo.
echo   📦 检查多模态模型...
for /f "tokens=*" %%m in ('curl -s http://localhost:11434/api/tags 2^>nul ^| python -c "import sys,json; data=json.load(sys.stdin); models=[m['name'] for m in data.get('models',[])]; print('\n'.join(models) if models else 'NONE')" 2^>nul') do (
    set "MODEL=%%m"
)
if defined MODEL (
    echo   ✅ 可用模型: %MODEL%
) else (
    echo   ⚠️  未检测到模型，请运行: ollama pull llava:7b
)

:: ── 3. 检查 Python 依赖 ──
echo.
echo   🐍 检查 Python 依赖...
d:\github\ai-agent\.venv\Scripts\python.exe -c "import requests,pyperclip,PIL,watchdog" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   ✅ Python 依赖已安装
) else (
    echo   ⚠️  依赖不完整，正在安装...
    pip install -r "%~dp0requirements.txt"
)

:: ── 4. 检查目录 ──
echo.
echo   📁 检查目录结构...
if exist "%~dp0..\screenshots" (echo   ✅ screenshots/) else (echo   ⚠️  缺少 screenshots/)
if exist "%~dp0..\logs" (echo   ✅ logs/) else (echo   ⚠️  缺少 logs/)
if exist "%~dp0..\penpot" (echo   ✅ penpot/) else (echo   ⚠️  缺少 penpot/)

:: ── 5. 输出摘要 ──
echo.
echo =============================================
echo   环境检查完成
echo =============================================
echo.
echo   📋 下一步操作：
echo.
echo   [1] 启动截图监视模式
echo      ^> python screenshot_analyzer.py --watch
echo.
echo   [2] 交互式分析
echo      ^> python screenshot_analyzer.py --interactive
echo.
echo   [3] 启动 Web 前端
echo      ^> cd ..\..\frontend ^&^& npm run dev
echo.
echo   [4] 启动移动端
echo      ^> cd ..\..\mobile-native ^&^& npm run dev
echo.
echo   [5] 批量分析已有截图
echo      ^> python screenshot_analyzer.py --watch
echo.
echo =============================================
echo.

:: 询问是否启动监视模式
set /p start="启动监视模式？(y/n): "
if /i "%start%"=="y" (
    echo.
    echo 🔄 启动监视模式，等待新截图...
    d:\github\ai-agent\.venv\Scripts\python.exe "%~dp0screenshot_analyzer.py" --watch
)

pause
