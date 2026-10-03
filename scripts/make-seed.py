#!/usr/bin/env python3
"""
Makes the one-off seed block for Supabase: one card per name, each with its own password.
Usage: python3 scripts/make-seed.py "Name One" "Name Two" ...
Cards appear in the order given. Prints (1) SQL to paste into Supabase after setup.sql and (2) the name → password list to hand out.
Don't commit the output: it contains the passwords.
"""
import secrets
import sys

WORDS = ("blue sky star moon wave sun lake palm sand pearl reef dune hawk lion bear wolf fox owl jade ruby gold mint coral "
         "cedar maple river storm cloud comet orbit nova").split()

names = [n.strip() for n in sys.argv[1:] if n.strip()]
if not names:
    sys.exit(__doc__)

rows, creds = [], []
for name in names:
    pw = f"{secrets.choice(WORDS)}-{secrets.choice(WORDS)}-{secrets.randbelow(90) + 10}"
    safe = name.replace("'", "''")
    rows.append(f"  ('{safe}', extensions.crypt('{pw}', extensions.gen_salt('bf')), {len(rows) + 1})")
    creds.append((name, pw))

print("-- Seed: run once, after setup.sql. Re-running adds duplicates.")
print("insert into public.students (name, pin_hash, position) values")
print(",\n".join(rows) + ";")
print()
for name, pw in creds:
    print(f"{name}: {pw}")
