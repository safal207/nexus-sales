#!/usr/bin/env python3
import os

print('STATUS PROEKTA NEXUS.SALES')
print('=' * 50)

# Proveryaem strukturu
dirs = [
    'apps/web/src/components/funnel',
    'apps/web/src/services/ai',
    'apps/web/tests/e2e',
    'apps/web/src/stores'
]

print('STRUKTURA PROEKTA:')
for dir_path in dirs:
    exists = os.path.exists(dir_path)
    status = 'OK' if exists else 'NET'
    print(f'  {status} {dir_path}')

print()
print('ZAVISIMOSTI:')
try:
    import next
    print('  OK Next.js')
except:
    print('  NET Next.js')

try:
    import zustand
    print('  OK Zustand')
except:
    print('  NET Zustand')

try:
    import playwright
    print('  OK Playwright')
except:
    print('  NET Playwright')

print()
print('GOTO VY POLNENIE ZADACH')
