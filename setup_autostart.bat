@echo off
chcp 65001 >nul
title PDF Search System - 자동 시작 설정
color 0B

echo.
echo    ╔══════════════════════════════════════════════════════╗
echo    ║        PDF Search System 자동 시작 설정              ║
echo    ╚══════════════════════════════════════════════════════╝
echo.

echo 어떤 모드로 자동 시작하시겠습니까?
echo.
echo 1. 보호 모드 - 창이 보이지만 명확한 경고 메시지 (추천)
echo 2. 백그라운드 모드 - 완전히 숨겨서 실행 (실험적)
echo 0. 취소
echo.
set /p mode="선택하세요 (0-2): "

if "%mode%"=="0" exit

if "%mode%"=="1" (
    set "target_file=start_servers_protected.bat"
    set "description=PDF Search System (보호 모드)"
) else if "%mode%"=="2" (
    set "target_file=start_servers_detached.ps1"  
    set "description=PDF Search System (백그라운드 모드)"
) else (
    echo 잘못된 선택입니다.
    pause
    exit /b 1
)

echo.
echo 설정 중...

set "startup_folder=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "source_file=%~dp0%target_file%"

if not exist "%source_file%" (
    echo ❌ ERROR: %target_file% 파일을 찾을 수 없습니다!
    pause
    exit /b 1
)

echo ✅ 파일 확인 완료: %target_file%

if "%target_file%"=="start_servers_protected.bat" (
    rem Create batch file shortcut
    powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%startup_folder%\PDF Search Auto Start.lnk'); $Shortcut.TargetPath = '%source_file%'; $Shortcut.WorkingDirectory = '%~dp0'; $Shortcut.Description = '%description%'; $Shortcut.Save()"
) else (
    rem Create PowerShell file shortcut
    powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%startup_folder%\PDF Search Auto Start.lnk'); $Shortcut.TargetPath = 'powershell.exe'; $Shortcut.Arguments = '-ExecutionPolicy Bypass -File \"%source_file%\"'; $Shortcut.WorkingDirectory = '%~dp0'; $Shortcut.Description = '%description%'; $Shortcut.Save()"
)

if %errorlevel% equ 0 (
    echo.
    echo ✅ 자동 시작 설정이 완료되었습니다!
    echo.
    echo    설정된 모드: %description%
    echo    컴퓨터 재시작 시 자동으로 PDF Search 시스템이 시작됩니다.
    echo.
    echo    💡 설정 해제 방법:
    echo    1. Win + R 키 → "shell:startup" 입력
    echo    2. "PDF Search Auto Start.lnk" 파일 삭제
) else (
    echo ❌ 자동 시작 설정에 실패했습니다.
)

echo.
pause