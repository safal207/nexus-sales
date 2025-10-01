#!/usr/bin/env python3
"""
Simple Application Tester for NEXUS.SALES
Windows-compatible version without emoji
"""

import urllib.request
import urllib.error
import json
import time
import sys

class AppTester:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.results = []

    def test_page(self, path, method='GET', data=None, headers=None):
        """Test a web page or API endpoint"""
        url = f"{self.base_url}{path}"

        try:
            if headers is None:
                headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

            if data and method == 'POST':
                data = json.dumps(data).encode('utf-8')
                headers['Content-Type'] = 'application/json'

            req = urllib.request.Request(url, data=data, headers=headers, method=method)

            with urllib.request.urlopen(req, timeout=10) as response:
                content_length = len(response.read())
                # Accept 200 (OK) and 201 (Created) as success
                success = response.status in [200, 201]

                if success:
                    print(f"[PASS] {method} {path}: Status {response.status}, Size: {content_length} bytes")
                else:
                    print(f"[FAIL] {method} {path}: Status {response.status}")

                self.results.append({
                    'path': path,
                    'method': method,
                    'status': response.status,
                    'success': success,
                    'size': content_length
                })

                return success

        except urllib.error.HTTPError as e:
            print(f"[FAIL] {method} {path}: HTTP Error {e.code}")
            self.results.append({
                'path': path,
                'method': method,
                'status': e.code,
                'success': False,
                'error': f"HTTP {e.code}"
            })
            return False

        except Exception as e:
            print(f"[ERROR] {method} {path}: {str(e)}")
            self.results.append({
                'path': path,
                'method': method,
                'status': 0,
                'success': False,
                'error': str(e)
            })
            return False

    def run_tests(self):
        """Run comprehensive application tests"""
        print("=" * 60)
        print("NEXUS.SALES APPLICATION TESTING")
        print(f"Target: {self.base_url}")
        print("=" * 60)

        # Test basic pages
        print("\n[PAGES] Testing web pages...")
        self.test_page("/")
        self.test_page("/login")
        self.test_page("/register")
        self.test_page("/auth/forgot-password")

        # Test API endpoints
        print("\n[API] Testing API endpoints...")
        self.test_page("/api/health")

        # Test protected endpoint (401 is expected and correct)
        try:
            self.test_page("/api/products")
        except:
            pass
        # Check if products endpoint correctly returns 401 (security working)
        result = [r for r in self.results if r['path'] == '/api/products']
        if result and result[0]['status'] == 401:
            print("[SECURITY] /api/products correctly protected with 401 (GOOD!)")
            # Mark this as success since 401 is the expected behavior
            result[0]['success'] = True
            result[0]['expected_401'] = True

        # Test authentication
        print("\n[AUTH] Testing authentication...")

        # Test login
        login_data = {
            "email": "test@test.com",
            "password": "password123"
        }
        self.test_page("/api/auth/login", "POST", login_data)

        # Test registration
        register_data = {
            "email": f"test_{int(time.time())}@example.com",
            "password": "testpass123"
        }
        self.test_page("/api/auth/register", "POST", register_data)

        # Test password reset
        reset_data = {
            "email": "test@test.com"
        }
        self.test_page("/api/auth/forgot-password", "POST", reset_data)

        return self.print_summary()

    def print_summary(self):
        """Print test results summary"""
        total = len(self.results)
        passed = sum(1 for r in self.results if r['success'])
        failed = total - passed
        success_rate = (passed / total * 100) if total > 0 else 0

        print("\n" + "=" * 60)
        print("TEST RESULTS SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {success_rate:.1f}%")

        if success_rate >= 80:
            print("\nSTATUS: EXCELLENT - Application working well!")
        elif success_rate >= 60:
            print("\nSTATUS: GOOD - Some issues need attention")
        else:
            print("\nSTATUS: ATTENTION NEEDED - Multiple issues detected")

        print("\nFailed tests:")
        for result in self.results:
            if not result['success']:
                error_info = result.get('error', f"Status {result['status']}")
                print(f"  - {result['method']} {result['path']}: {error_info}")

        return {
            'total': total,
            'passed': passed,
            'failed': failed,
            'success_rate': success_rate
        }

def main():
    """Main test function"""
    tester = AppTester()

    try:
        results = tester.run_tests()

        # Return appropriate exit code
        if results['success_rate'] >= 80:
            return 0  # Success
        else:
            return 1  # Some issues

    except KeyboardInterrupt:
        print("\nTESTS INTERRUPTED")
        return 2
    except Exception as e:
        print(f"\nCRITICAL ERROR: {e}")
        return 3

if __name__ == "__main__":
    sys.exit(main())