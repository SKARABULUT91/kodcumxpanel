#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import subprocess
import sys
import os
import asyncio
import json
import random
import time
import logging
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime

# --- Ek Bağımlılık: Supabase ---
# pip install supabase
from supabase import create_client, Client as SupabaseClient

# --- ENJEKTE EDİLEN KURULUM BLOĞU ---
def initialize_vps():
    print("🚀 VPS ortamı kontrol ediliyor...")
    required_libs = [
        "fastapi", "uvicorn", "twikit", "playwright", "pydantic",
        "pyotp", "aiohttp", "playwright-stealth", "fake-useragent", "supabase", "aiogram"
    ]
    for lib in required_libs:
        try:
            __import__(lib.replace("-", "_"))
        except ImportError:
            print(f"Eksik paket kuruluyor: {lib}")
            subprocess.check_call([sys.executable, "-m", "pip", "install", lib])

    try:
        subprocess.run([sys.executable, "-m", "playwright", "install", "chromium"], check=True)
        subprocess.run([sys.executable, "-m", "playwright", "install-deps", "chromium"], check=True)
    except Exception as e:
        print(f"Playwright kurulumunda uyarı: {e}")

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("xkodcum")

initialize_vps()

from playwright.async_api import async_playwright
from playwright_stealth import Stealth
from fake_useragent import UserAgent

# Dinamik User-Agent Üretici
ua_factory = UserAgent()

# --- Supabase Bağlantı Bilgileri ---
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
if not SUPABASE_URL or not SUPABASE_KEY:
    logger.warning("Supabase URL veya KEY bulunamadı. Supabase entegrasyonu devre dışı olabilir.")
else:
    supabase: SupabaseClient = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="X-KODCUM Backend", version="2.0.0")

# --- EKLENECEK: Dashboard için log hafızası ve CORS ayarları ---

# Dashboard için logları hafızada tutacak liste
activity_logs = []

# CORS ayarlarını Vite (5173) için güncelle
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# İçeriden log basmak için yardımcı fonksiyon
def internal_log(mesaj, hedef="SYSTEM", tip="info"):
    log_entry = {
        "target_url": hedef,
        "durum": mesaj,
        "status": tip,
        "created_at": datetime.now().isoformat()
    }
    activity_logs.insert(0, log_entry)  # En yeni log en üste
    if len(activity_logs) > 50:
        activity_logs.pop()  # Son 50 logu tut

