$ErrorActionPreference = "Stop"

$taskName = "MarketOps Autonomous Office v0.1"
$scriptPath = "C:\Users\sjohn\Desktop\Projects\MarketOps\Scripts\run-marketops-office-full-v0.1.ps1"
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`""
$trigger = New-ScheduledTaskTrigger -Daily -At 7:30PM
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

try {
  Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description "Runs the local MarketOps paper simulation and review-only content office. No publishing is automated." -Force | Out-Null
  Write-Host "Scheduled task installed: $taskName"
  Write-Host "Schedule: daily at 7:30 PM while the user is logged in."
  Write-Host "Runner: $scriptPath"
} catch {
  Write-Warning "Could not create the scheduled task automatically."
  Write-Host "Manual instructions:"
  Write-Host "1. Open Task Scheduler."
  Write-Host "2. Create a task named '$taskName'."
  Write-Host "3. Trigger: daily at 7:30 PM."
  Write-Host "4. Action: powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`""
  Write-Host "5. Configure it to run only while you are logged in."
  Write-Host "Error: $($_.Exception.Message)"
  exit 1
}
