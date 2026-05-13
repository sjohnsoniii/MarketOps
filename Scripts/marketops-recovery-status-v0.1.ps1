$ErrorActionPreference = "Continue"

$projectRoot = "C:\Users\sjohn\Desktop\Projects\MarketOps"
$coreRoot = Join-Path $projectRoot "Source\marketops-core"
$sj3labsRoot = "C:\Users\sjohn\Desktop\Projects\sj3labs"
$publicBundlePath = Join-Path $sj3labsRoot "data\marketops\dashboard-bundle-public-v0.4.json"
$marketDataPath = Join-Path $projectRoot "Data\market-data\alpaca\alpaca-market-data-latest-v0.1.json"
$contentQueuePath = Join-Path $projectRoot "Data\content\queue\content-queue-v0.1.json"
$reviewStatePath = Join-Path $projectRoot "Data\content\queue\content-review-state-v0.1.json"
$approvedContentPath = Join-Path $projectRoot "Data\content\queue\approved-content-v0.1.json"
$automationReportPath = Join-Path $projectRoot "Reports\Automation\marketops-recovery-status-v0.1.md"
$statusReportPath = Join-Path $projectRoot "Reports\Status\marketops-current-status-latest.md"

function Read-JsonIfExists {
  param([string]$Path)
  if (-not (Test-Path $Path)) { return $null }
  try { return Get-Content -Raw $Path | ConvertFrom-Json } catch { return $null }
}

function Get-TaskSummary {
  param([string]$Name)
  $task = Get-ScheduledTask -TaskName $Name -ErrorAction SilentlyContinue
  if ($null -eq $task) {
    return [pscustomobject]@{
      Name = $Name
      Exists = $false
      State = "missing"
      LastRunTime = ""
      NextRunTime = ""
      LastTaskResult = ""
      Action = ""
      TriggerSummary = ""
    }
  }
  $info = Get-ScheduledTaskInfo -TaskName $Name -ErrorAction SilentlyContinue
  $action = ($task.Actions | ForEach-Object { "$($_.Execute) $($_.Arguments)" }) -join " | "
  $triggerSummary = ($task.Triggers | ForEach-Object {
    $interval = if ($_.Repetition) { $_.Repetition.Interval } else { "" }
    "Enabled=$($_.Enabled); Start=$($_.StartBoundary); Interval=$interval; Days=$($_.DaysInterval)"
  }) -join " | "
  return [pscustomobject]@{
    Name = $Name
    Exists = $true
    State = [string]$task.State
    LastRunTime = $info.LastRunTime
    NextRunTime = $info.NextRunTime
    LastTaskResult = $info.LastTaskResult
    Action = $action
    TriggerSummary = $triggerSummary
  }
}

function Invoke-CoreQa {
  param([string]$ScriptName)
  Push-Location $coreRoot
  try {
    $result = & npm run $ScriptName 2>&1
    $exit = $LASTEXITCODE
    return [pscustomobject]@{
      Script = $ScriptName
      ExitCode = $exit
      Passed = ($exit -eq 0)
      Tail = (($result | Select-Object -Last 8) -join "`n")
    }
  } finally {
    Pop-Location
  }
}

function Scan-Text {
  param(
    [string]$Path,
    [string[]]$Terms
  )
  if (-not (Test-Path $Path)) { return @("missing:$Path") }
  $text = Get-Content -Raw $Path
  $hits = @()
  foreach ($term in $Terms) {
    if ($text.ToLowerInvariant().Contains($term.ToLowerInvariant())) { $hits += $term }
  }
  return $hits
}

$dashboard = Read-JsonIfExists -Path $publicBundlePath
$marketData = Read-JsonIfExists -Path $marketDataPath
$queue = Read-JsonIfExists -Path $contentQueuePath
$reviewState = Read-JsonIfExists -Path $reviewStatePath
$approved = Read-JsonIfExists -Path $approvedContentPath
$packageJson = Read-JsonIfExists -Path (Join-Path $coreRoot "package.json")

$scriptNames = @()
if ($packageJson -and $packageJson.scripts) {
  $scriptNames = @($packageJson.scripts.PSObject.Properties | ForEach-Object { $_.Name } | Sort-Object)
}

$qaResults = @(
  Invoke-CoreQa -ScriptName "admin:qa"
  Invoke-CoreQa -ScriptName "dashboard:qa"
  Invoke-CoreQa -ScriptName "automation:check"
)

