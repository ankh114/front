#!/usr/bin/env python3
"""
启动本地HTTP服务器用于查看SLAM地图
使用方法: python server.py
然后在浏览器中打开 http://localhost:8080
"""
import http.server
import socketserver
import webbrowser
import os
import sys

if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

if __name__ == "__main__":
    os.chdir(DIRECTORY)
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print("=== SLAM Map Server ===")
        print(f"   URL: http://localhost:{PORT}")
        print(f"   Press Ctrl+C to stop")
        webbrowser.open(f"http://localhost:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped")
