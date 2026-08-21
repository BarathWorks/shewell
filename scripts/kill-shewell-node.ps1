# Kills every node.exe whose command line references this repo AND next.js.
# Used by dev.sh so the kill logic doesn't have to survive bash->powershell
# quote-escaping, which is what broke the inline version.
$procs = Get-CimInstance Win32_Process -Filter "Name='node.exe'" |
  Where-Object { $_.CommandLine -match 'shewell' -and $_.CommandLine -match 'next' }

foreach ($p in $procs) {
  $preview = $p.CommandLine.Substring(0, [Math]::Min(90, $p.CommandLine.Length))
  Write-Output ("  stopping PID " + $p.ProcessId + "  " + $preview)
  Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
}
