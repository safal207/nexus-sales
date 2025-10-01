#!/usr/bin/env python3
"""
🚀 ЗАПУСК ВСЕХ ТЕСТОВ CONSCIOUSFUNNELS
Запускает полный набор автотестов
"""

import subprocess
import sys
import time
import os

def run_test(script_name: str, description: str) -> bool:
    """Запуск одного тестового скрипта"""
    print(f"\n{'='*60}")
    print(f"🧪 ЗАПУСК: {description}")
    print(f"📄 Скрипт: {script_name}")
    print('=' * 60)

    try:
        start_time = time.time()
        result = subprocess.run([sys.executable, script_name],
                              capture_output=True, text=True, timeout=300)

        execution_time = time.time() - start_time

        print(f"⏱️  Время выполнения: {execution_time:.1f} сек")
        print(f"📊 Код выхода: {result.returncode}")

        if result.stdout:
            print("\n📝 ВЫВОД:")
            print(result.stdout)

        if result.stderr:
            print("\n⚠️  ОШИБКИ:")
            print(result.stderr)

        success = result.returncode == 0
        status = "✅ ПРОЙДЕН" if success else "❌ ПРОВАЛЕН"
        print(f"\n{status}: {description}")

        return success

    except subprocess.TimeoutExpired:
        print("⏰ ВРЕМЯ ВЫШЛО: Тест выполнялся слишком долго")
        return False
    except Exception as e:
        print(f"💥 ОШИБКА ЗАПУСКА: {e}")
        return False

def main():
    """Главная функция"""
    print('🚀 ЗАПУСК ПОЛНОГО НАБОРА ТЕСТОВ CONSCIOUSFUNNELS')
    print('=' * 60)
    print(f"🕐 Начало тестирования: {time.strftime('%H:%M:%S %d.%m.%Y')}")
    print(f"📍 Рабочая директория: {os.getcwd()}")

    # Список тестов для запуска
    tests = [
        ('check_app.py', 'Основные проверки приложения'),
        ('monitor_app.py', 'Одноразовая проверка состояния', ['--single']),
    ]

    results = []
    total_start = time.time()

    for script_name, description, *args in tests:
        if not os.path.exists(script_name):
            print(f"❌ Скрипт не найден: {script_name}")
            results.append(False)
            continue

        extra_args = args[0] if args else []
        success = run_test(script_name, description)
        results.append(success)

    # ИТОГИ
    total_time = time.time() - total_start
    passed = sum(results)
    total = len(results)

    print(f"\n{'='*60}")
    print('🎯 ИТОГИ ВСЕХ ТЕСТОВ:')
    print(f"📊 Выполнено тестов: {total}")
    print(f"✅ Пройдено: {passed}")
    print(f"❌ Провалено: {total - passed}")
    print(".1f"    print(f"⏱️  Общее время: {total_time:.1f} сек")

    if passed == total:
        print('\n🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ! Приложение готово к работе!')
        return 0
    elif passed >= total * 0.8:
        print('\n⚠️  БОЛЬШИНСТВО ТЕСТОВ ПРОЙДЕНО. Есть небольшие проблемы.')
        return 0
    else:
        print('\n💥 КРИТИЧЕСКИЕ ПРОБЛЕМЫ! Требуется исправление ошибок.')
        return 1

if __name__ == '__main__':
    sys.exit(main())
