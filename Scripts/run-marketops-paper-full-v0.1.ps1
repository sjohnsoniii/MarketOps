$ErrorActionPreference = "Stop"

$projectRoot = "C:\Users\sjohn\Desktop\Projects\MarketOps"
$coreRoot = Join-Path $projectRoot "Source\marketops-core"
$logsRoot = Join-Path $projectRoot "Data\logs"
$v02Wrapper = Join-Path $projectRoot "Scripts\run-marketops-paper-refresh-v0.2.ps1"
New-Item -ItemType Directory -Force -Path $logsRoot | Out-Null

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logPath = Join-Path $logsRoot "marketops-paper-full-$timestamp.log"
$exitCode = 0

function Write-LogLine {
  param([string]$Message)
  $line = "[$(Get-Date -Format o)] $Message"
  Write-Host $line
  Add-Content -Path $logPath -Value $line
}

try {
  Write-LogLine "MarketOps Paper Runner v0.1 starting."
  if (Test-Path $v02Wrapper) {
    Write-LogLine "Delegating to MarketOps Paper Refresh v0.2 wrapper: $v02Wrapper"
    powershell -NoProfile -ExecutionPolicy Bypass -File $v02Wrapper 2>&1 | ForEach-Object {
      Write-Host $_
      Add-Content -Path $logPath -Value $_
    }
    if ($LASTEXITCODE -ne 0) {
      throw "MarketOps Paper Refresh v0.2 failed with exit code $LASTEXITCODE"
    }
    Write-LogLine "MarketOps Paper Runner v0.1 SUCCESS via v0.2 wrapper."
    return
  }
  Write-LogLine "Project root: $projectRoot"
  Write-LogLine "Core root: $coreRoot"
  Set-Location $coreRoot

  Write-LogLine "Running npm run paper:full"
  npm run paper:full 2>&1 | ForEach-Object {
    Write-Host $_
    Add-Content -Path $logPath -Value $_
  }

  if ($LASTEXITCODE -ne 0) {
    throw "npm run paper:full failed with exit code $LASTEXITCODE"
  }

  Write-LogLine "MarketOps Paper Runner v0.1 SUCCESS."
} catch {
  $exitCode = 1
  Write-LogLine "MarketOps Paper Runner v0.1 FAIL: $($_.Exception.Message)"
} finally {
  Write-LogLine "Log file: $logPath"
  if ($exitCode -ne 0) {
    exit $exitCode
  }
}
