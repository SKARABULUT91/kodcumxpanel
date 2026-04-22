// src/lib/api.ts
const API_BASE = "http://127.0.0.1:8000"; // Python FastAPI varsayılan portu

export const api = {
  // 1. Sistem Durumunu Al (/status)
  getStatus: async () => {
    try {
      const res = await fetch(`${API_BASE}/status`);
      if (!res.ok) throw new Error("Backend yanıt vermiyor");
      return await res.json();
    } catch (err) {
      return { status: "offline", engine: "SNR ENGINE V2" };
    }
  },

  // 2. Aktif Oturumları Listele (/sessions)
  getSessions: async () => {
    try {
      const res = await fetch(`${API_BASE}/sessions`);
      return await res.json(); // Beklenen: { "sessions": ["user1", "user2"] }
    } catch (err) {
      return { sessions: [] };
    }
  },

  // 3. Tweet Gönder (/send-tweet)
  sendTweet: async (username: string, text: string) => {
    try {
      const res = await fetch(`${API_BASE}/send-tweet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, text }),
      });
      return await res.json();
    } catch (err) {
      return { success: false, detail: "Bağlantı hatası!" };
    }
  },

  // 4. Proxy Durumu (/proxy)
  getProxy: async () => {
    try {
      const res = await fetch(`${API_BASE}/proxy`);
      return await res.json();
    } catch (err) {
      return { status: "unknown" };
    }
  }
};