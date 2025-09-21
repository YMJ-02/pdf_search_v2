@echo off
chcp 65001 >nul
title PDF Search System - 서버 관리 도구
color 0E

:menu
cls
echo.
echo    ╔══════════════════════════════════════════════════════╗
echo    ║            PDF Search System 관리 도구               ║
echo    ╚══════════════════════════════════════════════════════╝
echo.

echo [서버 상태 확인 중...]
echo.

rem Check backend server
echo 백엔드 서버 (포트 5001):
curl -s -o nul -w "HTTP %%{http_code}" http://localhost:5001/api/status 2>nul
if %errorlevel% equ 0 (
    echo ✅ 실행 중
) else (
    echo ❌ 중단됨
)

echo.
echo 프론트엔드 서버 (포트 5173):
netstat -an | findstr ":5173" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 실행 중
) else (
    echo ❌ 중단됨
)

echo.
echo ═══════════════════════════════════════════════════════
echo.
echo 1. 서버 시작 (보호 모드)
echo 2. 서버 시작 (백그라운드 모드)
echo 3. 서버 중단
echo 4. 웹사이트 열기
echo 5. 서버 상태 새로고침
echo 0. 종료
echo.
set /p choice="선택하세요 (0-5): "

if "%choice%"=="1" (
    echo.
    echo 보호 모드로 서버를 시작합니다...
    start "" "%~dp0start_servers_protected.bat"
    goto menu
)

if "%choice%"=="2" (
    echo.
    echo 백그라운드 모드로 서버를 시작합니다...
    powershell -ExecutionPolicy Bypass -File "%~dp0start_servers_detached.ps1"
    goto menu
)

if "%choice%"=="3" (
    echo.
    echo 서버를 중단하는 중...
    taskkill /f /im python.exe >nul 2>&1
    taskkill /f /im node.exe >nul 2>&1
    echo ✅ 서버가 중단되었습니다.
    pause
    goto menu
)

if "%choice%"=="4" (
    echo.
    echo 웹사이트를 여는 중...
    start http://localhost:5173
    goto menu
)

if "%choice%"=="5" goto menu

if "%choice%"=="0" exit

echo 잘못된 선택입니다.
pause
goto menu