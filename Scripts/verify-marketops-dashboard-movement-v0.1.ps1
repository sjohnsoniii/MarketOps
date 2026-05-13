$ErrorActionPreference = "Stop"

$projectRoot = "C:\Users\sjohn\Desktop\Projects\MarketOps"
$dashboardPath = "C:\Users\sjohn\Desktop\Projects\sj3labs\data\marketops\dashboard-bundle-public-v0.4.json"
$refreshScript = Join-Path $projectRoot "Scripts\run-marketops-paper-refresh-v0.2.ps1"
$reportPath = Join-Path $projectRoot "Reports\Dashboard\marketops-dashboard-movement-verification-v0.1.md"

function Read-Dashboard {
  if (-not (Test-Path $dashboardPath)) { throw "Dashboard bundle not found: $dashboardPath" }
  return Get-Content -Raw $dashboardPath | ConvertFrom-Json
}

function Run-Refresh {
  powershell -NoProfile -ExecutionPolicy Bypass -File $refreshScript
  if ($LASTEXITCODE -ne 0) { throw "Refresh failed with exit code $LASTEXITCODE" }
}

Write-Host "MarketOps dashboard movement verification starting."
Run-Refresh
$first = Read-Dashboard
Write-Host "First generatedAt: $($first.generatedAt)"
Write-Host "First lastRefreshAt: $($first.lastRefreshAt)"
Write-Host "First latestAlpacaBarTimestamp: $($first.latestAlpacaBarTimestamp)"
Start-Sleep -Seconds 12
Run-Refresh
$second = Read-Dashboard
Write-Host "Second generatedAt: $($second.generatedAt)"
Write-Host "Second lastRefreshAt: $($second.lastRefreshAt)"
Write-Host "Second latestAlpacaBarTimestamp: $($second.latestAlpacaBarTimestamp)"

$checks = @()
$checks += [pscustomobject]@{ Name = "generatedAt changed"; Passed = ($first.generatedAt -ne $second.generatedAt); Detail = "$($first.generatedAt) -> $($second.generatedAt)" }
$checks += [pscustomobject]@{ Name = "lastRefreshAt changed"; Passed = ($first.lastRefreshAt -ne $second.lastRefreshAt); Detail = "$($first.lastRefreshAt) -> $($second.lastRefreshAt)" }
$checks += [pscustomobject]@{ Name = "movement fields present"; Passed = (($second.topWatchlistMovers.Count -gt 0) -and ($second.symbolMovementPreview.Count -gt 0) -and ($second.marketActivityHeartbeat -ne $null)); Detail = "movers=$($second.topWatchlistMovers.Count), symbols=$($second.symbolMovementPreview.Count)" }
$checks += [pscustomobject]@{ Name = "zero-trade dashboard still explains movement"; Passed = (($second.fakePaperTradeCount -gt 0) -or (-not [string]::IsNullOrWhiteSpace($second.noTradeReason))); Detail = "fakePaperTradeCount=$($second.fakePaperTradeCount), noTradeReason=$($second.noTradeReason)" }
$checks += [pscustomobject]@{ Name = "paper-only flags safe"; Passed = (($second.paperOnly -eq $true) -and ($second.liveTradingEnabled -eq $false)); Detail = "paperOnly=$($second.paperOnly), liveTradingEnabled=$($second.liveTradingEnabled)" }

$passed = ($checks | Where-Object { -not $_.Passed }).Count -eq 0
New-Item -ItemType Directory -Force -Path (Split-Path $reportPath) | Out-Null
$report = @()
$report += "# MarketOps Dashboard Movement Verification v0.1"
$report += ""
$report += "Generated: $(Get-Date -Format o)"
$report += ""
$report += "## Verdict"
$report += ""
$report += $(if ($passed) { "PASS" } else { "FAIL" })
$report += ""
$report += "## Checks"
$checks | ForEach-Object { $report += "- $(if ($_.Passed) { "PASS" } else { "FAIL" }): $($_.Name) - $($_.Detail)" }
$report += ""
$report += "## Confirmation"
$report += ""
$report += "This script runs local paper refreshes only. It does not commit, push, deploy, post, email, send SMS, place orders, or enable live trading."
$report -join "`n" | Set-Content -Path $reportPath -Encoding UTF8

if ($passed) {
  Write-Host "DASHBOARD MOVEMENT PASS"
} else {
  Write-Host "DASHBOARD MOVEMENT FAIL"
  $checks | Where-Object { -not $_.Passed } | ForEach-Object { Write-Host "FAIL: $($_.Name) - $($_.Detail)" }
  exit 1
}
Write-Host "movement report: $reportPath"
