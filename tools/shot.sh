#!/bin/bash
# usage: tools/shot.sh <page-path-in-dist> <height> [width]  -> .shots/<name>.png
cd "$(dirname "$0")/.."
p=$1; h=$2; w=${3:-1440}; n=$(echo "${p%/index.html}" | tr '/' '_'); [ "$n" = "index.html" ] && n=home
mkdir -p .shots
"/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" --headless=new --disable-gpu --hide-scrollbars --window-size=$w,$h --virtual-time-budget=15000 --screenshot="$(cygpath -w "$PWD/.shots/$n-$w.png")" "file:///$(cygpath -m "$PWD/dist/$p")" >/dev/null 2>&1
echo ".shots/$n-$w.png"
