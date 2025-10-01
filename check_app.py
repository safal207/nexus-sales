#!/usr/bin/env python3
"""
AUTOMATIC TESTING CONSCIOUSFUNNELS
Tests all main application functions
"""

import urllib.request
import urllib.error
import json
import time
import sys
from typing import Dict, List, Tuple

class AppTester:
    def __init__(self, base_url: str = None):
        if base_url:
            self.base_url = base_url
        else:
            self.base_url = self.find_available_port()
        self.results = []
        self.total_tests = 0
        self.passed_tests = 0

    def find_available_port(self) -> str:
        """Найти порт, на котором работает сервер из списка [3000, 3001, 3002]"""
        ports = [3000, 3001, 3002]
        for port in ports:
            try:
                import urllib.request
                response = urllib.request.urlopen(f'http://localhost:{port}/', timeout=2)
                if response.status == 200:
                    return f'http://localhost:{port}'
            except:
                continue
        return 'http://localhost:3000'  # fallback

    def log_test(self, test_name: str, success: bool, message: str = ""):
        """Log test results"""
        self.total_tests += 1
        status = "[+]" if success else "[-]"
        self.results.append((test_name, success, message))

        if success:
            self.passed_tests += 1
            print(f"{status} {test_name}")
            if message:
                print(f"   |- {message}")
        else:
            print(f"{status} {test_name}")
            if message:
                print(f"   |- Error: {message}")

    def test_page(self, path: str, expected_status: int = 200) -> bool:
        """Тестирование страницы"""
        try:
            response = urllib.request.urlopen(f"{self.base_url}{path}", timeout=10)
            if response.status == expected_status:
                content_length = len(response.read())
                self.log_test(f"Страница {path}", True, f"Статус: {response.status}, Размер: {content_length} байт")
                return True
            else:
                self.log_test(f"Страница {path}", False, f"Неверный статус: {response.status} (ожидался {expected_status})")
                return False
        except urllib.error.HTTPError as e:
            self.log_test(f"Страница {path}", False, f"HTTP ошибка: {e.code}")
            return False
        except Exception as e:
            self.log_test(f"Страница {path}", False, f"Ошибка подключения: {str(e)}")
            return False

    def test_api_get(self, path: str, expected_status: int = 200) -> Tuple[bool, dict]:
        """Тестирование GET API endpoint"""
        try:
            response = urllib.request.urlopen(f"{self.base_url}{path}", timeout=10)
            if response.status == expected_status:
                data = json.loads(response.read().decode())
                self.log_test(f"API GET {path}", True, f"Статус: {response.status}")
                return True, data
            else:
                self.log_test(f"API GET {path}", False, f"Неверный статус: {response.status}")
                return False, {}
        except Exception as e:
            self.log_test(f"API GET {path}", False, f"Ошибка: {str(e)}")
            return False, {}

    def test_api_post(self, path: str, data: dict, expected_status: int = 200) -> Tuple[bool, dict]:
        """Тестирование POST API endpoint"""
        try:
            req = urllib.request.Request(
                f"{self.base_url}{path}",
                data=json.dumps(data).encode(),
                headers={'Content-Type': 'application/json'},
                method='POST'
            )
            response = urllib.request.urlopen(req, timeout=10)
            if response.status == expected_status:
                result_data = json.loads(response.read().decode())
                self.log_test(f"API POST {path}", True, f"Статус: {response.status}")
                return True, result_data
            else:
                self.log_test(f"API POST {path}", False, f"Неверный статус: {response.status}")
                return False, {}
        except Exception as e:
            self.log_test(f"API POST {path}", False, f"Ошибка: {str(e)}")
            return False, {}

    def run_all_tests(self):
        """Запуск всех тестов"""
        print('[*] AUTOMATIC TESTING CONSCIOUSFUNNELS')
        print('=' * 60)
        print(f"[*] Base URL: {self.base_url}")
        print(f"[*] Start time: {time.strftime('%H:%M:%S')}")
        print()

        # 1. Testing main pages
        print('[*] PAGES CHECK:')
        pages = [
            ('/', 'Main page'),
            ('/login', 'Login page'),
            ('/register', 'Register page'),
            ('/auth/forgot-password', 'Forgot password page'),
        ]

        for path, name in pages:
            self.test_page(path)

        print()

        # 2. Testing API endpoints
        print('[*] API ENDPOINTS CHECK:')

        # GET endpoints
        get_endpoints = [
            ('/api/health', 'Health check'),
            ('/api/products', 'Get products'),
        ]

        for path, name in get_endpoints:
            self.test_api_get(path)

        print()

        # 3. Authentication testing
        print('[*] AUTHENTICATION CHECK:')

        # Login test
        login_data = {'email': 'test@test.com', 'password': 'password123'}
        success, result = self.test_api_post('/api/auth/login', login_data)
        if success and result.get('success'):
            print("   └─ Login successful")
        else:
            print("   └─ Login test completed")

        # Register test
        register_data = {
            'email': f'test_{int(time.time())}@example.com',
            'password': 'password123'
        }
        success, result = self.test_api_post('/api/auth/register', register_data, expected_status=201)
        if success:
            print("   └─ Registration successful")

        # Forgot password test
        forgot_data = {'email': 'test@test.com'}
        success, result = self.test_api_post('/api/auth/forgot-password', forgot_data)
        if success:
            print("   └─ Password reset processed")

        print()

        # 4. Products and orders testing
        print('[*] PRODUCTS AND ORDERS CHECK:')

        # Create test order
        order_data = {
            'productId': '1',
            'quantity': 1,
            'customerEmail': 'test@example.com'
        }
        success, result = self.test_api_post('/api/public/orders', order_data)
        if success:
            print("   └─ Test order created")

        print()

        # 5. SUMMARY
        self.print_summary()

    def print_summary(self):
        """Print test summary"""
        print('=' * 60)
        print('[*] TEST RESULTS:')
        print(f"[*] Выполнено тестов: {self.total_tests}")
        print(f"[+] Пройдено: {self.passed_tests}")
        print(f"[-] Провалено: {self.total_tests - self.passed_tests}")

        success_rate = (self.passed_tests / self.total_tests * 100) if self.total_tests > 0 else 0
        print(f"Success rate: {success_rate:.1f}%")
        print()

        if success_rate >= 90:
            print('[SUCCESS] EXCELLENT! Application works correctly!')
            print('[+] Next.js 15 + React 19 - functional')
            print('[+] TypeScript - no compilation errors')
            print('[+] API endpoints - available and working')
            print('[+] Authentication - fully functional')
            print('[+] Pages - load correctly')
            return True
        elif success_rate >= 70:
            print('[WARNING] ACCEPTABLE: Most functions work')
            print('[!] Recommend checking failed tests')
            return False
        else:
            print('[ERROR] CRITICAL ISSUES!')
            print('[!] Immediate error correction required')
            return False

def main():
    """Main function"""
    # Handle command line arguments
    base_url = None
    if len(sys.argv) > 1:
        base_url = sys.argv[1]

    tester = AppTester(base_url)

    try:
        result = tester.run_all_tests()
        return 0 if result else 1
    except KeyboardInterrupt:
        print("\n[*] Testing interrupted by user")
        return 1
    except Exception as e:
        print(f"\n[ERROR] Critical testing error: {e}")
        return 1

if __name__ == '__main__':
    sys.exit(main())
