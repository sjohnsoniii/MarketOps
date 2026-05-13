$ErrorActionPreference = "Stop"

$projectRoot = "C:\Users\sjohn\Desktop\Projects\MarketOps"
$coreRoot = Join-Path $projectRoot "Source\marketops-core"
$dashboardPath = "C:\Users\sjohn\Desktop\Projects\sj3labs\data\marketops\dashboard-bundle-public-v0.4.json"
$marketDataPath = Join-Path $projectRoot "Data\market-data\alpaca\alpaca-market-data-latest-v0.1.json"
$wrapper = Join-Path $projectRoot "Scripts\run-marketops-paper-refresh-v0.2.ps1"

function Read-JsonIfExists {
  param([string]$Path)
  if (-not (Test-Path $Path)) { return $null }
  return Get-Content -Raw $Path | ConvertFrom-Json
}

$beforeDashboard = Read-JsonIfExists -Path $dashboardPath
$beforeMarketData = Read-JsonIfExists -Path $marketDataPath

Write-Host "MarketOps refresh-once v0.2 starting."
Write-Host "Before dashboard generatedAt: $($beforeDashboard.generatedAt)"
Write-Host "Before market data generatedAt: $($beforeMarketData.generatedAt)"

powershell -NoProfile -ExecutionPolicy Bypass -File $wrapper
if ($LASTEXITCODE -ne 0) {
  throw "Refresh wrapper failed with exit code $LASTEXITCODE"
}

$afterDashboard = Read-JsonIfExists -Path $dashboardPath
$afterMarketData = Read-JsonIfExists -Path $marketDataPath

Write-Host "After dashboard generatedAt: $($afterDashboard.generatedAt)"
Write-Host "After dashboard lastRefreshAt: $($afterDashboard.lastRefreshAt)"
Write-Host "After dashboard nextExpectedRefreshAt: $($afterDashboard.nextExpectedRefreshAt)"
Write-Host "After market data generatedAt: $($afterMarketData.generatedAt)"
Write-Host "After latest Alpaca bar: $($afterMarketData.latestBarTimestamp)"
Write-Host "Data source: $($afterDashboard.dataSource)"
Write-Host "Paper only: $($afterDashboard.paperOnly)"
Write-Host "Live trading enabled: $($afterDashboard.liveTradingEnabled)"

if ($beforeDashboard.generatedAt -eq $afterDashboard.generatedAt) {
  throw "Dashboard generatedAt did not change."
}
if ($afterDashboard.paperOnly -ne $true -or $afterDashboard.liveTradingEnabled -ne $false) {
  throw "Unsafe dashboard flags detected."
}

Write-Host "MarketOps refresh-once v0.2 PASS."
