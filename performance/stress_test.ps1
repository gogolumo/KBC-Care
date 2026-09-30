# KBC Compass backend stress test (Windows / PowerShell).
#
# Starts its OWN backend on port 8010 (so your dev server on 8000 is untouched) with
# 2,000,000 synthetic load customers enabled, then runs performance/run_benchmark.py
# in increasing steps until the API degrades (error rate > 1% or p95 > 2 s).
# Afterwards it checks that Elise's demo flow still works on the loaded server,
# prints a table, saves results, and stops the server.
#
#   cd <repo>\performance
#   powershell -ExecutionPolicy Bypass -File .\stress_test.ps1            # ~3-6 min
#   powershell -ExecutionPolicy Bypass -File .\stress_test.ps1 -Quick     # ~1 min
#   powershell -ExecutionPolicy Bypass -File .\stress_test.ps1 -Soak      # + 20k distinct customers (memory growth)

param([switch]$Quick, [switch]$Soak, [int]$Port = 8010)
$ErrorActionPreference = "Continue"

$here    = $PSScriptRoot
$repo    = Split-Path $here -Parent
$backend = Join-Path $repo "backend"
$py      = Join-Path $backend ".venv\Scripts\python.exe"
$bench   = Join-Path $here "run_benchmark.py"
$base    = "http://127.0.0.1:$Port"
$stamp   = Get-Date -Format "yyyyMMdd-HHmmss"
$outDir  = Join-Path $here "results\stress-$stamp"

if (-not (Test-Path $py))    { throw "Missing $py - run the backend setup first (python -m venv .venv; pip install -r requirements.txt)." }
if (-not (Test-Path $bench)) { throw "Missing $bench - update your checkout of main first." }
New-Item -ItemType Directory -Path $outDir -Force | Out-Null

# ---------------------------------------------------------------- helpers
function Get-ServerMB($rootPid) {
    # A venv python.exe on Windows is a launcher that starts the real interpreter as a child.
    $ids = @($rootPid) + @(Get-CimInstance Win32_Process -Filter "ParentProcessId=$rootPid" | ForEach-Object { $_.ProcessId })
    $max = 0
    foreach ($id in $ids) { $p = Get-Process -Id $id -ErrorAction SilentlyContinue; if ($p -and $p.WorkingSet64 -gt $max) { $max = $p.WorkingSet64 } }
    [math]::Round($max / 1MB, 1)
}

function Invoke-Step($scenario, $concurrency, $workers) {
    Write-Host ("  {0,-8} concurrency {1,5}  flows {2,6} ..." -f $scenario, $concurrency, $workers) -NoNewline
    $raw = & $py $bench --base-url $base --scenario $scenario --concurrency $concurrency --requests $workers
    $json = ($raw | Where-Object { $_ -match '^\{' } | Select-Object -Last 1)
    if (-not $json) { Write-Host " FAILED (no result)" -ForegroundColor Red; return $null }
    $r = $json | ConvertFrom-Json
    $mem = Get-ServerMB $server.Id
    $row = [pscustomobject]@{
        Scenario = $scenario; Concurrency = $concurrency; Flows = $workers; Requests = $r.httpRequests
        RPS = $r.rps; p50ms = $r.p50Ms; p95ms = $r.p95Ms; p99ms = $r.p99Ms
        ErrorPct = [math]::Round($r.errorRate * 100, 2); ServerMB = $mem
        Statuses = (($r.statuses.PSObject.Properties | ForEach-Object { "$($_.Name):$($_.Value)" }) -join " ")
    }
    $color = if ($row.ErrorPct -gt 1 -or $row.p95ms -gt 2000) { "Yellow" } else { "Green" }
    Write-Host (" {0} rps  p95 {1} ms  errors {2}%  mem {3} MB" -f $row.RPS, $row.p95ms, $row.ErrorPct, $row.ServerMB) -ForegroundColor $color
    return $row
}

# ---------------------------------------------------------------- start server
Write-Host "Starting backend on $base (1 process, in-memory, LOAD_TEST_CUSTOMERS=2000000)..." -ForegroundColor Cyan
$env:USE_MOCK_DATA = "true"
$env:LOAD_TEST_CUSTOMERS = "2000000"
$server = Start-Process -FilePath $py -WorkingDirectory $backend -PassThru -NoNewWindow `
    -ArgumentList "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "$Port", "--log-level", "warning" `
    -RedirectStandardError (Join-Path $outDir "server-stderr.log") -RedirectStandardOutput (Join-Path $outDir "server-stdout.log")

