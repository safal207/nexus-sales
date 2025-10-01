#!/usr/bin/env python3
"""
ConsciousFunnels - Automated Testing Script
Проверяет основные функции платформы
"""

import requests
import time
import json
import sys

def test_frontend():
    """Test if frontend is running"""
    try:
        print("🧪 Testing frontend...")
        response = requests.get('http://localhost:3000', timeout=10)
        if response.status_code == 200:
            print("✅ Frontend is running on http://localhost:3000")
            return True
        else:
            print(f"❌ Frontend returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Frontend not accessible: {e}")
        return False

def test_api():
    """Test if API is running"""
    try:
        print("🧪 Testing API...")
        response = requests.get('http://localhost:3001/api/health', timeout=10)
        if response.status_code == 200:
            print("✅ API is running on http://localhost:3001")
            return True
        else:
            print(f"❌ API returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ API not accessible: {e}")
        return False

def test_auth_endpoints():
    """Test authentication endpoints"""
    print("🧪 Testing authentication endpoints...")

    # Test registration
    try:
        reg_data = {
            'email': f'test_{int(time.time())}@example.com',
            'password': 'testpassword123'
        }
        response = requests.post('http://localhost:3001/api/auth/register',
                               json=reg_data, timeout=10)
        if response.status_code == 201:
            print("✅ Registration endpoint works")
            return True
        else:
            print(f"❌ Registration failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Registration test failed: {e}")
        return False

def test_emotion_tracking():
    """Test emotion tracking endpoint"""
    print("🧪 Testing emotion tracking...")

    try:
        emotion_data = {
            'type': 'joy',
            'intensity': 0.8,
            'confidence': 0.9,
            'metadata': {'test': True}
        }
        response = requests.post('http://localhost:3001/api/emotions/track',
                               json=emotion_data, timeout=10)
        if response.status_code == 200:
            print("✅ Emotion tracking endpoint works")
            return True
        else:
            print(f"❌ Emotion tracking failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Emotion tracking test failed: {e}")
        return False

def test_analytics():
    """Test analytics endpoints"""
    print("🧪 Testing analytics endpoints...")

    try:
        response = requests.get('http://localhost:3001/api/analytics/insights', timeout=10)
        if response.status_code == 200:
            print("✅ Analytics insights endpoint works")
            return True
        else:
            print(f"❌ Analytics insights failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Analytics test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting ConsciousFunnels Testing Suite")
    print("=" * 50)

    tests = [
        test_frontend,
        test_api,
        test_auth_endpoints,
        test_emotion_tracking,
        test_analytics,
    ]

    results = []
    for test in tests:
        result = test()
        results.append(result)
        print()

    passed = sum(results)
    total = len(results)

    print("=" * 50)
    print(f"📊 Test Results: {passed}/{total} passed")

    if passed == total:
        print("🎉 All tests passed! ConsciousFunnels is ready!")
        return 0
    else:
        print("⚠️  Some tests failed. Check the issues above.")
        return 1

if __name__ == '__main__':
    sys.exit(main())
