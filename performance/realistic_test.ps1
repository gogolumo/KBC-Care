# Realistic 1,000,000-customer test for the KBC Compass backend (Windows / PowerShell).
#
#  Part 1  MEMORY   builds real state for 100,000 customers in-process and extrapolates to 1,000,000.
#  Part 2  TRAFFIC  starts its own backend on port 8010 (population 1,000,000), then replays
#                   realistic bank traffic: peak hour (x1) and spikes x5, x10, x20, x40,
#                   until the server saturates.
#  Part 3  DEMO     checks Elise's demo flow still works on the loaded server.
#
#   cd <repo>\performance
#   powershell -ExecutionPolicy Bypass -File .\realistic_test.ps1          # ~6-8 min
#   powershell -ExecutionPolicy Bypass -File .\realistic_test.ps1 -Quick   # ~2 min

param([switch]$Quick, [int]$Population = 1000000, [int]$Port = 8010)
$ErrorActionPreference = "Continue"

$here    = $PSScriptRoot
$repo    = Split-Path $here -Parent
$backend = Join-Path $repo "backend"
$py      = Join-Path $backend ".venv\Scripts\python.exe"
$base    = "http://127.0.0.1:$Port"
$outDir  = Join-Path $here ("results\realistic-" + (Get-Date -Format "yyyyMMdd-HHmmss"))
if (-not (Test-Path $py)) { throw "Missing $py - set up the backend venv first." }
New-Item -ItemType Directory -Path $outDir -Force | Out-Null

function Get-ServerMB($rootPid) {
    $ids = @($rootPid) + @(Get-CimInstance Win32_Process -Filter "ParentProcessId=$rootPid" | ForEach-Object { $_.ProcessId })
    $max = 0
    foreach ($id in $ids) { $p = Get-Process -Id $id -ErrorAction SilentlyContinue; if ($p -and $p.WorkingSet64 -gt $max) { $max = $p.WorkingSet64 } }
    [math]::Round($max / 1MB, 1)
}

# ---------------------------------------------------------------- 1. memory
$memCustomers = if ($Quick) { 20000 } else { 100000 }
Write-Host "PART 1 - memory: building state for $memCustomers customers (extrapolating to $Population)..." -ForegroundColor Cyan
Push-Location $backend
$memOut = & $py (Join-Path $here "population_memory.py") --customers $memCustomers --target $Population
Pop-Location
$memOut | Set-Content (Join-Path $outDir "memory.txt")
$memOut | Where-Object { $_ -notmatch '^SUMMARY' } | ForEach-Object { Write-Host "  $_" }
$mem = ($memOut | Where-Object { $_ -match '^SUMMARY ' } | Select-Object -Last 1) -replace '^SUMMARY ', '' | ConvertFrom-Json

# ---------------------------------------------------------------- 2. traffic
Write-Host "`nPART 2 - traffic: starting backend on $base with $Population customers..." -ForegroundColor Cyan
$env:USE_MOCK_DATA = "true"
$env:LOAD_TEST_CUSTOMERS = "$Population"
$server = Start-Process -FilePath $py -WorkingDirectory $backend -PassThru -NoNewWindow `
    -ArgumentList "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "$Port", "--log-level", "warning" `
    -RedirectStandardError (Join-Path $outDir "server-stderr.log") -RedirectStandardOutput (Join-Path $outDir "server-stdout.log")

