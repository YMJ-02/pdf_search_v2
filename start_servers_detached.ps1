# PowerShell script to start servers as detached background processes
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# Function to start process completely detached
function Start-DetachedProcess {
    param($WorkingDirectory, $Command, $Arguments)
    
    $processInfo = New-Object System.Diagnostics.ProcessStartInfo
    $processInfo.FileName = $Command
    $processInfo.Arguments = $Arguments
    $processInfo.WorkingDirectory = $WorkingDirectory
    $processInfo.UseShellExecute = $false
    $processInfo.CreateNoWindow = $true
    $processInfo.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
    
    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $processInfo
    $process.Start() | Out-Null
}

Write-Host "PDF Search System - Starting Background Services..." -ForegroundColor Green

# Start backend server
$backendPath = Join-Path $scriptPath "backend"
$venvPython = Join-Path $backendPath "venv\Scripts\python.exe"
$appPy = Join-Path $backendPath "app.py"

if (Test-Path $venvPython) {
    Write-Host "Starting Backend Server (Background Process)..." -ForegroundColor Yellow
    Start-DetachedProcess -WorkingDirectory $backendPath -Command $venvPython -Arguments $appPy
} else {
    Write-Host "ERROR: Virtual environment not found!" -ForegroundColor Red
    exit 1
}

# Wait for backend to initialize
Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Start frontend server
$frontendPath = Join-Path $scriptPath "frontend"
$nodeCmd = "npm"
$nodeArgs = "run dev"

Write-Host "Starting Frontend Server (Background Process)..." -ForegroundColor Yellow
Start-DetachedProcess -WorkingDirectory $frontendPath -Command $nodeCmd -Arguments $nodeArgs

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "=== PDF Search System Started ===" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:5001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Servers are running in background processes." -ForegroundColor Green
Write-Host "You can safely close this window." -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")