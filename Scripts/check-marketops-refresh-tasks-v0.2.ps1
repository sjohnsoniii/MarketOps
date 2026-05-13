$ErrorActionPreference = "Stop"

$paperTaskName = "MarketOps Paper Runner v0.1"
$officeTaskName = "MarketOps Autonomous Office v0.1"
$projectRoot = "C:\Users\sjohn\Desktop\Projects\MarketOps"
$paperScriptPath = Join-Path $projectRoot "Scripts\run-marketops-paper-refresh-v0.2.ps1"
$officeScriptPath = Join-Path $projectRoot "Scripts\run-marketops-office-full-v0.1.ps1"

function Get-TaskSummary {
  param(
    [string]$TaskName,
    [string]$ExpectedScript
  )
  $task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
  if ($null -eq $task) {
    return [pscustomobject]@{
      TaskName = $TaskName
      Exists = $false
      State = "missing"
      LastRunTime = $null
      NextRunTime = $null
      LastTaskResult = $null
      ActionMatches = $false
      Action = ""
      TriggerSummary = ""
    }
  }
  $info = Get-ScheduledTaskInfo -TaskName $TaskName
  $action = ($task.Actions | ForEach-Object { "$($_.Execute) $($_.Arguments)" }) -join " | "
  $actionMatches = $action -like "*$ExpectedScript*"
  if (-not $actionMatches -and $TaskName -eq $paperTaskName) {
    $legacyPaperScript = Join-Path $projectRoot "Scripts\run-marketops-paper-full-v0.1.ps1"
    if (($action -like "*$legacyPaperScript*") -and (Test-Path $legacyPaperScript)) {
      $legacyText = Get-Content -Raw $legacyPaperScript
      $actionMatches = $legacyText -like "*run-marketops-paper-refresh-v0.2.ps1*"
    }
  }
  $triggerSummary = ($task.Triggers | ForEach-Object {
    $interval = if ($_.Repetition) { $_.Repetition.Interval } else { "" }
    "Enabled=$($_.Enabled); Start=$($_.StartBoundary); Interval=$interval; Days=$($_.DaysInterval)"
  }) -join " | "
  [pscustomobject]@{
    TaskName = $TaskName
    Exists = $true
    State = [string]$task.State
    LastRunTime = $info.LastRunTime
    NextRunTime = $info.NextRunTime
    LastTaskResult = $info.LastTaskResult
    ActionMatches = $actionMatches
    Action = $action
    TriggerSummary = $triggerSummary
  }
}

$summaries = @(
  Get-TaskSummary -TaskName $paperTaskName -ExpectedScript $paperScriptPath
  Get-TaskSummary -TaskName $officeTaskName -ExpectedScript $officeScriptPath
)

$duplicates = Get-ScheduledTask | Where-Object { $_.TaskName -like "MarketOps*" } | Group-Object TaskName | Where-Object { $_.Count -gt 1 }
$unexpected = Get-ScheduledTask | Where-Object { $_.TaskName -like "MarketOps*" -and $_.TaskName -notin @($paperTaskName, $officeTaskName) }

$summaries | Format-List
Write-Host "Duplicate MarketOps task groups: $($duplicates.Count)"
Write-Host "Unexpected MarketOps tasks: $($unexpected.Count)"

$failed = @()
foreach ($summary in $summaries) {
  if (-not $summary.Exists) { $failed += "$($summary.TaskName) missing" }
  if (-not $summary.ActionMatches) { $failed += "$($summary.TaskName) action mismatch" }
  if ([string]::IsNullOrWhiteSpace([string]$summary.NextRunTime)) { $failed += "$($summary.TaskName) NextRunTime blank" }
}
if ($duplicates.Count -gt 0) { $failed += "duplicate MarketOps task names found" }
if ($unexpected.Count -gt 0) { $failed += "unexpected MarketOps tasks found" }

if ($failed.Count -gt 0) {
  Write-Error ("MarketOps scheduled task check failed: " + ($failed -join "; "))
  exit 1
}

Write-Host "MarketOps scheduled task check PASS."
