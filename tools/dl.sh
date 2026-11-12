#!/bin/bash
# usage: dl.sh name=assetid.ext ...  (downloads Figma MCP assets into assets/img, retrying while 202)
B=https://www.figma.com/api/mcp/asset
cd "$(dirname "$0")/../assets/img"
for pair in "$@"; do
  n=${pair%%=*}; id=${pair#*=}
  for i in $(seq 1 30); do
    code=$(curl -sL -o "$n" -w "%{http_code}" "$B/$id")
    if [ "$code" = 200 ] && [ -s "$n" ]; then break; fi
    sleep 2
  done
  [ -s "$n" ] || echo "FAIL $n ($code)"
done
