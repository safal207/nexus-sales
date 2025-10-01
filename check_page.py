#!/usr/bin/env python3
import urllib.request
import time

print('Проверяем доступность сервера...')
for i in range(5):
    try:
        response = urllib.request.urlopen('http://localhost:3000/', timeout=3)
        print(f'✅ Сервер отвечает: {response.status}')

        # Получаем HTML
        html = response.read().decode('utf-8', errors='ignore')

        # Ищем ключевые элементы
        if 'Создать аккаунт' in html:
            print('✅ Найден текст "Создать аккаунт"')
        else:
            print('❌ НЕТ текста "Создать аккаунт"')

        if 'Войти' in html:
            print('✅ Найден текст "Войти"')
        else:
            print('❌ НЕТ текста "Войти"')

        if '🚀' in html:
            print('✅ Найдена ракета 🚀')
        else:
            print('❌ НЕТ ракеты 🚀')

        # Показать первые 500 символов для диагностики
        print(f'Первые 500 символов: {html[:500]}...')
        break
    except Exception as e:
        print(f'❌ Попытка {i+1}: {e}')
        time.sleep(2)
else:
    print('💥 Сервер не отвечает после 5 попыток')
