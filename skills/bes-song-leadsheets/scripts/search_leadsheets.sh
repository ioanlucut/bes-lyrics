#!/usr/bin/env bash
set -euo pipefail

if [[ $# -eq 0 ]]; then
  echo "Usage: $0 <term-or-regex>" >&2
  exit 2
fi

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
upstream_dir="$script_dir/../references/upstream/leadsheets-v0.7"
manual="$upstream_dir/leadsheets_en.txt"
query="$*"

python3 - "$manual" "$query" <<'PY'
from pathlib import Path
import re
import sys

manual_path = Path(sys.argv[1])
query = sys.argv[2]

try:
    pattern = re.compile(query, re.IGNORECASE)
except re.error as error:
    raise SystemExit(f"Invalid regular expression: {error}")

page = 0
matches = 0
lines = manual_path.read_text().splitlines()
for line_number, line in enumerate(lines):
    page_match = re.fullmatch(r"===== PAGE (\d+) =====", line)
    if page_match:
        page = int(page_match.group(1))
        continue
    if not pattern.search(line):
        continue

    matches += 1
    start = max(0, line_number - 2)
    end = min(len(lines), line_number + 3)
    print(f"manual page {page}")
    for context_line_number in range(start, end):
        context = lines[context_line_number]
        if context.startswith("===== PAGE "):
            continue
        marker = ">" if context_line_number == line_number else " "
        print(f"{marker} {context}")
    print()

if matches == 0:
    print("No manual matches.")
PY

printf '%s\n' 'package implementation'
rg --line-number --ignore-case --context 2 --glob '!leadsheets_en.txt' -- "$query" "$upstream_dir" || true
