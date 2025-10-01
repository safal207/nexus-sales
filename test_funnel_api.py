#!/usr/bin/env python3
import urllib.request
import json

print('🧪 Тестирование API Funnel Builder...')

# Test templates endpoint
try:
    response = urllib.request.urlopen('http://localhost:3000/api/templates', timeout=5)
    templates = json.loads(response.read().decode())
    print(f'✅ Templates API: {len(templates.get("templates", []))} шаблонов')
except Exception as e:
    print(f'❌ Templates API: {e}')

# Test funnels endpoint
try:
    response = urllib.request.urlopen('http://localhost:3000/api/funnels', timeout=5)
    funnels = json.loads(response.read().decode())
    print(f'✅ Funnels API: {len(funnels.get("funnels", []))} воронок')
except Exception as e:
    print(f'❌ Funnels API: {e}')

print('🎯 API тестирование завершено')
