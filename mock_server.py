#!/usr/bin/env python3
"""
🧪 MOCK СЕРВЕР ДЛЯ ТЕСТИРОВАНИЯ
Простой HTTP сервер для тестирования автотестов
"""

import http.server
import socketserver
import json
import threading
import time
import sys

class MockHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        """Обработка GET запросов"""
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(b'<html><body><h1>ConsciousFunnels Mock Server</h1></body></html>')

        elif self.path == '/login':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(b'<html><body><h1>Login Page</h1></body></html>')

        elif self.path == '/register':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(b'<html><body><h1>Register Page</h1></body></html>')

        elif self.path == '/auth/forgot-password':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(b'<html><body><h1>Forgot Password Page</h1></body></html>')

        elif self.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'ok', 'message': 'Mock server is healthy'}).encode())

        elif self.path == '/api/products':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'products': [{'id': 1, 'name': 'Test Product'}]}).encode())

        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Not found'}).encode())

    def do_POST(self):
        """Обработка POST запросов"""
        if self.path == '/api/auth/login':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True, 'message': 'Mock login successful'}).encode())

        elif self.path == '/api/auth/register':
            self.send_response(201)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True, 'message': 'Mock registration successful'}).encode())

        elif self.path == '/api/auth/forgot-password':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True, 'message': 'Mock password reset sent'}).encode())

        elif self.path == '/api/public/orders':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True, 'orderId': 'mock-123'}).encode())

        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Not found'}).encode())

    def log_message(self, format, *args):
        """Отключаем логи сервера"""
        pass

class MockServer:
    def __init__(self, port: int = 3000):
        self.port = port
        self.server = None
        self.thread = None

    def start(self):
        """Запустить mock сервер"""
        try:
            self.server = socketserver.TCPServer(("", self.port), MockHandler)
            self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
            self.thread.start()
            print(f"🧪 Mock сервер запущен на порту {self.port}")
            return True
        except Exception as e:
            print(f"❌ Ошибка запуска mock сервера: {e}")
            return False

    def stop(self):
        """Остановить mock сервер"""
        if self.server:
            print("🛑 Остановка mock сервера...")
            self.server.shutdown()
            self.server.server_close()
            self.server = None

def main():
    """Запуск mock сервера"""
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 3000

    print(f"🧪 ЗАПУСК MOCK СЕРВЕРА НА ПОРТУ {port}")
    print("Этот сервер имитирует работу ConsciousFunnels для тестирования")
    print("Нажмите Ctrl+C для остановки")
    print("=" * 50)

    server = MockServer(port)

    try:
        if server.start():
            # Держим сервер запущенным
            while True:
                time.sleep(1)
    except KeyboardInterrupt:
        print("\n⏹️  Остановка сервера...")
    finally:
        server.stop()

if __name__ == '__main__':
    main()