$tasks = @(
  Get-TaskSummary -Name "MarketOps Paper Runner v0.1"
  Get-TaskSummary -Name "MarketOps Autonomous Office v0.1"
)
$marketOpsTasks = Get-ScheduledTask -ErrorAction SilentlyContinue | Where-Object { $_.TaskName -like "MarketOps*" }
$duplicates = $marketOpsTasks | Group-Object TaskName | Where-Object { $_.Count -gt 1 }
$logs = Get-ChildItem (Join-Path $projectRoot "Data\logs") -Filter "*.log" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 5
$adminPort = Get-NetTCPConnection -LocalPort 4317 -ErrorAction SilentlyContinue | Select-Object -First 1
$adminHttpStatus = "not_checked"
try {
  $response = Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:4317" -TimeoutSec 4
  $adminHttpStatus = [string]$response.StatusCode
} catch {
  $adminHttpStatus = "unreachable"
}

$gitStatus = "not_available"
if (Test-Path (Join-Path $sj3labsRoot ".git")) {
  Push-Location $sj3labsRoot
  try { $gitStatus = ((git status --short) -join "`n") } catch { $gitStatus = "git status failed: $($_.Exception.Message)" } finally { Pop-Location }
  if ([string]::IsNullOrWhiteSpace($gitStatus)) { $gitStatus = "clean" }
}

$secretHits = Scan-Text -Path $publicBundlePath -Terms @(
  "APCA-API-KEY-ID",
  "APCA-API-SECRET-KEY",
  "BEGIN PRIVATE KEY",
  "SECRET_KEY",
  "access_token",
  "refresh_token",
  "password"
)

$publishAllowedRisk = $false
if ($dashboard -and $dashboard.publishAllowed -eq $true) { $publishAllowedRisk = $true }
if ($queue -and $queue.publishAllowed -eq $true) { $publishAllowedRisk = $true }
if ($approved -and $approved.publishAllowed -eq $true) { $publishAllowedRisk = $true }
if ($approved -and $approved.items) {
  foreach ($item in @($approved.items)) {
    if ($item.publishAllowed -eq $true) { $publishAllowedRisk = $true }
  }
}

$decisionCount = 0
if ($reviewState -and $reviewState.decisions) {
  $decisionCount = @($reviewState.decisions.PSObject.Properties).Count
}

$knownBlockers = @()
if (-not $adminPort) { $knownBlockers += "admin console is not listening on localhost:4317" }
if ($adminHttpStatus -ne "200") { $knownBlockers += "admin console HTTP status is $adminHttpStatus" }
if (($qaResults | Where-Object { -not $_.Passed }).Count -gt 0) { $knownBlockers += "one or more recovery QA checks failed" }
if (($tasks | Where-Object { [string]::IsNullOrWhiteSpace([string]$_.NextRunTime) }).Count -gt 0) { $knownBlockers += "one or more MarketOps scheduled tasks has blank NextRunTime" }
if ($duplicates.Count -gt 0) { $knownBlockers += "duplicate MarketOps scheduled task names detected" }
if ($dashboard -and $dashboard.liveTradingEnabled -ne $false) { $knownBlockers += "dashboard liveTradingEnabled is not false" }
if ($dashboard -and $dashboard.paperOnly -ne $true) { $knownBlockers += "dashboard paperOnly is not true" }
if ($publishAllowedRisk) { $knownBlockers += "publishAllowed true found in queue/bundle/approved content" }
if ($secretHits.Count -gt 0) { $knownBlockers += "secret-like markers found in public bundle: $($secretHits -join ', ')" }
if ($knownBlockers.Count -eq 0) { $knownBlockers += "none detected" }

