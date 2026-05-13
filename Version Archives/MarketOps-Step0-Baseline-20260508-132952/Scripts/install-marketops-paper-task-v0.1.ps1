$ErrorActionPreference = "Stop"

$taskName = "MarketOps Paper Runner v0.1"
$scriptPath = "C:\Users\sjohn\Desktop\Projects\MarketOps\Scripts\run-marketops-paper-full-v0.1.ps1"

try {
  if (-not (Test-Path $scriptPath)) {
    throw "Runner script not found: $scriptPath"
  }

  $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`""
  $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).Date -RepetitionInterval (New-TimeSpan -Minutes 30) -RepetitionDuration (New-TimeSpan -Days 3650)
  $principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited
  $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -MultipleInstances IgnoreNew

  Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description "Runs MarketOps paper simulation locally every 30 minutes while the user is logged in." -Force | Out-Null

  Write-Host "Installed scheduled task: $taskName"
  Write-Host "Schedule: every 30 minutes while user is logged in"
  Write-Host "Runner: $scriptPath"
} catch {
  Write-Warning "Could not install scheduled task automatically: $($_.Exception.Message)"
  Write-Host "Manual install option:"
  Write-Host "1. Open Task Scheduler."
  Write-Host "2. Create a task named: $taskName"
  Write-Host "3. Set trigger: repeat every 30 minutes while logged in."
  Write-Host "4. Set action: powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`""
  exit 1
}
