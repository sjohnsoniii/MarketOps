$ErrorActionPreference = "Stop"

$paperTaskName = "MarketOps Paper Runner v0.1"
$officeTaskName = "MarketOps Autonomous Office v0.1"
$projectRoot = "C:\Users\sjohn\Desktop\Projects\MarketOps"
$paperScriptPath = Join-Path $projectRoot "Scripts\run-marketops-paper-refresh-v0.2.ps1"
$officeScriptPath = Join-Path $projectRoot "Scripts\run-marketops-office-full-v0.1.ps1"

function Register-PaperTask {
  if (-not (Test-Path $paperScriptPath)) { throw "Paper refresh wrapper not found: $paperScriptPath" }
  $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$paperScriptPath`""
  $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 30) -RepetitionDuration (New-TimeSpan -Days 3650)
  $principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited
  $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -MultipleInstances IgnoreNew -StartWhenAvailable
  Register-ScheduledTask -TaskName $paperTaskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description "Runs MarketOps data-only paper refresh locally every 30 minutes while the user is logged in." -Force | Out-Null
}

function Register-OfficeTask {
  if (-not (Test-Path $officeScriptPath)) { throw "Office runner not found: $officeScriptPath" }
  $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$officeScriptPath`""
  $trigger = New-ScheduledTaskTrigger -Daily -At "7:30PM"
  $principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited
  $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -MultipleInstances IgnoreNew -StartWhenAvailable
  Register-ScheduledTask -TaskName $officeTaskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description "Runs MarketOps autonomous office/content/review locally once daily while the user is logged in." -Force | Out-Null
}

function Remove-DuplicateMarketOpsTasks {
  $allowed = @($paperTaskName, $officeTaskName)
  Get-ScheduledTask | Where-Object { $_.TaskName -like "MarketOps*" -and $allowed -notcontains $_.TaskName } | ForEach-Object {
    Write-Host "Removing stale/unapproved MarketOps task: $($_.TaskName)"
    Unregister-ScheduledTask -TaskName $_.TaskName -Confirm:$false
  }
}

$repairWarnings = @()

try {
  Remove-DuplicateMarketOpsTasks
} catch {
  $repairWarnings += "Could not remove unexpected MarketOps tasks: $($_.Exception.Message)"
}

try {
  Register-PaperTask
} catch {
  $repairWarnings += "Could not register paper task directly: $($_.Exception.Message)"
  $legacyPaperRunner = Join-Path $projectRoot "Scripts\run-marketops-paper-full-v0.1.ps1"
  if (Test-Path $legacyPaperRunner) {
    $legacyText = Get-Content -Raw $legacyPaperRunner
    if ($legacyText -like "*run-marketops-paper-refresh-v0.2.ps1*") {
      Write-Warning "Paper task registration was denied, but the existing v0.1 wrapper delegates to v0.2 refresh."
    } else {
      throw "Paper task registration denied and legacy wrapper does not delegate to v0.2 refresh."
    }
  } else {
    throw "Paper task registration denied and legacy wrapper was not found."
  }
}

try {
  Register-OfficeTask
} catch {
  $repairWarnings += "Could not register office task directly: $($_.Exception.Message)"
  $existingOffice = Get-ScheduledTask -TaskName $officeTaskName -ErrorAction SilentlyContinue
  if ($null -ne $existingOffice) {
    Write-Warning "Office task registration was denied, but an existing approved office task is present."
  } else {
    throw "Office task registration denied and no existing office task is present."
  }
}

Write-Host "Installed/repaired approved MarketOps scheduled tasks."
Write-Host "Paper task: $paperTaskName"
Write-Host "Paper cadence: every 30 minutes while user is logged in"
Write-Host "Paper action: $paperScriptPath"
Write-Host "Office task: $officeTaskName"
Write-Host "Office cadence: daily at 7:30 PM while user is logged in"
Write-Host "Office action: $officeScriptPath"
if ($repairWarnings.Count -gt 0) {
  Write-Host "Repair warnings:"
  $repairWarnings | ForEach-Object { Write-Host "- $_" }
}

& (Join-Path $projectRoot "Scripts\check-marketops-refresh-tasks-v0.2.ps1")
