from pathlib import Path
import re

file_path = Path("src/stores/globals.js")

main_timezones = [
    "America/New_York",
    "America/Los_Angeles",
    "America/Chicago",
    "America/Denver",
    "America/Phoenix",
    "America/Anchorage",
    "Pacific/Honolulu",
    "America/Toronto",
    "America/Vancouver",
    "America/Mexico_City",
    "America/Sao_Paulo",
    "UTC",
    "Europe/London",
    "Europe/Dublin",
    "Europe/Brussels",
    "Europe/Paris",
    "Europe/Berlin",
    "Europe/Madrid",
    "Europe/Rome",
    "Europe/Amsterdam",
    "Europe/Zurich",
    "Europe/Stockholm",
    "Europe/Warsaw",
    "Europe/Moscow",
    "Asia/Riyadh",
    "Asia/Dubai",
    "Asia/Kolkata",
    "Asia/Bangkok",
    "Asia/Singapore",
    "Asia/Shanghai",
    "Asia/Hong_Kong",
    "Asia/Tokyo",
    "Asia/Seoul",
    "Australia/Sydney",
    "Australia/Melbourne",
    "Pacific/Auckland",
]

s = file_path.read_text()

new_line = 'export const timeZones = ref(' + repr(main_timezones).replace("'", '"') + ')'

s2, n = re.subn(
    r'export const timeZones = ref\(\[[^\]]*\]\)',
    new_line,
    s,
    count=1,
)

if n != 1:
    raise SystemExit("Could not find timeZones array in src/stores/globals.js")

file_path.write_text(s2)
print("Updated timeZones in", file_path)