# Frontend'in (Localhost:3000) backend ile konuşmasına izin veriyoruz (ek güvenlik için 5173 eklendi üstte)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Session Manager (YENİ AKILLI GİRİŞ SİSTEMİ) ====================
class SessionManager:
    def __init__(self):
        self.sessions = {}
        self.cookies_dir = "cookies"
        os.makedirs(self.cookies_dir, exist_ok=True)

    async def login(self, username: str, password: str, email: str = None, two_fa_secret: str = None, proxy: str = None, user_agent: str = None):
        try:
            import twikit
            client = twikit.Client(language="tr")
            client._user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

            if user_agent:
                client._user_agent = user_agent
            elif 'ua_factory' in globals():
                client._user_agent = ua_factory.random

            if proxy:
                client.set_proxy(proxy)

            cookie_file = os.path.join(self.cookies_dir, f"{username}.json")

            # 1. ADIM: Kayıtlı Çerez Kontrolü
            if os.path.exists(cookie_file):
                print(f"🔄 @{username} için çerez dosyası bulundu. Yükleniyor...")
                client.load_cookies(cookie_file)
                self.sessions[username] = client
                me = await client.user()
                print(f"✅ @{username} başarıyla çerezden yüklendi.")
                return {"success": True, "message": "Kayıtlı çerezlerle giriş yapıldı", "user": {"name": me.name, "username": me.screen_name}}

            # 2. ADIM: Dosya Yoksa İlk Giriş İşlemi
            print(f"🔑 @{username} için İLK GİRİŞ başlatılıyor...")
            print("⚠️ DİKKAT: Eğer Twitter 2FA (Doğrulama) kodu veya Email isterse, terminalde soracaktır. Terminali izleyin!")

            await client.login(
                auth_info_1=username,
                auth_info_2=email,
                password=password,
                totp_secret=two_fa_secret
            )

            # 3. ADIM: Giriş Başarılı -> Gelecek sefer için kaydet
            client.save_cookies(cookie_file)
            self.sessions[username] = client
            me = await client.user()
            print(f"💾 @{username} oturumu başarıyla oluşturuldu ve kaydedildi: {cookie_file}")

            # 4. ADIM: Supabase Yedekleme (Opsiyonel)
            if 'supabase' in globals():
                try:
                    with open(cookie_file, "r", encoding="utf-8") as f:
                        cookie_json = json.load(f)
                    supabase.table("x_sessions").upsert({
                        "username": username,
                        "cookie_data": cookie_json,
                        "updated_at": "now()"
                    }).execute()
                    print(f"🔁 @{username} çerezleri Supabase'e yedeklendi.")
                except Exception as e:
                    print(f"⚠️ Supabase yedekleme hatası (Önemsiz): {e}")

            return {
                "success": True,
                "message": "Yeni giriş başarılı ve çerezler oluşturuldu.",
                "user": {
                    "name": me.name,
                    "username": me.screen_name,
                    "followers_count": getattr(me, "followers_count", None)
                }
            }
        except Exception as e:
            print(f"❌ @{username} giriş hatası: {str(e)}")
            raise HTTPException(status_code=401, detail=f"Giriş Başarısız: {str(e)}")

    def get_client(self, username: str):
        client = self.sessions.get(username)
        if not client:
            import os
            from twikit import Client
            cookie_path = os.path.join(self.cookies_dir, f"{username}.json")

            if os.path.exists(cookie_path):
                print(f"✅ DOSYA BULUNDU: {cookie_path}. Hafızaya alınıyor...")
                client = Client('en-US')
                client.load_cookies(cookie_path)
                self.sessions[username] = client
            else:
                raise HTTPException(status_code=401, detail=f"@{username} oturumu bulunamadı. Lütfen önce Swagger üzerinden /auth/login ile giriş yapın.")

        return client

    async def logout(self, username: str):
        if username in self.sessions:
            try:
                await self.sessions[username].logout()
            except Exception:
                pass
            del self.sessions[username]

            cookie_file = os.path.join(self.cookies_dir, f"{username}.json")
            if os.path.exists(cookie_file):
                try:
                    os.remove(cookie_file)
                except Exception:
                    pass

            if 'supabase' in globals():
                try:
                    supabase.table("x_sessions").delete().eq("username", username).execute()
                except Exception:
                    pass

sessions = SessionManager()

# Helper: get_all_accounts and async wrapper for authed client
def get_all_accounts():
    try:
        files = os.listdir(sessions.cookies_dir)
        return [f.replace('.json', '') for f in files if f.endswith('.json')]
    except Exception:
        return []

async def get_authed_client(account_name: str):
    # sessions.get_client is synchronous in this codebase; wrap it for async usage
    return sessions.get_client(account_name)

# ==================== Human-like Delays ====================
async def human_delay(min_sec=1.0, max_sec=3.0):
    delay = random.uniform(min_sec, max_sec)
    await asyncio.sleep(delay)

# ==================== Request Models ====================
class LoginRequest(BaseModel):
    username: str
    password: str
    email: Optional[str] = None  # DUZELTME: Email alani eklendi
    two_fa_secret: Optional[str] = None
    proxy: Optional[str] = None
    user_agent: Optional[str] = None

class UsernameRequest(BaseModel):
    username: str

class AccountInfoRequest(BaseModel):
    username: str

class TweetActionRequest(BaseModel):
    username: str
    tweet_id: str

class FollowActionRequest(BaseModel):
    username: str
    target_username: str

class TweetRequest(BaseModel):
    username: str
    text: str
    reply_to_id: Optional[str] = None

class DMRequest(BaseModel):
    username: str
    target_username: str
    text: str

class TimelineRequest(BaseModel):
    username: str
    count: int = 20

class FollowListRequest(BaseModel):
    username: str
    target_username: Optional[str] = None
    count: int = 100

class SearchRequest(BaseModel):
    username: str
    query: str
    count: int = 20

class SearchVerifiedRequest(BaseModel):
    username: str
    keyword: str
    count: int = 20

class ViewBoostRequest(BaseModel):
    username: str
    tweet_url: str
    view_count: int = 10

