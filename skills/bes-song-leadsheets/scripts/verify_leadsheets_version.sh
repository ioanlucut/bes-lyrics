#!/usr/bin/env bash
set -euo pipefail

expected_version='0.7'
expected_date='2022/01/05'
expected_manual_sha256='1d0d581504a79d5af1eebc129d93ab294db27011fe3f030b3672b2c6ffc23ae1'
script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
vendored_dir="$script_dir/../references/upstream/leadsheets-v0.7"

sha256() {
  if command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$1" | awk '{print $1}'
  else
    sha256sum "$1" | awk '{print $1}'
  fi
}

style_path=$(kpsewhich leadsheets.sty)
manual_path=$(kpsewhich --format='TeX system documentation' leadsheets_en.pdf)
manual_source_path=$(kpsewhich --format='TeX system documentation' leadsheets_en.tex)

if [[ -z "$style_path" ]]; then
  echo 'Leadsheets is not installed: kpsewhich could not find leadsheets.sty.' >&2
  exit 1
fi

if [[ -z "$manual_path" ]]; then
  echo 'Leadsheets manual is not installed: kpsewhich could not find leadsheets_en.pdf.' >&2
  exit 1
fi

installed_version=$(sed -nE 's/.*\\leadsheetsversion \{([^}]*)\}.*/\1/p' "$style_path" | head -1)
installed_date=$(sed -nE 's/.*\\leadsheetsdate +\{([^}]*)\}.*/\1/p' "$style_path" | head -1)
installed_manual_sha256=$(sha256 "$manual_path")

printf 'Expected:  Leadsheets %s (%s)\n' "$expected_version" "$expected_date"
printf 'Installed: Leadsheets %s (%s)\n' "$installed_version" "$installed_date"
printf 'Style:     %s\n' "$style_path"
printf 'Manual:    %s\n' "$manual_path"

if [[ "$installed_version" != "$expected_version" || "$installed_date" != "$expected_date" ]]; then
  echo 'Installed Leadsheets version does not match the skill snapshot.' >&2
  exit 1
fi

if [[ "$installed_manual_sha256" != "$expected_manual_sha256" ]]; then
  echo 'Installed Leadsheets manual does not match the pinned official PDF.' >&2
  exit 1
fi

installed_dir=$(dirname "$style_path")
for vendored_file in \
  "$vendored_dir/leadsheets.sty" \
  "$vendored_dir/leadsheet.cls" \
  "$vendored_dir"/leadsheets.library.*.code.tex; do
  file_name=$(basename "$vendored_file")
  if [[ ! -f "$installed_dir/$file_name" ]] || ! cmp -s "$vendored_file" "$installed_dir/$file_name"; then
    echo "Installed $file_name does not match the pinned CTAN source." >&2
    exit 1
  fi
done

if [[ -z "$manual_source_path" ]] || ! cmp -s "$vendored_dir/leadsheets_en.tex" "$manual_source_path"; then
  echo 'Installed manual source does not match the pinned CTAN source.' >&2
  exit 1
fi

echo 'Version, manual, and package implementation match the pinned skill reference.'
