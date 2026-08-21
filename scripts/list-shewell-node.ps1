# Lists PIDs of any surviving node.exe referencing this repo. Used by dev.sh
# to confirm the kill actually worked.
$leftover = Get-CimInstance Win32_Process -Filter "Name='node.exe'" |
  Where-Object { $_.CommandLine -match 'shewell' }
$leftover | ForEach-Object { $_.ProcessId }
