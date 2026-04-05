$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$serverDir = Join-Path $root "server"
$clientDir = Join-Path $root "client"

Write-Host "Starting AuraChat server on http://localhost:4000" -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$serverDir'; npm run dev"

Start-Sleep -Seconds 4

Write-Host "Starting AuraChat client on http://localhost:3001" -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$clientDir'; npm run dev"

Start-Sleep -Seconds 8

Write-Host "Opening AuraChat in Chrome..." -ForegroundColor Green
Start-Process "chrome.exe" "http://localhost:3001"

