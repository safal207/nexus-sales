#!/usr/bin/env python3
"""
🚀 ЗАПУСК И ТЕСТИРОВАНИЕ CONSCIOUSFUNNELS
Автоматически запускает сервер на доступном порту и тестирует его
"""

import subprocess
import sys
import time
import signal
import os
from typing import Optional

class ServerManager:
    def __init__(self):
        self.server_process: Optional[subprocess.Popen] = None
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

    def start_server(self) -> bool:
        """Запустить сервер на доступном порту"""
        print(f"🚀 Запуск сервера на порту {self.port}...")

        env = os.environ.copy()
        env['PORT'] = str(self.port)

        try:
            # Используем npm.cmd в Windows
            npm_cmd = 'npm.cmd' if sys.platform == 'win32' else 'npm'

            self.server_process = subprocess.Popen(
                [npm_cmd, 'run', 'dev'],
                cwd=os.getcwd(),
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform != 'win32' else 0
            )

            # Ждем запуска сервера
            print("⏳ Ожидание запуска сервера...")
            time.sleep(20)  # Увеличиваем время ожидания

            # Проверяем, что сервер запустился
            return self.check_server_health()

        except Exception as e:
            print(f"❌ Ошибка запуска сервера: {e}")
            return False

    def check_server_health(self) -> bool:
        """Проверить, что сервер отвечает"""
        try:
            import urllib.request
            response = urllib.request.urlopen(f'http://localhost:{self.port}/', timeout=5)
            if response.status == 200:
                print(f"✅ Сервер успешно запущен на http://localhost:{self.port}")
                return True
            else:
                print(f"❌ Сервер вернул статус {response.status}")
                return False
        except Exception as e:
            print(f"❌ Сервер не отвечает: {e}")
            return False

    def stop_server(self):
        """Остановить сервер"""
        if self.server_process:
            print("🛑 Остановка сервера...")
            try:
                if sys.platform == 'win32':
                    self.server_process.terminate()
                    time.sleep(2)
                    if self.server_process.poll() is None:
                        self.server_process.kill()
                else:
                    os.killpg(os.getpgid(self.server_process.pid), signal.SIGTERM)
                    time.sleep(2)
                    if self.server_process.poll() is None:
                        os.killpg(os.getpgid(self.server_process.pid), signal.SIGKILL)
            except Exception as e:
                print(f"⚠️  Ошибка при остановке сервера: {e}")

            self.server_process = None

    def run_tests(self):
        """Запустить тесты"""
        print(f"🧪 Запуск тестов на порту {self.port}...")

        # Устанавливаем переменную окружения для тестов
        os.environ['TEST_PORT'] = str(self.port)

        try:
            result = subprocess.run([
                sys.executable, 'check_app.py'
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
    print('🚀 ЗАПУСК И ТЕСТИРОВАНИЕ CONSCIOUSFUNNELS')
    print('=' * 60)

    manager = ServerManager()

    try:
        # Запускаем сервер
        if not manager.start_server():
            print("💥 Не удалось запустить сервер")
            return 1

        # Запускаем тесты
        test_success = manager.run_tests()

        if test_success:
            print("🎉 Все тесты пройдены успешно!")
            return 0
        else:
            print("⚠️  Некоторые тесты провалились")
            return 1

    except KeyboardInterrupt:
        print("\n⏹️  Прервано пользователем")
        return 1
    except Exception as e:
        print(f"💥 Критическая ошибка: {e}")
        return 1
    finally:
        manager.stop_server()

if __name__ == '__main__':
    sys.exit(main())
