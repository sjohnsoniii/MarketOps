$ErrorActionPreference = "Stop"

$taskName = "MarketOps Autonomous Office v0.1"

try {
  $task = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
  if ($null -eq $task) {
    Write-Host "Scheduled task not found: $taskName"
    exit 0
  }

  Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
  Write-Host "Scheduled task removed: $taskName"
} catch {
  Write-Warning "Could not remove the scheduled task automatically."
  Write-Host "Manual instruction: open Task Scheduler and delete '$taskName'."
  Write-Host "Error: $($_.Exception.Message)"
  exit 1
}