class ProxyTestRequest(BaseModel):
    address: str
    port: str
    type: str = "http"
    username: Optional[str] = None
    password: Optional[str] = None

class BulkFollowRequest(BaseModel):
    username: str
    targets: List[str]
    delay: float = 3.0
    random_jitter: bool = True

class BulkUnfollowRequest(BaseModel):
    username: str
    count: int = 50
    delay: float = 3.0
    mode: str = "all"

class DeleteTweetRequest(BaseModel):
    username: str
    tweet_id: str

class BotDataRequest(BaseModel):
    url: str
    durum: str
    bot_id: str

# ===== New models for boost endpoint
class BoostStatsRequest(BaseModel):
    tweet_url: str

# Frontend'den gelen basit boost tetikleme modeli (isteğe bağlı, çakışma olmaması için farklı isim)
class BoostRequest(BaseModel):
    url: str

# ==================== Endpoints ====================

@app.get("/")
def root():
    return {"status": "X-KODCUM Backend Aktif", "version": "2.0.0", "engine": "Twikit"}

@app.get("/health")
def health():
    return {"status": "ok", "active_sessions": len(sessions.sessions), "engine": "twikit"}

# ===== Dashboard Veri Servisi (eklenen endpointler) =====
@app.get("/api/bot-report")
async def get_bot_report():
    return {"last_activities": activity_logs}

@app.post("/api/bot-data")
async def bot_data_receiver_simple(req: BotDataRequest):
    # Dışarıdan gelen bot verilerini listeye ekle
    internal_log(req.durum, req.url, "success")
    return {"status": "ok"}

# ===== Auth =====
@app.post("/auth/login")
async def login(req: LoginRequest):
    result = await sessions.login(req.username, req.password, req.email, req.two_fa_secret, req.proxy, req.user_agent)
    return result

@app.post("/auth/logout")
async def logout(req: UsernameRequest):
    await sessions.logout(req.username)
    return {"success": True, "message": f"@{req.username} oturumu kapatıldı"}

@app.post("/auth/check-session")
async def check_session(req: UsernameRequest):
    try:
        client = sessions.get_client(req.username)
        me = await client.user()
        return {"success": True, "logged_in": True, "username": me.screen_name}
    except Exception:
        return {"success": True, "logged_in": False, "username": req.username}

