import os
import json
from twikit import Client

class SessionManager:
    def __init__(self, cookies_dir="cookies"):
        self.cookies_dir = cookies_dir
        self.clients = {}

    def get_client(self, username):
        # Eğer client zaten hafızadaysa onu döndür
        if username in self.clients:
            return self.clients[username]
        
        # Yoksa dosyadan yükle
        cookie_path = os.path.join(self.cookies_dir, f"{username}.json")
        if not os.path.exists(cookie_path):
            raise Exception(f"@{username} oturumu bulunamadı. Lütfen önce giriş yapın.")

        client = Client('en-US')
        client.load_cookies(cookie_path)
        self.clients[username] = client
        print(f"✅ DOSYA BULUNDU: {cookie_path}. Hafızaya alınıyor...")
        return client

# Global instance
sessions = SessionManager()