$phases = @(); $demoOk = $false; $idleMB = 0; $endMB = 0
try {
    $ready = $false
    for ($i = 0; $i -lt 60 -and -not $ready; $i++) { Start-Sleep -Milliseconds 500; try { $ready = (Invoke-RestMethod "$base/api/health" -TimeoutSec 2).ok } catch {} }
    if (-not $ready) { throw "Backend did not start - see $outDir\server-stderr.log" }
    try { Invoke-RestMethod ("$base/api/customers/load_{0:D7}" -f $Population) -TimeoutSec 5 | Out-Null } catch { throw "load customers not enabled - is your repo on current main?" }
    $idleMB = Get-ServerMB $server.Id

    $phaseSpec = if ($Quick) { "1:20,10:20,40:20" } else { "1:60,5:45,10:45,20:45,40:45" }
    & $py (Join-Path $here "realistic_load.py") --base-url $base --population $Population --phases $phaseSpec |
        Tee-Object -FilePath (Join-Path $outDir "traffic.jsonl") | ForEach-Object {
            $o = $_ | ConvertFrom-Json
            if ($o.model) { Write-Host ("  model: {0:N0} customers, {1:N0} active today, peak hour = {2} sessions/s" -f $o.model.population, $o.model.dailyActive, $o.model.peakHourSessionsPerSec) }
            elseif ($o.phase) {
                $o | Add-Member ServerMB (Get-ServerMB $server.Id)
                $script:phases += $o
                $bad = ($o.errorPct -gt 1) -or ($o.droppedPct -gt 1) -or ($o.p95ms -gt 2000)
                Write-Host ("  {0,-9} {1,7} sess/s  {2,7} req/s  p95 {3,7} ms  errors {4}%  dropped {5}%  mem {6} MB" -f $o.phase, $o.targetSessionsPerSec, $o.rps, $o.p95ms, $o.errorPct, $o.droppedPct, $o.ServerMB) -ForegroundColor $(if ($bad) { "Yellow" } else { "Green" })
            }
            elseif ($o.stopped) { Write-Host "  -> $($o.stopped)" -ForegroundColor Yellow }
        }
    $endMB = Get-ServerMB $server.Id

    # ------------------------------------------------------------ 3. demo still works
    Write-Host "`nPART 3 - Elise demo flow on the loaded server..." -ForegroundColor Cyan
    Push-Location $backend
    & $py -m scripts.golden_path --base-url $base --quiet | Tee-Object -FilePath (Join-Path $outDir "golden_path.txt") | Select-Object -Last 1
    $demoOk = ($LASTEXITCODE -eq 0)
    Pop-Location
}
finally {
    taskkill /PID $server.Id /T /F | Out-Null
    Remove-Item Env:LOAD_TEST_CUSTOMERS -ErrorAction SilentlyContinue
}

# ---------------------------------------------------------------- report
$phases | Select-Object phase, targetSessionsPerSec, rps, p50ms, p95ms, p99ms, errorPct, droppedPct, ServerMB |
    Export-Csv (Join-Path $outDir "traffic.csv") -NoTypeInformation
$lastGood = $phases | Where-Object { $_.errorPct -le 1 -and $_.droppedPct -le 1 -and $_.p95ms -le 2000 } | Select-Object -Last 1

Write-Host "`n==================== RESULTS ====================" -ForegroundColor Cyan
Write-Host ("Population             : {0:N0} customers" -f $Population)
Write-Host ("Memory per customer    : {0} KB  (measured on {1:N0})" -f $mem.kbPerCustomer, $mem.measuredCustomers)
Write-Host ("RAM if all 1M active   : {0} GB   | if 15% active: {1} GB" -f $mem.projectedMemoryGB_allActive, $mem.projectedMemoryGB_15pctActive)
Write-Host ("State engine speed     : {0:N0} events/s (single core)" -f $mem.stateEngineEventsPerSec)
Write-Host ("Server memory          : {0} MB idle -> {1} MB after traffic" -f $idleMB, $endMB)
$phases | Format-Table phase, targetSessionsPerSec, rps, p50ms, p95ms, p99ms, errorPct, droppedPct, ServerMB -AutoSize | Out-Host
if ($lastGood) {
    $headroom = [math]::Round($lastGood.targetSessionsPerSec / $phases[0].targetSessionsPerSec, 0)
    Write-Host ("Healthy up to          : {0} ({1} sessions/s, {2} req/s) = {3}x the realistic peak hour" -f $lastGood.phase, $lastGood.targetSessionsPerSec, $lastGood.rps, $headroom) -ForegroundColor Green
} else {
    Write-Host "Healthy up to          : not even the peak-hour baseline - check server-stderr.log" -ForegroundColor Red
}
Write-Host ("Demo flow after load   : {0}" -f $(if ($demoOk) { "OK" } else { "FAILED (see golden_path.txt)" })) -ForegroundColor $(if ($demoOk) { "Green" } else { "Red" })
Write-Host "Saved to $outDir"
Write-Host "Paste the RESULTS section to Claude."
