@echo off
chcp 65001 >nul
title PDF Search System - 서버 시작 중... (이 창을 닫지 마세요!)
color 0A

echo.
echo    ╔══════════════════════════════════════════════════════╗
echo    ║              PDF Search System                       ║
echo    ║                  서버 시작 중...                      ║
echo    ║                                                      ║
echo    ║    ⚠️  주의: 이 창을 닫으면 서버가 중단됩니다!          ║
echo    ║                                                      ║
echo    ║    서버가 시작된 후 최소화해서 사용하세요             ║
echo    ╚══════════════════════════════════════════════════════╝
echo.

echo [1/3] 백엔드 서버 시작 중...
pushd "%~dp0backend" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 백엔드 디렉토리를 찾을 수 없습니다!
    pause
    exit /b 1
)

start "PDF Search Backend - 닫지 마세요!" /min cmd /c "call ""venv\Scripts\activate.bat"" && echo 백엔드 서버가 시작되었습니다. && echo 이 창을 닫으면 서버가 중단됩니다! && python app.py"
popd

echo ✅ 백엔드 서버 시작됨
echo.
echo [2/3] 백엔드 초기화 대기 중... (10초)
timeout /t 10 /nobreak >nul

echo [3/3] 프론트엔드 서버 시작 중...
pushd "%~dp0frontend" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 프론트엔드 디렉토리를 찾을 수 없습니다!
    pause
    exit /b 1
)

start "PDF Search Frontend - 닫지 마세요!" /min cmd /c "echo 프론트엔드 서버가 시작되었습니다. && echo 이 창을 닫으면 서버가 중단됩니다! && npm run dev"
popd

echo ✅ 프론트엔드 서버 시작됨
echo.
title PDF Search System - 실행 중 (최소화 권장)
color 0B

echo    ╔══════════════════════════════════════════════════════╗
echo    ║              ✅ 서버 시작 완료!                       ║
echo    ║                                                      ║
echo    ║    🌐 웹사이트: http://localhost:5173                ║
echo    ║    📡 API: http://localhost:5001                     ║
echo    ║                                                      ║
echo    ║    네트워크 접속:                                     ║
echo    ║    🌐 http://[컴퓨터IP]:5173                         ║
echo    ║    📡 http://[컴퓨터IP]:5001                         ║
echo    ║                                                      ║
echo    ║    💡 팁: 이 창을 최소화하고 사용하세요              ║
echo    ║    ⚠️  주의: 이 창을 닫으면 서버가 중단됩니다!        ║
echo    ╚══════════════════════════════════════════════════════╝
echo.

echo 서버가 실행 중입니다...
echo 종료하려면 Ctrl+C를 누르거나 창을 닫으세요.
echo.

:loop
timeout /t 3600 /nobreak >nul
goto loop