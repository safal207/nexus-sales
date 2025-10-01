#!/usr/bin/env python3
"""
🧪 ТЕСТИРОВАНИЕ С MOCK СЕРВЕРОМ
Запускает mock сервер на доступном порту и тестирует его
"""

import subprocess
import sys
import time
import signal
import os
from typing import Optional

class MockTester:
    def __init__(self):
        self.mock_process: Optional[subprocess.Popen] = None
        self.port = self.find_available_port()

    def find_available_port(self) -> int:
        """Найти доступный порт из списка [3000, 3001, 3002]"""
        import socket
        ports = [3000, 3001, 3002]

        for port in ports:
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(1)
                result = sock.connect_ex(('127.0.0.1', port))
                sock.close()
                if result != 0:  # Порт свободен
                    return port
            except:
                continue

        return 3000  # fallback

    def start_mock_server(self) -> bool:
        """Запустить mock сервер на доступном порту"""
        print(f"🧪 Запуск mock сервера на порту {self.port}...")

        try:
            self.mock_process = subprocess.Popen(
                [sys.executable, 'mock_server.py', str(self.port)],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform != 'win32' else 0
            )

            # Ждем запуска сервера
            print("⏳ Ожидание запуска mock сервера...")
            time.sleep(3)

            # Проверяем, что сервер запустился
            return self.check_mock_health()

        except Exception as e:
            print(f"❌ Ошибка запуска mock сервера: {e}")
            return False

    def check_mock_health(self) -> bool:
        """Проверить, что mock сервер отвечает"""
        try:
            import urllib.request
            response = urllib.request.urlopen(f'http://localhost:{self.port}/', timeout=5)
            if response.status == 200:
                print(f"✅ Mock сервер успешно запущен на http://localhost:{self.port}")
                return True
            else:
                print(f"❌ Mock сервер вернул статус {response.status}")
                return False
        except Exception as e:
            print(f"❌ Mock сервер не отвечает: {e}")
            return False

    def stop_mock_server(self):
        """Остановить mock сервер"""
        if self.mock_process:
            print("🛑 Остановка mock сервера...")
            try:
                if sys.platform == 'win32':
                    self.mock_process.terminate()
                    time.sleep(1)
                    if self.mock_process.poll() is None:
                        self.mock_process.kill()
                else:
                    os.killpg(os.getpgid(self.mock_process.pid), signal.SIGTERM)
                    time.sleep(1)
                    if self.mock_process.poll() is None:
                        os.killpg(os.getpgid(self.mock_process.pid), signal.SIGKILL)
            except Exception as e:
                print(f"⚠️  Ошибка при остановке mock сервера: {e}")

            self.mock_process = None

    def run_tests(self):
        """Запустить тесты на mock сервере"""
        print(f"🧪 Запуск автотестов на порту {self.port}...")

        # Устанавливаем переменную окружения для тестов
        os.environ['TEST_PORT'] = str(self.port)

        try:
            result = subprocess.run([
                sys.executable, 'check_app.py', f'http://localhost:{self.port}'
            ], capture_output=True, text=True, timeout=60)

            print("📝 РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ:")
            print(result.stdout)

            if result.stderr:
                print("⚠️  ОШИБКИ:")
                print(result.stderr)

            return result.returncode == 0

        except subprocess.TimeoutExpired:
            print("⏰ Тестирование превысило время ожидания")
            return False
        except Exception as e:
            print(f"💥 Ошибка тестирования: {e}")
            return False

def main():
    """Главная функция"""
    print('🧪 ТЕСТИРОВАНИЕ С MOCK СЕРВЕРОМ')
    print('=' * 50)
    print('Этот тест показывает работу системы автотестирования')
    print('с использованием mock сервера вместо реального приложения.')
    print()

    tester = MockTester()

    try:
        # Запускаем mock сервер
        if not tester.start_mock_server():
            print("💥 Не удалось запустить mock сервер")
            return 1

        # Запускаем тесты
        test_success = tester.run_tests()

        if test_success:
            print("🎉 Все тесты пройдены успешно!")
            print("✅ Система автотестирования работает корректно!")
            return 0
        else:
            print("⚠️  Некоторые тесты провалились")
            print("🔧 Проверьте логику тестирования")
            return 1

    except KeyboardInterrupt:
        print("\n⏹️  Прервано пользователем")
        return 1
    except Exception as e:
        print(f"💥 Критическая ошибка: {e}")
        return 1
    finally:
        tester.stop_mock_server()

if __name__ == '__main__':
    sys.exit(main())
