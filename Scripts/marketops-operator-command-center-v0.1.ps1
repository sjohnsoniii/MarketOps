$ErrorActionPreference = "Continue"

$projectRoot = "C:\Users\sjohn\Desktop\Projects\MarketOps"
$coreRoot = Join-Path $projectRoot "Source\marketops-core"
$adminUrl = "http://localhost:4317"
$localDashboard = "C:\Users\sjohn\Desktop\Projects\sj3labs\marketops\dashboard\index.html"
$prodDashboard = "https://sj3labs.com/marketops/dashboard"

function Run-CoreCommand {
  param([string]$Command)
  Push-Location $coreRoot
  try {
    Write-Host "Running: $Command" -ForegroundColor Cyan
    cmd.exe /c $Command
  } finally {
    Pop-Location
  }
}

function Start-AdminConsole {
  $existing = Get-NetTCPConnection -LocalPort 4317 -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($existing) {
    Write-Host "Admin console already listening at $adminUrl (PID $($existing.OwningProcess))."
    Start-Process $adminUrl
    return
  }
  Start-Process -FilePath "npm" -ArgumentList "run admin:live" -WorkingDirectory $coreRoot -WindowStyle Hidden
  Start-Sleep -Seconds 2
  Write-Host "Admin console start requested: $adminUrl"
  Start-Process $adminUrl
}

function Show-Menu {
  Clear-Host
  Write-Host "MarketOps Operator Command Center v0.1" -ForegroundColor Yellow
  Write-Host "Local fake-money / paper-only operations. No posting, deploy, order placement, or live trading."
  Write-Host ""
  Write-Host "1. Run full local paper refresh"
  Write-Host "2. Build/update dashboard"
  Write-Host "3. Run all QA"
  Write-Host "4. Start live admin console"
  Write-Host "5. Check scheduled tasks"
  Write-Host "6. Repair scheduled tasks"
  Write-Host "7. Run recovery status report"
  Write-Host "8. Open local dashboard"
  Write-Host "9. Open prod dashboard"
  Write-Host "10. Exit"
  Write-Host ""
}

do {
  Show-Menu
  $choice = Read-Host "Choose an option"
  switch ($choice) {
    "1" { powershell -ExecutionPolicy Bypass -File (Join-Path $projectRoot "Scripts\run-marketops-paper-refresh-v0.2.ps1"); Pause }
    "2" { Run-CoreCommand "npm run dashboard:build && npm run dashboard:qa"; Pause }
    "3" { Run-CoreCommand "npm run full:qa"; Pause }
    "4" { Start-AdminConsole; Pause }
    "5" { powershell -ExecutionPolicy Bypass -File (Join-Path $projectRoot "Scripts\check-marketops-refresh-tasks-v0.2.ps1"); Pause }
    "6" { powershell -ExecutionPolicy Bypass -File (Join-Path $projectRoot "Scripts\install-or-repair-marketops-refresh-tasks-v0.2.ps1"); Pause }
    "7" { powershell -ExecutionPolicy Bypass -File (Join-Path $projectRoot "Scripts\marketops-recovery-status-v0.1.ps1"); Pause }
    "8" { Start-Process $localDashboard; Pause }
    "9" { Start-Process $prodDashboard; Pause }
    "10" { break }
    default { Write-Host "Unknown option."; Pause }
  }
} while ($choice -ne "10")
