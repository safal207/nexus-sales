#!/usr/bin/env python3
"""
MONITORING CONSCIOUSFUNNELS
Непрерывная проверка состояния приложения
"""

import urllib.request
import urllib.error
import json
import time
import sys
import argparse
from datetime import datetime

class AppMonitor:
    def __init__(self, base_url: str = 'http://localhost:3000', interval: int = 30):
        self.base_url = base_url
        self.interval = interval
        self.last_status = {}
        self.start_time = datetime.now()

    def check_endpoint(self, path: str, method: str = 'GET', data: dict = None) -> dict:
        """Проверка одного endpoint"""
        try:
            if method == 'POST' and data:
                req = urllib.request.Request(
                    f"{self.base_url}{path}",
                    data=json.dumps(data).encode(),
                    headers={'Content-Type': 'application/json'},
                    method='POST'
                )
                response = urllib.request.urlopen(req, timeout=5)
            else:
                response = urllib.request.urlopen(f"{self.base_url}{path}", timeout=5)

            return {
                'status': 'ok',
                'http_code': response.status,
                'response_time': 0,  # Можно добавить измерение времени
                'message': f"HTTP {response.status}"
            }
        except urllib.error.HTTPError as e:
            return {
                'status': 'error',
                'http_code': e.code,
                'message': f"HTTP Error: {e.code}"
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': f"Connection Error: {str(e)}"
            }

    def check_all_endpoints(self) -> dict:
        """Проверка всех критических endpoints"""
        results = {}

        # Основные страницы
        pages = ['/', '/login', '/register', '/auth/forgot-password']
        for page in pages:
            results[f"page{page}"] = self.check_endpoint(page)

        # API endpoints
        api_endpoints = [
            '/api/health',
            '/api/products',
        ]
        for api in api_endpoints:
            results[f"api{api.replace('/', '_')}"] = self.check_endpoint(api)

        # Аутентификация
        login_data = {'email': 'test@test.com', 'password': 'password123'}
        results['api_auth_login'] = self.check_endpoint('/api/auth/login', 'POST', login_data)

        return results

    def format_status_line(self, name: str, status: dict) -> str:
        """Форматирование строки статуса"""
        if status['status'] == 'ok':
            return f"✅ {name}: {status['message']}"
        else:
            return f"❌ {name}: {status['message']}"

    def run_continuous_monitoring(self):
        """Непрерывный мониторинг"""
        print('[*] МОНИТОРИНГ CONSCIOUSFUNNELS')
        print(f"[*] URL: {self.base_url}")
        print(f"[*] Интервал: {self.interval} сек")
        print(f"[*] Начало: {self.start_time.strftime('%H:%M:%S')}")
        print('=' * 60)

        cycle_count = 0
        errors_total = 0

        try:
            while True:
                cycle_count += 1
                cycle_start = datetime.now()

                print(f"\n🔄 Цикл #{cycle_count} - {cycle_start.strftime('%H:%M:%S')}")

                results = self.check_all_endpoints()
                errors_cycle = 0

                # Вывод результатов
                for name, status in results.items():
                    print(self.format_status_line(name, status))
                    if status['status'] != 'ok':
                        errors_cycle += 1

                errors_total += errors_cycle

                # Статистика цикла
                cycle_time = (datetime.now() - cycle_start).total_seconds()
                print(f"⏱️  Время цикла: {cycle_time:.1f} сек")
                print(f"❌ Ошибок в цикле: {errors_cycle}")
                print(f"📊 Всего ошибок: {errors_total}")

                # Ожидание следующего цикла
                time.sleep(self.interval)

        except KeyboardInterrupt:
            print(f"\n[*] Мониторинг остановлен пользователем")
            self.print_final_stats(cycle_count, errors_total)

    def run_single_check(self):
        """Одноразовая проверка"""
        print('[*] SINGLE CHECK CONSCIOUSFUNNELS')
        print(f"[*] URL: {self.base_url}")
        print(f"[*] Время: {datetime.now().strftime('%H:%M:%S')}")
        print('=' * 60)

        results = self.check_all_endpoints()
        errors = 0

        for name, status in results.items():
            print(self.format_status_line(name, status))
            if status['status'] != 'ok':
                errors += 1

        print('=' * 60)
        if errors == 0:
            print('🎉 Все проверки пройдены успешно!')
            return True
        else:
            print(f'⚠️  Обнаружено ошибок: {errors}')
            return False

    def print_final_stats(self, cycles: int, errors: int):
        """Вывод финальной статистики"""
        runtime = datetime.now() - self.start_time
        print('=' * 60)
        print('📊 ФИНАЛЬНАЯ СТАТИСТИКА:')
        print(f"🔄 Выполнено циклов: {cycles}")
        print(f"❌ Всего ошибок: {errors}")
        print(f"⏱️  Время работы: {runtime}")
        if cycles > 0:
            print(f"📈 Среднее время цикла: {runtime.total_seconds() / cycles:.2f} сек")

        if errors == 0:
            print('🎉 Отличный результат - без ошибок!')
        else:
            print('⚠️  Были зафиксированы ошибки')

def main():
    parser = argparse.ArgumentParser(description='Мониторинг ConsciousFunnels')
    parser.add_argument('--url', default='http://localhost:3000', help='Базовый URL приложения')
    parser.add_argument('--interval', type=int, default=30, help='Интервал проверки в секундах')
    parser.add_argument('--single', action='store_true', help='Одноразовая проверка вместо непрерывного мониторинга')

    args = parser.parse_args()

    monitor = AppMonitor(args.url, args.interval)

    try:
        if args.single:
            result = monitor.run_single_check()
            sys.exit(0 if result else 1)
        else:
            monitor.run_continuous_monitoring()
    except Exception as e:
        print(f"[ERROR] Critical error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