$rows = @()
try {
    $ready = $false
    for ($i = 0; $i -lt 60 -and -not $ready; $i++) {
        Start-Sleep -Milliseconds 500
        try { $h = Invoke-RestMethod "$base/api/health" -TimeoutSec 2; $ready = $h.ok } catch {}
    }
    if (-not $ready) { throw "Backend did not start - see $outDir\server-stderr.log" }
    try { Invoke-RestMethod "$base/api/customers/load_0000001" -TimeoutSec 5 | Out-Null }
    catch { throw "load_0000001 not addressable - is main up to date (PR #11)?" }
    Write-Host ("Backend up. Idle memory: {0} MB`n" -f (Get-ServerMB $server.Id)) -ForegroundColor Cyan

    # ------------------------------------------------------------ step ladder
    # read = 1 request/flow, business = 8, full = 13 (reset, 5 events, state, policy, confirm, journey, step, passport, read)
    if ($Quick) {
        $ladder = @(
            @{ s = "read";     c = @(50, 200) },
            @{ s = "business"; c = @(25, 100) },
            @{ s = "full";     c = @(10, 50) }
        )
    } else {
        $ladder = @(
            @{ s = "read";     c = @(50, 200, 500, 1000) },
            @{ s = "business"; c = @(25, 100, 250, 500) },
            @{ s = "full";     c = @(10, 50, 100, 250) }
        )
    }
    foreach ($group in $ladder) {
        Write-Host "Scenario: $($group.s)" -ForegroundColor Cyan
        foreach ($c in $group.c) {
            $row = Invoke-Step $group.s $c ($c * 4)
            if (-not $row) { break }
            $rows += $row
            if ($row.ErrorPct -gt 1 -or $row.p95ms -gt 2000) {
                Write-Host "  -> degradation point reached for '$($group.s)' at concurrency $c; not going higher." -ForegroundColor Yellow
                break
            }
        }
    }

    if ($Soak) {
        Write-Host "Soak: 20,000 distinct customers through the business flow (memory growth)..." -ForegroundColor Cyan
        $before = Get-ServerMB $server.Id
        $row = Invoke-Step "business" 100 20000
        if ($row) {
            $rows += $row
            Write-Host ("  memory {0} MB -> {1} MB  (~{2} KB per active customer)" -f $before, $row.ServerMB, [math]::Round((($row.ServerMB - $before) * 1024) / 20000, 2))
        }
    }

    # ------------------------------------------------------------ demo still works?
    Write-Host "`nChecking Elise's demo flow on the loaded server..." -ForegroundColor Cyan
    Push-Location $backend
    & $py -m scripts.golden_path --base-url $base --quiet | Tee-Object -FilePath (Join-Path $outDir "golden_path.txt") | Select-Object -Last 1
    $demoOk = ($LASTEXITCODE -eq 0)
    Pop-Location
    if ($demoOk) { Write-Host "Demo flow OK under load." -ForegroundColor Green } else { Write-Host "Demo flow FAILED on the loaded server - see golden_path.txt" -ForegroundColor Red }
}
finally {
    taskkill /PID $server.Id /T /F | Out-Null
    Remove-Item Env:LOAD_TEST_CUSTOMERS -ErrorAction SilentlyContinue
}

# ---------------------------------------------------------------- report
$rows | Export-Csv (Join-Path $outDir "results.csv") -NoTypeInformation
$rows | ConvertTo-Json | Set-Content (Join-Path $outDir "results.json")
Write-Host "`n=== RESULTS (one Uvicorn process, in-memory mock data) ===" -ForegroundColor Cyan
$rows | Format-Table Scenario, Concurrency, Flows, Requests, RPS, p50ms, p95ms, p99ms, ErrorPct, ServerMB -AutoSize | Out-Host
Write-Host "Saved to $outDir (results.csv, results.json, golden_path.txt, server logs)."
Write-Host "Paste the RESULTS table to Claude."