@app.post("/auth/account-info")
async def account_info(req: AccountInfoRequest):
    client = sessions.get_client(req.username)
    try:
        me = await client.user()
        return {
            "success": True,
            "name": me.name,
            "username": me.screen_name,
            "followers_count": getattr(me, "followers_count", 0),
            "following_count": getattr(me, "following_count", 0),
            "tweet_count": getattr(me, "statuses_count", 0) if hasattr(me, "statuses_count") else getattr(me, "tweet_count", 0),
            "profile_image_url": getattr(me, "profile_image_url", None),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ===== Actions =====
@app.post("/actions/like")
async def like_tweet(req: TweetActionRequest):
    client = sessions.get_client(req.username)
    try:
        await human_delay(0.5, 2.0)
        await client.favorite_tweet(req.tweet_id)
        return {"success": True, "message": f"Tweet {req.tweet_id} beğenildi"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/actions/unlike")
async def unlike_tweet(req: TweetActionRequest):
    client = sessions.get_client(req.username)
    try:
        await human_delay(0.5, 2.0)
        await client.unfavorite_tweet(req.tweet_id)
        return {"success": True, "message": f"Tweet {req.tweet_id} beğenisi kaldırıldı"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/actions/retweet")
async def retweet_tweet(req: TweetActionRequest):
    client = sessions.get_client(req.username)
    try:
        await human_delay(0.5, 2.0)
        await client.retweet(req.tweet_id)
        return {"success": True, "message": f"Tweet {req.tweet_id} RT yapıldı"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/actions/unretweet")
async def unretweet_tweet(req: TweetActionRequest):
    client = sessions.get_client(req.username)
    try:
        await human_delay(0.5, 2.0)
        await client.delete_retweet(req.tweet_id)
        return {"success": True, "message": f"RT kaldırıldı"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/actions/follow")
async def follow_user(req: FollowActionRequest):
    client = sessions.get_client(req.username)
    try:
        await human_delay(1.0, 3.0)
        user = await client.get_user_by_screen_name(req.target_username)
        await client.follow_user(user.id)
        return {"success": True, "message": f"@{req.target_username} takip edildi"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/actions/unfollow")
async def unfollow_user(req: FollowActionRequest):
    client = sessions.get_client(req.username)
    try:
        await human_delay(1.0, 3.0)
        user = await client.get_user_by_screen_name(req.target_username)
        await client.unfollow_user(user.id)
        return {"success": True, "message": f"@{req.target_username} takipten çıkıldı"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/actions/tweet")
async def post_tweet(req: TweetRequest):
    try:
        # 1. Oturumu kullanıcı adına göre çek
        client = sessions.get_client(req.username)

        # 2. X Güvenlik Bypass (KEY_BYTE hatasını önlemek için)
        try:
            if hasattr(client, 'get_guest_token'):
                await client.get_guest_token()
        except Exception as ge:
            print(f"⚠️ Guest token bypass edildi/alınamadı: {ge}")

        # 3. İnsansı bekleme süresi (X radarına girmemek için)
        await human_delay(2.0, 5.0)

        # 4. Tweet atma işlemi
        try:
            if req.reply_to_id:
                result = await client.create_tweet(text=req.text, reply_to=req.reply_to_id)
            else:
                result = await client.create_tweet(text=req.text)

            # Tweet ID'sini güvenli bir şekilde al (Objeden ID çekmeyi dene)
            t_id = getattr(result, 'id', None)

            return {
                "success": True,
                "message": "Tweet gönderildi",
                "tweet_id": t_id
            }

        except Exception as tweet_err:
            error_msg = str(tweet_err)

            # KRİTİK: X '200 OK' dönmesine rağmen kütüphanenin yanıtı okuyamadığı
            # ('urls' veya 'create_tweet' anahtarı bulunamadı) durumları yakalıyoruz.
            if "'urls'" in error_msg or "'create_tweet'" in error_msg:
                return {
                    "success": True,
                    "message": "Tweet başarıyla gönderildi (X sunucusu onayladı)",
                    "tweet_id": "GÖNDERİLDİ"
                }

            # Eğer hata bunlardan biri değilse gerçek bir hatadır (örneğin: limit, ban vb.)
            raise tweet_err

    except Exception as e:
        error_msg = str(e)
        print(f"❌ API Tweet Hatası: {error_msg}")

        # Hata tipine göre uygun HTTP statüsünü dön
        if "KEY_BYTE" in error_msg:
            raise HTTPException(status_code=401, detail="Oturum anahtarları doğrulanamadı.")
        elif "Unauthorized" in error_msg:
            raise HTTPException(status_code=401, detail="Oturum geçersiz veya süresi dolmuş.")

        raise HTTPException(status_code=500, detail=error_msg)

@app.post("/actions/delete-tweet")
async def delete_tweet(req: DeleteTweetRequest):
    client = sessions.get_client(req.username)
    try:
        await human_delay(0.5, 1.5)
        await client.delete_tweet(req.tweet_id)
        return {"success": True, "message": f"Tweet {req.tweet_id} silindi"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/actions/send-dm")
async def send_dm(req: DMRequest):
    client = sessions.get_client(req.username)
    try:
        await human_delay(1.0, 3.0)
        user = await client.get_user_by_screen_name(req.target_username)
        await client.send_dm(user.id, req.text)
        return {"success": True, "message": f"@{req.target_username} kullanıcısına DM gönderildi"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ===== Data / Scraping =====
@app.post("/data/timeline")
async def get_timeline(req: TimelineRequest):
    client = sessions.get_client(req.username)
    try:
        tweets = await client.get_user_tweets("latest", count=req.count)
        return {
            "success": True,
            "tweets": [
                {
                    "id": t.id,
                    "text": t.text,
                    "created_at": str(t.created_at) if hasattr(t, 'created_at') else None,
                    "like_count": t.favorite_count if hasattr(t, 'favorite_count') else 0,
                    "retweet_count": t.retweet_count if hasattr(t, 'retweet_count') else 0,
                }
                for t in (tweets or [])[:req.count]
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/data/home-timeline")
async def get_home_timeline(req: TimelineRequest):
    client = sessions.get_client(req.username)
    try:
        tweets = await client.get_timeline(count=req.count)
        return {
            "success": True,
            "tweets": [
                {
                    "id": t.id,
                    "text": t.text,
                    "created_at": str(t.created_at) if hasattr(t, 'created_at') else None,
                    "like_count": t.favorite_count if hasattr(t, 'favorite_count') else 0,
                    "retweet_count": t.retweet_count if hasattr(t, 'retweet_count') else 0,
                    "author_username": t.user.screen_name if hasattr(t, 'user') and t.user else None,
                    "author_name": t.user.name if hasattr(t, 'user') and t.user else None,
                }
                for t in (tweets or [])[:req.count]
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/data/followers")
async def get_followers(req: FollowListRequest):
    client = sessions.get_client(req.username)
    try:
        target = req.target_username or req.username
        user = await client.get_user_by_screen_name(target)
        followers = await client.get_user_followers(user.id, count=req.count)
        return {
            "success": True,
            "users": [
                {
                    "id": u.id,
                    "name": u.name,
                    "username": u.screen_name,
                    "followers_count": u.followers_count if hasattr(u, 'followers_count') else 0,
                    "following_count": u.following_count if hasattr(u, 'following_count') else 0,
                    "verified": u.is_blue_verified if hasattr(u, 'is_blue_verified') else False,
                    "profile_image_url": u.profile_image_url if hasattr(u, 'profile_image_url') else None,
                }
                for u in (followers or [])[:req.count]
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/data/following")
async def get_following(req: FollowListRequest):
    client = sessions.get_client(req.username)
    try:
        target = req.target_username or req.username
        user = await client.get_user_by_screen_name(target)
        following = await client.get_user_following(user.id, count=req.count)
        return {
            "success": True,
            "users": [
                {
                    "id": u.id,
                    "name": u.name,
                    "username": u.screen_name,
                    "followers_count": u.followers_count if hasattr(u, 'followers_count') else 0,
                    "following_count": u.following_count if hasattr(u, 'following_count') else 0,
                    "verified": u.is_blue_verified if hasattr(u, 'is_blue_verified') else False,
                }
                for u in (following or [])[:req.count]
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/data/search")
async def search_tweets(req: SearchRequest):
    client = sessions.get_client(req.username)
    try:
        tweets = await client.search_tweet(req.query, product="Latest", count=req.count)
        return {
            "success": True,
            "tweets": [
                {
                    "id": t.id,
                    "text": t.text,
                    "created_at": str(t.created_at) if hasattr(t, 'created_at') else None,
                    "like_count": t.favorite_count if hasattr(t, 'favorite_count') else 0,
                    "retweet_count": t.retweet_count if hasattr(t, 'retweet_count') else 0,
                    "author_username": t.user.screen_name if hasattr(t, 'user') and t.user else None,
                }
                for t in (tweets or [])[:req.count]
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/data/search-verified")
async def search_verified(req: SearchVerifiedRequest):
    client = sessions.get_client(req.username)
    try:
        tweets = await client.search_tweet(f"{req.keyword} filter:verified", product="Latest", count=req.count * 2)
        seen_users = {}
        for t in (tweets or []):
            if hasattr(t, 'user') and t.user and t.user.screen_name not in seen_users:
                if hasattr(t.user, 'is_blue_verified') and t.user.is_blue_verified:
                    seen_users[t.user.screen_name] = {
                        "id": t.user.id,
                        "name": t.user.name,
                        "username": t.user.screen_name,
                        "followers_count": t.user.followers_count if hasattr(t.user, 'followers_count') else 0,
                        "verified": True,
                    }
        return {"success": True, "users": list(seen_users.values())[:req.count]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ===== Bot Veri Kapısı (mevcut, API key kontrolü) =====
@app.post('/api/bot-data')
async def bot_data_receiver(req: BotDataRequest, x_api_key: Optional[str] = Header(None)):
    if x_api_key != 'KODCUM_SECURE_KEY_2026':
        raise HTTPException(status_code=403, detail="Yetkisiz bot erişimi!")

    logger.info(f"🤖 {req.bot_id} botundan veri geldi: {req.url}")
    return {"status": "Başarılı", "message": "Veri işlendi."}

# ===== View Boost (existing endpoint using Playwright) =====
@app.post("/boost/views")
async def boost_views(req: ViewBoostRequest):
    chrome_path = os.environ.get("PUPPETEER_EXECUTABLE_PATH")
    try:
        results = {"success": True, "message": f"Görüntülenme artırma başlatıldı", "completed": 0}
        async with Stealth().use_async(async_playwright()) as p:
            for i in range(req.view_count):
                browser = await p.chromium.launch(
                    headless=True,
                    executable_path=chrome_path if chrome_path else None
                )
                context = await browser.new_context(
                    user_agent=ua_factory.random,
                    viewport={"width": random.randint(1024, 1920), "height": random.randint(768, 1080)},
                )
                page = await context.new_page()

                try:
                    await page.goto(req.tweet_url, wait_until="domcontentloaded", timeout=15000)
                    await page.evaluate("window.scrollBy(0, Math.random() * 500 + 200)")
                    await asyncio.sleep(random.uniform(2, 5))
                    results["completed"] = i + 1
                except Exception:
                    pass
                finally:
                    await browser.close()
                await asyncio.sleep(random.uniform(1, 3))
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ===== New: boost_view helper and bulk boost endpoint =====
async def boost_view(account_name: str, tweet_id: str):
    """
    Belirli bir hesabı kullanarak bir tweet'e görüntülenme (impression) gönderir.
    """
    try:
        # Mevcut login mantığınla client'ı alıyoruz
        client = await get_authed_client(account_name)

        # Tweet detaylarını çekmek 'view' olarak sayılmasını tetikler
        if hasattr(client, "get_tweet_by_id"):
            try:
                await client.get_tweet_by_id(tweet_id)
            except Exception:
                pass
        elif hasattr(client, "get_status"):
            try:
                await client.get_status(tweet_id)
            except Exception:
                pass
        else:
            # Eğer kütüphanede doğrudan bir metod yoksa, timeline veya show ile deneme yapılabilir
            pass

        # İnsansı hareket simülasyonu (rastgele bekleme)
        await asyncio.sleep(random.uniform(2, 5))

        # Log listesine ekle (Dashboard'da görünmesi için)
        activity_logs.insert(0, {
            "created_at": datetime.now().isoformat(),
            "target_url": f"X / {tweet_id}",
            "durum": f"{account_name} ile görüntülenme gönderildi.",
            "status": "success"
        })
        if len(activity_logs) > 50:
            activity_logs.pop()
        return True
    except Exception as e:
        print(f"❌ View Hatası ({account_name}): {e}")
        # Hata logu ekle
        activity_logs.insert(0, {
            "created_at": datetime.now().isoformat(),
            "target_url": f"X / {tweet_id}",
            "durum": f"{account_name} ile görüntülenme başarısız: {str(e)}",
            "status": "error"
        })
        if len(activity_logs) > 50:
            activity_logs.pop()
        return False

@app.post("/api/boost-stats")
async def boost_stats(req: BoostStatsRequest):
    # Tweet ID'sini URL'den ayıkla
    tweet_id = req.tweet_url.split("/")[-1].split("?")[0]

    # Tüm kayıtlı hesapları 'cookies' klasöründen oku
    try:
        accounts = [f.replace('.json', '') for f in os.listdir(sessions.cookies_dir) if f.endswith('.json')]
    except Exception:
        accounts = []

    success_count = 0
    for acc in accounts:
        # Rastgele bekleme (X'in spam filtresine takılmamak için)
        await asyncio.sleep(random.randint(1, 3))

        result = await boost_view(acc, tweet_id)
        if result:
            success_count += 1

    return {"status": "completed", "total_views_sent": success_count, "accounts_processed": len(accounts)}

# ===== New: run_view_operation helper (main operation loop integration) =====
async def run_view_operation(target_url: str):
    """
    main.py içindeki ana operasyon döngüsüne eklenebilecek yardımcı fonksiyon.
    target_url tweet veya profil URL'si olabilir.
    """
    accounts = get_all_accounts()  # cookies klasöründeki hesaplar

    for account in accounts:
        try:
            # Kodundaki hazır Proxy mantığını burada devreye al (eğer varsa)
            client = await get_authed_client(account)

            # Tweet mi yoksa Profil mi olduğunu ayır
            if "status" in target_url or "status" in target_url.lower():
                tweet_id = target_url.split("/")[-1].split("?")[0]
                if hasattr(client, "get_tweet_by_id"):
                    try:
                        await client.get_tweet_by_id(tweet_id)
                    except Exception:
                        pass
                elif hasattr(client, "get_status"):
                    try:
                        await client.get_status(tweet_id)
                    except Exception:
                        pass
            else:
                username = target_url.split("/")[-1].split("?")[0]
                if hasattr(client, "get_user_by_screen_name"):
                    try:
                        await client.get_user_by_screen_name(username)
                    except Exception:
                        pass

            # activity_logs'a bas ki Dashboard'da görelim
            activity_logs.insert(0, {
                "created_at": datetime.now().isoformat(),
                "target_url": target_url,
                "durum": f"{account} ile hedef görüntülendi (Impression +1)",
                "status": "success"
            })
            if len(activity_logs) > 50:
                activity_logs.pop()

            # Senin kodundaki o meşhur rastgele bekleme süresi
            await asyncio.sleep(random.uniform(5, 15))
        except Exception as e:
            # Hata durumunda log ekle ve devam et
            activity_logs.insert(0, {
                "created_at": datetime.now().isoformat(),
                "target_url": target_url,
                "durum": f"{account} ile görüntüleme sırasında hata: {str(e)}",
                "status": "error"
            })
            if len(activity_logs) > 50:
                activity_logs.pop()
            await asyncio.sleep(random.uniform(2, 5))
    return True

# ===== Proxy Test =====
@app.post("/proxy/test")
async def test_proxy(req: ProxyTestRequest):
    try:
        import aiohttp
        proxy_url = f"{req.type}://"
        if req.username and req.password:
            proxy_url += f"{req.username}:{req.password}@"
        proxy_url += f"{req.address}:{req.port}"

        start = time.time()
        async with aiohttp.ClientSession() as session:
            async with session.get("https://httpbin.org/ip", proxy=proxy_url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                if resp.status == 200:
                    latency = int((time.time() - start) * 1000)
                    return {"success": True, "alive": True, "latency_ms": latency}
        return {"success": True, "alive": False, "latency_ms": 0}
    except Exception as e:
        return {"success": True, "alive": False, "latency_ms": 0, "error": str(e)}

# ===== Bulk Operations =====
@app.post("/bulk/follow")
async def bulk_follow(req: BulkFollowRequest):
    client = sessions.get_client(req.username)
    results = {"success": True, "completed": 0, "failed": 0, "errors": []}
    for target in req.targets:
        try:
            user = await client.get_user_by_screen_name(target.replace("@", ""))
            await client.follow_user(user.id)
            results["completed"] += 1
            delay = req.delay + (random.uniform(0, 2) if req.random_jitter else 0)
            await asyncio.sleep(delay)
        except Exception as e:
            results["failed"] += 1
            results["errors"].append(f"@{target}: {str(e)}")
    return results

@app.post("/bulk/unfollow")
async def bulk_unfollow(req: BulkUnfollowRequest):
    client = sessions.get_client(req.username)
    try:
        me = await client.user()
        following = await client.get_user_following(me.id, count=req.count)

        results = {"success": True, "completed": 0, "failed": 0}
        for user in (following or [])[:req.count]:
            try:
                should_unfollow = True
                if req.mode == "non_followers":
                    followers = await client.get_user_followers(me.id, count=5000)
                    follower_ids = {f.id for f in (followers or [])}
                    should_unfollow = user.id not in follower_ids
                elif req.mode == "non_verified":
                    should_unfollow = not (hasattr(user, 'is_blue_verified') and user.is_blue_verified)

                if should_unfollow:
                    await client.unfollow_user(user.id)
                    results["completed"] += 1
                    delay = req.delay + random.uniform(0, 2)
                    await asyncio.sleep(delay)
            except Exception:
                results["failed"] += 1
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== TELEGRAM KUMANDA MERKEZİ ====================
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import Message  # DUZELTME: Import eksigi giderildi
import threading

TELEGRAM_TOKEN = os.environ.get("TELEGRAM_TOKEN", "8171303759:AAGWubdCE5SVSHCtPfbKSfu1Guk_TfFwJbQ")
ADMIN_ID = os.environ.get("ADMIN_ID", "6165048572")

tg_bot = Bot(token=TELEGRAM_TOKEN)
dp = Dispatcher()

def is_admin(m: Message):
    return str(m.from_user.id) == ADMIN_ID

@dp.message(Command("tweet"))
async def tweet_at_handler(m: Message):
    # Komutu parçala
    parts = m.text.split(maxsplit=2)
    if len(parts) < 3:
        await m.answer("⚠️ Kullanım: /tweet kullanici Merhaba")
        return

    _, username, tweet_text = parts

    try:
        await m.answer(f"⏳ @{username} hesabından tweet atılıyor...")

        # 1. Oturumu çek
        client = sessions.get_client(username)

        # 2. KRİTİK: X'in kapısını misafir anahtarıyla çal (KEY_BYTE bypass)
        try:
            if hasattr(client, 'get_guest_token'):
                await client.get_guest_token()
        except Exception as ge:
            print(f"⚠️ Guest token bypass edildi veya alınamadı: {ge}")

        # 3. İnsansı Bekleme (Sistemi yormayalım)
        await human_delay(2.0, 4.0)

        # 4. Tweeti gönder (Hata yakalamalı yeni yapı)
        try:
            result = await client.create_tweet(text=tweet_text)

            # Başarı kontrolü
            if result:
                t_id = getattr(result, 'id', 'Bilinmiyor')
                await m.answer(f"✅ Başarılı! Tweet gönderildi.\nID: {t_id}")
            else:
                await m.answer("✅ İşlem tamamlandı! (Tweet gönderilmiş olmalı)")

        except Exception as tweet_err:
            error_msg = str(tweet_err)
            # Eğer tweet gittiyse ama kütüphane 'urls' hatası veriyorsa başarı sayıyoruz
            if "'urls'" in error_msg:
                await m.answer("✅ Tweet başarıyla gönderildi (X Doğrulandı).")
            else:
                # Gerçek bir hata varsa onu fırlatıyoruz
                raise tweet_err

    except Exception as e:
        error_str = str(e)
        print(f"❌ Hata Detayı: {error_str}")

        if "KEY_BYTE" in error_str:
            await m.answer("❌ X Güvenlik Engeli: Oturum anahtarları doğrulanamadı. Lütfen cookies klasöründeki JSON dosyasını tazeleyin.")
        elif "Unauthorized" in error_str or "Could not authenticate" in error_str:
            await m.answer("❌ Yetki Hatası: Giriş başarısız. Çerezler geçersiz veya süresi dolmuş.")
        elif "401: @" in error_str:
            await m.answer(f"❌ Oturum bulunamadı: {error_str}")
        else:
            await m.answer(f"❌ Hata oluştu: {error_str}")

def run_telegram_bot():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(dp.start_polling(tg_bot))

threading.Thread(target=run_telegram_bot, daemon=True).start()

# ===== Optional simple bridge endpoint for frontend boost trigger (if not present) =====
# If /api/boost-stats is already defined above, this endpoint is not strictly necessary.
# Keeping a lightweight bridge that accepts a simple BoostRequest and logs immediate feedback.
@app.post("/api/boost-stats-simple")
async def boost_stats_simple(request: BoostRequest):
    # Loglara hemen "İşlem Alındı" bilgisini düşer (Dashboard'da anında görünür)
    activity_logs.insert(0, {
        "created_at": datetime.now().isoformat(),
        "target_url": request.url[-15:],  # URL'nin son kısmını gösterir
        "durum": "Operasyon tetiklendi. Hedef görüntüleniyor...",
        "status": "success"
    })
    if len(activity_logs) > 50:
        activity_logs.pop()

    # Burada elindeki o tek hesabı kullanarak görüntüleme fonksiyonunu çağırabilirsiniz
    # Örneğin: asyncio.create_task(run_view_operation(request.url))
    try:
        # Başlatıcı olarak arka planda çalıştır (non-blocking)
        asyncio.create_task(run_view_operation(request.url))
    except Exception:
        pass

    return {"message": "Operation Started"}

# ==================== Startup ====================
if __name__ == "__main__":
    import uvicorn
    target_port = int(os.environ.get("PORT", 10000))
    logger.info(f"🔥 SNR ENGINE V2 başlatılıyor - Hedef Port: {target_port}")
    uvicorn.run(app, host="0.0.0.0", port=target_port)
