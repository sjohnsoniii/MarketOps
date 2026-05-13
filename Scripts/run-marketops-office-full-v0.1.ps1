$ErrorActionPreference = "Stop"

$projectRoot = "C:\Users\sjohn\Desktop\Projects\MarketOps"
$coreRoot = Join-Path $projectRoot "Source\marketops-core"
$logRoot = Join-Path $projectRoot "Data\logs"
$queuePath = Join-Path $projectRoot "Data\content\queue\content-queue-v0.1.json"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logPath = Join-Path $logRoot "marketops-office-full-$timestamp.log"

New-Item -ItemType Directory -Force -Path $logRoot | Out-Null

function Write-LoggedLine {
  param([string]$Message)
  $Message | Tee-Object -FilePath $logPath -Append
}

try {
  Write-LoggedLine "MarketOps Autonomous Office v0.1 starting at $(Get-Date -Format o)"
  Write-LoggedLine "Core root: $coreRoot"
  Set-Location $coreRoot

  Write-LoggedLine "Running npm run office:run"
  npm run office:run 2>&1 | Tee-Object -FilePath $logPath -Append
  if ($LASTEXITCODE -ne 0) {
    throw "npm run office:run failed with exit code $LASTEXITCODE"
  }

  Write-LoggedLine "Running npm run office:qa"
  npm run office:qa 2>&1 | Tee-Object -FilePath $logPath -Append
  if ($LASTEXITCODE -ne 0) {
    throw "npm run office:qa failed with exit code $LASTEXITCODE"
  }

  Write-LoggedLine "MarketOps Autonomous Office v0.1 succeeded at $(Get-Date -Format o)"
  Write-LoggedLine "Content queue: $queuePath"
  Write-LoggedLine "Log file: $logPath"
  exit 0
} catch {
  Write-LoggedLine "MarketOps Autonomous Office v0.1 failed at $(Get-Date -Format o)"
  Write-LoggedLine $_.Exception.Message
  Write-LoggedLine "Log file: $logPath"
  exit 1
}
