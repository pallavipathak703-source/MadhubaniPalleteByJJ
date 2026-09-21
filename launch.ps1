$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Starting Madhubani Palette by JJ..." -ForegroundColor Cyan

Start-Process powershell.exe -ArgumentList @(
  "-NoExit",
  "-ExecutionPolicy", "Bypass",
  "-Command",
  "Set-Location -LiteralPath '$projectRoot\backend'; npm run dev"
)

Start-Process powershell.exe -ArgumentList @(
  "-NoExit",
  "-ExecutionPolicy", "Bypass",
  "-Command",
  "Set-Location -LiteralPath '$projectRoot\frontend'; npm run dev"
)

Write-Host "Backend:  http://localhost:5000/" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173/" -ForegroundColor Green
Write-Host "Two development windows have been opened." -ForegroundColor Cyan
