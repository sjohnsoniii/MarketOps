$ErrorActionPreference = "Stop"

$taskName = "MarketOps Paper Runner v0.1"

try {
  $task = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
  if ($null -eq $task) {
    Write-Host "Scheduled task not found: $taskName"
    exit 0
  }

  Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
  Write-Host "Removed scheduled task: $taskName"
} catch {
  Write-Warning "Could not remove scheduled task automatically: $($_.Exception.Message)"
  Write-Host "Manual removal option: open Task Scheduler, find '$taskName', then delete it."
  exit 1
}
