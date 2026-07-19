#!/usr/bin/env bash
set -euo pipefail

if [[ $# -eq 0 ]]; then
  echo "Usage: $0 <term-or-regex>" >&2
  exit 2
fi

query="$*"
tmp_dir=$(mktemp -d)
trap 'rm -rf "$tmp_dir"' EXIT

manual_path=$(kpsewhich --format='TeX system documentation' leadsheets_en.pdf 2>/dev/null || true)
if [[ -z "$manual_path" ]]; then
  manual_path="$tmp_dir/leadsheets_en.pdf"
  curl -fsSL \
    'https://mirrors.nxthost.com/ctan/macros/latex/contrib/leadsheets/leadsheets_en.pdf' \
    -o "$manual_path"
fi

pdftotext -layout "$manual_path" "$tmp_dir/manual.txt"

python3 - "$tmp_dir/manual.txt" "$query" <<'PY'
from pathlib import Path
import re
import sys

manual_path = Path(sys.argv[1])
query = sys.argv[2]

try:
    pattern = re.compile(query, re.IGNORECASE)
except re.error as error:
    raise SystemExit(f"Invalid regular expression: {error}")

matches = 0
for page_number, page in enumerate(manual_path.read_text().split("\f"), start=1):
    lines = page.splitlines()
    for line_number, line in enumerate(lines):
        if not pattern.search(line):
            continue

        matches += 1
        start = max(0, line_number - 2)
        end = min(len(lines), line_number + 3)
        print(f"manual page {page_number}")
        for context_line_number in range(start, end):
            marker = ">" if context_line_number == line_number else " "
            print(f"{marker} {lines[context_line_number]}")
        print()

if matches == 0:
    print("No manual matches.")
PY

style_path=$(kpsewhich leadsheets.sty 2>/dev/null || true)
if [[ -n "$style_path" ]]; then
  printf '%s\n' 'installed package implementation'
  rg --line-number --ignore-case --context 2 -- "$query" "$(dirname "$style_path")" || true
fi
