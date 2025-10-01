#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Simple Application Tester for NEXUS.SALES
Tests basic functionality without Unicode issues
"""

import urllib.request
import urllib.error
import json
import time
import sys

class SimpleAppTester:
    def __init__(self, base_url: str = "http://localhost:3000"):
        self.base_url = base_url
        self.results = []

    def test_page(self, path: str, method: str = 'GET', data=None, headers=None) -> bool:
        """Test a web page or API endpoint"""
        url = f"{self.base_url}{path}"

        try:
            if headers is None:
                headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

            if data and method == 'POST':
                data = json.dumps(data).encode('utf-8')
                headers['Content-Type'] = 'application/json'

            req = urllib.request.Request(url, data=data, headers=headers, method=method)

            with urllib.request.urlopen(req, timeout=10) as response:
                content_length = len(response.read())
                success = response.status == 200

                if success:
                    print(f"✅ {method} {path}: Status {response.status}, Size: {content_length} bytes")
                else:
                    print(f"❌ {method} {path}: Status {response.status}")

                self.results.append({
                    'path': path,
                    'method': method,
                    'status': response.status,
                    'success': success,
                    'size': content_length
                })

                return success

        except urllib.error.HTTPError as e:
            print(f"❌ {method} {path}: HTTP Error {e.code}")
            self.results.append({
                'path': path,
                'method': method,
                'status': e.code,
                'success': False,
                'error': f"HTTP {e.code}"
            })
            return False

        except Exception as e:
            print(f"❌ {method} {path}: Connection Error - {str(e)}")
            self.results.append({
                'path': path,
                'method': method,
                'status': 0,
                'success': False,
                'error': str(e)
            })
            return False

    def run_basic_tests(self) -> dict:
        """Run basic application tests"""
        print("🚀 Starting NEXUS.SALES Application Tests")
        print(f"📍 Testing: {self.base_url}")
        print("-" * 50)

        # Test basic pages
        print("\n📄 Testing Pages:")
        self.test_page("/")  # Home page
        self.test_page("/login")  # Login page
        self.test_page("/register")  # Register page
        self.test_page("/auth/forgot-password")  # Forgot password

        # Test API endpoints
        print("\n🔌 Testing API Endpoints:")
        self.test_page("/api/health")  # Health check
        self.test_page("/api/products")  # Products (should be 401)

        # Test authentication
        print("\n🔐 Testing Authentication:")
        login_data = {
            "email": "test@test.com",
            "password": "password123"
        }
        self.test_page("/api/auth/login", "POST", login_data)

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

        return self.get_summary()

    def get_summary(self) -> dict:
        """Get test results summary"""
        total = len(self.results)
        passed = sum(1 for r in self.results if r['success'])
        failed = total - passed
        success_rate = (passed / total * 100) if total > 0 else 0

        summary = {
            'total': total,
            'passed': passed,
            'failed': failed,
            'success_rate': success_rate
        }

        print("\n" + "=" * 50)
        print("📊 TEST RESULTS SUMMARY:")
        print(f"📈 Total Tests: {total}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📊 Success Rate: {success_rate:.1f}%")

        if success_rate >= 80:
            print("🎉 EXCELLENT! Application is working well!")
        elif success_rate >= 60:
            print("⚠️  GOOD! Some issues need attention.")
        else:
            print("🚨 ATTENTION! Multiple issues detected.")

        return summary

def main():
    """Main test function"""
    tester = SimpleAppTester()

    try:
        results = tester.run_basic_tests()

        # Return appropriate exit code
        if results['success_rate'] >= 80:
            return 0  # Success
        else:
            return 1  # Failure

    except KeyboardInterrupt:
        print("\n🛑 Tests interrupted by user")
        return 2
    except Exception as e:
        print(f"\n💥 Critical testing error: {e}")
        return 3

if __name__ == "__main__":
    sys.exit(main())