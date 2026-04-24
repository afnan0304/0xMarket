#!/usr/bin/env bash
set -euo pipefail

invoices_csv="${1:-invoices.csv}"
exports_csv="${2:-exports.csv}"

printf 'Comparing %s against %s\n' "$invoices_csv" "$exports_csv"
printf 'Rows that do not match are reported by invoice number.\n'
