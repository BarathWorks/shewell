#!/usr/bin/env bash
# Starts all three apps' dev servers, guaranteeing a clean slate first.
#
# ─────────────────────────────────────────────────────────────────────────────
#  ROOT CAUSE OF "sometimes loads with no styles" / "Cannot find module
#  './vendor-chunks/...'"  (confirmed 2026-08-21)
# ─────────────────────────────────────────────────────────────────────────────
# TWO dev servers were running per port, and Windows never reported a conflict,
# because they bound DIFFERENT socket addresses:
#
#     ::        3001   <- `next dev -p 3001`              (no -H, defaults to IPv6)
#     0.0.0.0   3001   <- `next dev -p 3001 -H 0.0.0.0`   (package.json script)
#
# `0.0.0.0:3001` and `[::]:3001` are distinct bindings, so the second server
# starts cleanly with no EADDRINUSE. Nothing warns you that two Next.js dev
# servers are now live on "the same" port.
#
# On Windows `localhost` resolves to BOTH ::1 and 127.0.0.1 (see the hosts file).
# The browser picks a stack per connection — so requests get split, unpredictably,
# between two independent dev servers that are both compiling into the SAME
# `apps/<app>/.next` directory.
#
# That produces exactly the two symptoms seen:
#   * One server has compiled a route and emitted its CSS <link>; the other has
#     not. Whichever answers decides whether the page arrives styled. Verified by
#     fetching the same URL over both stacks: 127.0.0.1 returned a CSS link,
#     ::1 returned none.
#   * Both compilers write and rename vendor chunks in the same directory, so one
#     deletes/replaces a file the other's webpack-runtime is about to require:
#       Error: Cannot find module './vendor-chunks/date-fns@3.6.0.js'
#
# THE FIX is not killing processes harder — it is making every entry point bind
# the SAME address, so a second start fails loudly with EADDRINUSE instead of
# silently succeeding on the other stack.
#
# The address chosen is the Node default (no -H flag), which binds `::`.
# Measured, on this machine, with Chrome:
#     no -H  (binds ::)        -> navigation connect time    1 ms
#     -H 127.0.0.1 (IPv4 only) -> navigation connect time  303 ms
# because Chrome resolves `localhost` to ::1 first; with an IPv4-only bind every
# single request pays a failed-IPv6-connect before falling back. So `::` is both
# the consistent choice AND the fast one.
#
# Note this is IPv6-only on Windows (IPV6_V6ONLY defaults on), so `127.0.0.1`
# will refuse. Use `localhost` or `[::1]`. If you ever need LAN access (e.g.
# testing on a phone), change BOTH this file and all three package.json "dev"
# scripts together — never just one.
set -euo pipefail
cd "$(dirname "$0")/.."

PORTS=(3001 3002 3004)
APPS=(vyan-client vyan-doctor admin)
# Ports used for one-off `next start`/testing during this project's history.
# Swept too, so a forgotten benchmarking server can't silently keep running.
EXTRA_PORTS=(3010 3011 3012)

echo "== killing every Next.js process for this repo (by command line, not just current port owners) =="
powershell -NoProfile -File scripts/kill-shewell-node.ps1
sleep 2

echo "== confirming no shewell node process survives, at all =="
leftover=$(powershell -NoProfile -File scripts/list-shewell-node.ps1 2>/dev/null | tr -d '\r' | grep -v '^$' || true)
if [ -n "$leftover" ]; then
  echo "  still alive: $leftover — stop these by hand, then re-run this script."
  exit 1
fi
echo "  clean."

echo "== confirming the target ports are free =="
for port in "${PORTS[@]}" "${EXTRA_PORTS[@]}"; do
  still=$(powershell -NoProfile -Command \
    "(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue).OwningProcess" \
    2>/dev/null | tr -d '\r')
  if [ -n "$still" ]; then
    echo "  :$port still held by PID(s) $still (not a node.exe match above — investigate by hand)."
    exit 1
  fi
done
echo "  clean."

echo "== wiping build output, including webpack's persistent cache =="
for app in "${APPS[@]}"; do
  rm -rf "apps/$app/.next"
done
rm -rf .turbo apps/*/.turbo

echo "== starting each app, one at a time, verifying sole ownership before moving on =="
for i in "${!APPS[@]}"; do
  app="${APPS[$i]}"; port="${PORTS[$i]}"
  log="/tmp/dev-${app}.log"
  echo "  starting $app on :$port"
  # NO -H flag — must match each app's package.json "dev" script exactly.
  # See the note at the top of this file: if the two disagree on bind address,
  # Windows treats them as separate sockets and you get two servers on one port
  # with no error at all.
  ( cd "apps/$app" && ./node_modules/.bin/next dev -p "$port" > "$log" 2>&1 & )

  for _ in $(seq 1 30); do
    grep -qE "Ready in|EADDRINUSE|Error" "$log" 2>/dev/null && break
    sleep 1
  done

  # Count LISTENERS, not just PIDs. A single process can hold one address while a
  # second process holds the other stack on the same port — the exact condition
  # that caused the intermittent unstyled pages. Anything other than exactly one
  # listener means the split-stack bug is back.
  listeners=$(powershell -NoProfile -Command     "(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Measure-Object).Count"     2>/dev/null | tr -d '
')
  if [ "$listeners" != "1" ]; then
    echo "  :$port has $listeners listeners — expected exactly 1."
    powershell -NoProfile -Command       "Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object LocalAddress,LocalPort,OwningProcess | Format-Table -AutoSize"       2>/dev/null
    echo "  Two listeners on different addresses (:: and 0.0.0.0) is the split-stack bug."
    echo "  See $log"
    exit 1
  fi
  addr=$(powershell -NoProfile -Command     "(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue).LocalAddress"     2>/dev/null | tr -d '
')
  echo "  :$port OK — exactly 1 listener on $addr"
done

echo
echo "all three up: http://localhost:3001  http://localhost:3002  http://localhost:3004"
echo
echo "IMPORTANT: this is now the only supported way to start dev servers for this repo."
echo "Do not run 'pnpm dev' / 'turbo dev' / 'npm run dev' in an app directory alongside"
echo "this script, or you recreate the exact race this script exists to prevent."
