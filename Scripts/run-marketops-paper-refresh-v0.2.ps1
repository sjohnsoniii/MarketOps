$ErrorActionPreference = "Stop"

$projectRoot = "C:\Users\sjohn\Desktop\Projects\MarketOps"
$coreRoot = Join-Path $projectRoot "Source\marketops-core"
$logsRoot = Join-Path $projectRoot "Data\logs"
New-Item -ItemType Directory -Force -Path $logsRoot | Out-Null

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logPath = Join-Path $logsRoot "marketops-paper-refresh-v0.2-$timestamp.log"
$exitCode = 0

function Write-LogLine {
  param([string]$Message)
  $line = "[$(Get-Date -Format o)] $Message"
  Write-Host $line
  Add-Content -Path $logPath -Value $line
}

try {
  Write-LogLine "MarketOps Paper Refresh v0.2 starting."
  Write-LogLine "Safety: paper simulation only; no order placement, social posting, email, deploy, or live trading."
  Set-Location $coreRoot

  $commands = @(
    "npm run paper:full",
    "npm run dashboard:build",
    "npm run dashboard:qa",
    "npm run marketdata:qa"
  )

  foreach ($command in $commands) {
    Write-LogLine "Running $command"
    cmd.exe /c $command 2>&1 | ForEach-Object {
      Write-Host $_
      Add-Content -Path $logPath -Value $_
    }
    if ($LASTEXITCODE -ne 0) {
      throw "$command failed with exit code $LASTEXITCODE"
    }
  }

  Write-LogLine "MarketOps Paper Refresh v0.2 SUCCESS."
} catch {
  $exitCode = 1
  Write-LogLine "MarketOps Paper Refresh v0.2 FAIL: $($_.Exception.Message)"
} finally {
  Write-LogLine "Log file: $logPath"
  if ($exitCode -ne 0) {
    exit $exitCode
  }
}
