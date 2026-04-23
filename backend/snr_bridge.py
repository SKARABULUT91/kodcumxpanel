import requests
import json

def report_to_snr(durum, target="System", status="info", bot_id="SNR-V2-BOT"):
    """
    Kendi main.py dosyanın her yerinden bu fonksiyonu çağırabilirsin.
    """
    try:
        # Bizim kurduğumuz localhost backend adresi
        api_url = "http://localhost:3001/api/bot-data"
        
        payload = {
            "bot_id": bot_id,
            "url": target,
            "durum": durum,
            "status": status # 'success', 'error', veya 'info'
        }
        
        headers = {'Content-Type': 'application/json'}
        # Arka planda sessizce gönder, botun hızını kesme (timeout ile)
        requests.post(api_url, data=json.dumps(payload), headers=headers, timeout=1)
    except:
        # Sunucu kapalıysa botun çökmemesi için hatayı yut
        pass