$lines = @()
$lines += "# MarketOps Current Status Latest"
$lines += ""
$lines += "Generated: $(Get-Date -Format o)"
$lines += ""
$lines += "## Current Mode"
$lines += ""
$lines += "- Mode: $($dashboard.mode)"
$lines += "- Data source: $($dashboard.dataSource)"
$lines += "- Market data mode: $($dashboard.marketDataMode)"
$lines += "- Paper only: $($dashboard.paperOnly)"
$lines += "- Live trading enabled: $($dashboard.liveTradingEnabled)"
$lines += "- Publish allowed risk found: $publishAllowedRisk"
$lines += ""
$lines += "## Refresh State"
$lines += ""
$lines += "- Last market refresh: $($marketData.generatedAt)"
$lines += "- Latest Alpaca bar timestamp: $($marketData.latestBarTimestamp)"
$lines += "- Last dashboard refresh: $($dashboard.lastRefreshAt)"
$lines += "- Generated at: $($dashboard.generatedAt)"
$lines += "- Next expected refresh: $($dashboard.nextExpectedRefreshAt)"
$lines += "- Refresh cadence minutes: $($dashboard.refreshCadenceMinutes)"
$lines += "- Bars loaded: $($dashboard.barsLoaded)"
$lines += "- Quotes loaded: $($dashboard.quotesLoaded)"
$lines += ""
$lines += "## Paper Snapshot"
$lines += ""
$lines += "- Starting balance: $($dashboard.startingBalance)"
$lines += "- Ending equity: $($dashboard.endingEquity)"
$lines += "- Paper P/L: $($dashboard.paperPnl)"
$lines += "- Paper return percent: $($dashboard.paperReturnPct)"
$lines += "- Signals generated: $($dashboard.signalsGeneratedCount)"
$lines += "- Risk approved: $($dashboard.approvedSignalCount)"
$lines += "- Risk blocked: $($dashboard.riskBlockedCount)"
$lines += "- Fake paper trades: $($dashboard.fakePaperTradeCount)"
$lines += "- No-trade reason: $($dashboard.noTradeReason)"
$lines += ""
$lines += "## Admin Console"
$lines += ""
$lines += "- Local URL: http://localhost:4317"
$lines += "- Listening: $([bool]$adminPort)"
if ($adminPort) { $lines += "- Owning process: $($adminPort.OwningProcess)" }
$lines += "- HTTP status: $adminHttpStatus"
$lines += ""
$lines += "## Scheduled Tasks"
$lines += ""
foreach ($task in $tasks) {
  $lines += "- $($task.Name): exists=$($task.Exists), state=$($task.State), last=$($task.LastRunTime), next=$($task.NextRunTime), result=$($task.LastTaskResult)"
  $lines += "  - Trigger: $($task.TriggerSummary)"
  $lines += "  - Action: $($task.Action)"
}
$lines += "- Duplicate task groups: $($duplicates.Count)"
$lines += ""
$lines += "## Latest QA Results"
$lines += ""
foreach ($qa in $qaResults) {
  $lines += "- $(if ($qa.Passed) { "PASS" } else { "FAIL" }): npm run $($qa.Script) (exit $($qa.ExitCode))"
}
$lines += ""
$lines += "## Content Queue"
$lines += ""
$lines += "- Queue items: $($queue.items.Count)"
$lines += "- Queue publishAllowed: $($queue.publishAllowed)"
$lines += "- Review decisions: $decisionCount"
$lines += "- Approved content items: $($approved.items.Count)"
$lines += "- Approved content publishAllowed: $($approved.publishAllowed)"
$lines += ""
$lines += "## sj3labs Git Status"
$lines += ""
$lines += '```text'
$lines += $gitStatus
$lines += '```'
$lines += ""
$lines += "## Latest Logs"
$lines += ""
foreach ($log in $logs) {
  $lines += "- $($log.FullName) :: $($log.LastWriteTime)"
}
$lines += ""
$lines += "## Known Blockers"
$lines += ""
foreach ($blocker in $knownBlockers) {
  $lines += "- $blocker"
}
$lines += ""
$lines += "## Next Recommended Action"
$lines += ""
$lines += '- Run `npm run full:qa`, then `powershell -ExecutionPolicy Bypass -File "C:\Users\sjohn\Desktop\Projects\MarketOps\Scripts\verify-marketops-dashboard-movement-v0.1.ps1"` if dashboard movement needs proof.'
$lines += ""
$lines += "## Confirmations"
$lines += ""
$lines += "- This script does not commit, push, deploy, post, email, send SMS, place orders, or call external social/broker APIs."
$lines += "- It reads local state only and writes local reports."

New-Item -ItemType Directory -Force -Path (Split-Path $automationReportPath) | Out-Null
New-Item -ItemType Directory -Force -Path (Split-Path $statusReportPath) | Out-Null
$content = $lines -join "`n"
$content | Set-Content -Path $automationReportPath -Encoding UTF8
$content | Set-Content -Path $statusReportPath -Encoding UTF8
$content
Write-Host ""
Write-Host "Recovery status report: $automationReportPath"
Write-Host "Current status report: $statusReportPath"
