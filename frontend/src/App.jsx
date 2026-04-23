import React, { useEffect, useState } from 'react';
import { Terminal, Activity, Zap, Shield, ChevronRight, Globe, Server, Send } from 'lucide-react';

export default function App() {
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState("BAĞLANIYOR...");
  const [targetUrl, setTargetUrl] = useState("");
  const [opStatus, setOpStatus] = useState("IDLE"); // IDLE, RUNNING, SUCCESS
  const [stats, setStats] = useState({
    security: "Level 4",
    activities: 0,
    proxy: "Stable",
    uptime: "99.9%"
  });

  // Python FastAPI (Port 10000) üzerinden rapor verilerini çeker
  const fetchLogs = async () => {
    try {
      const res = await fetch('http://localhost:10000/api/bot-report');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.last_activities || []);
        setStatus("SNR ENGINE ACTIVE");
        setStats(prev => ({
          ...prev,
          activities: data.last_activities?.length || 0
        }));
      } else {
        setStatus("BAĞLANTI HATASI (500)");
      }
    } catch (err) {
      setStatus("OFFLINE (PYTHON KAPALI)");
    }
  };

  // Operasyonu Başlatma Fonksiyonu (View Bot Tetikleyici)
  const startOperation = async () => {
    if (!targetUrl) return;
    
    setOpStatus("RUNNING");
    try {
      const res = await fetch('http://localhost:10000/api/boost-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      });
      
      if (res.ok) {
        setOpStatus("SUCCESS");
        setTargetUrl("");
        setTimeout(() => setOpStatus("IDLE"), 3000);
      } else {
        setOpStatus("IDLE");
        alert("Operasyon sunucu tarafından reddedildi.");
      }
    } catch (err) {
      setOpStatus("IDLE");
      alert("Python API'ye ulaşılamıyor!");
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-mono p-4 md:p-10 selection:bg-cyan-400 selection:text-black">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* ÜST PANEL / HEADER */}
        <header className="flex justify-between items-center border-b border-zinc-800 pb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-lg shadow-[0_0_20px_rgba(0,243,255,0.05)]">
              <Zap className="text-cyan-400 animate-pulse" fill="currentColor" size={24} />
            </div>
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">
                SNR ENGINE <span className="text-cyan-400">V2</span>
              </h1>
              <p className="text-[10px] text-zinc-600 tracking-[0.3em]">OPERASYON_MERKEZI</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={`px-6 py-1.5 text-[10px] border rounded-sm font-bold tracking-widest transition-all duration-500 ${
              status === "SNR ENGINE ACTIVE" 
              ? "border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]" 
              : "border-red-600 text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.2)]"
            }`}>
              ● {status}
            </div>
            <span className="text-[9px] text-zinc-700 uppercase font-bold tracking-widest">Active Port: 10000</span>
          </div>
        </header>

        {/* İSTATİSTİK KUTULARI */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatBox icon={<Shield size={18} className="text-cyan-400" />} label="Security" val={stats.security} />
          <StatBox icon={<Activity size={18} className="text-pink-500" />} label="Logs" val={stats.activities} />
          <StatBox icon={<Globe size={18} className="text-yellow-400" />} label="Proxy Status" val={stats.proxy} />
          <StatBox icon={<Server size={18} className="text-green-400" />} label="Uptime" val={stats.uptime} />
        </div>

        {/* OPERASYON KONTROL ALANI */}
        <div className="bg-[#0a0a0a] border border-zinc-800 p-6 rounded-sm shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 opacity-50 group-hover:h-full transition-all" />
          <div className="flex flex-col md:flex-row gap-4 items-end relative z-10">
            <div className="flex-1 space-y-2">
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold ml-1 flex items-center gap-2">
                <Send size={12} className="text-cyan-500" /> Target URL / Username
              </label>
              <input 
                type="text" 
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://x.com/user/status/123... veya @username" 
                className="w-full bg-zinc-900/50 border border-zinc-800 p-3 text-sm focus:border-cyan-500 outline-none transition-all text-cyan-50 font-mono placeholder:text-zinc-700"
              />
            </div>
            <button 
              onClick={startOperation}
              disabled={opStatus === "RUNNING" || !targetUrl}
              className={`px-10 py-3 text-xs font-black uppercase tracking-tighter italic transition-all border ${
                opStatus === "RUNNING" 
                ? "bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed" 
                : opStatus === "SUCCESS"
                ? "bg-green-500 border-green-400 text-black"
                : "bg-cyan-500 border-cyan-400 text-black hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] active:scale-95"
              }`}
            >
              {opStatus === "RUNNING" ? "SİSTEM ÇALIŞIYOR..." : opStatus === "SUCCESS" ? "İŞLEM TAMAM" : "OPERASYONU BAŞLAT"}
            </button>
          </div>
        </div>

        {/* ANA LOG TERMİNALİ */}
        <div className="bg-[#0a0a0a] border border-zinc-800 rounded-sm shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none opacity-20" />
          
          <div className="bg-zinc-900/80 px-5 py-3 border-b border-zinc-800 flex justify-between items-center relative z-10">
            <div className="flex items-center gap-3">
              <Terminal size={14} className="text-cyan-400" />
              <span className="text-[10px] text-zinc-400 tracking-[0.4em] font-bold uppercase">Live Bot Feed</span>
            </div>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500/20 border border-red-500/40" />
              <div className="w-2 h-2 rounded-full bg-green-500/20 border border-green-500/40 animate-pulse" />
            </div>
          </div>

          <div className="p-8 h-[500px] overflow-y-auto space-y-4 relative z-10 scroll-smooth custom-scrollbar font-mono text-[11px]">
            {logs.length > 0 ? (
              logs.map((log, i) => (
                <div key={i} className="flex gap-6 group items-center border-l border-zinc-800 pl-6 py-2 hover:bg-zinc-900/40 hover:border-cyan-400 transition-all duration-300">
                  <span className="text-zinc-600 tabular-nums">
                    [{log.created_at ? new Date(log.created_at).toLocaleTimeString() : '00:00:00'}]
                  </span>
                  <span className="text-cyan-400 font-bold tracking-tighter w-32 truncate">
                    [{log.target_url || 'SYSTEM'}]
                  </span>
                  <ChevronRight size={14} className="text-zinc-800 group-hover:text-cyan-400 transition-colors" />
                  <span className="text-zinc-400 group-hover:text-zinc-100 transition-colors uppercase tracking-wide">
                    {log.durum}
                  </span>
                  <span className={`ml-auto text-[9px] px-3 py-1 font-bold rounded-sm border ${
                    log.status === 'success' 
                    ? 'text-green-400 border-green-500/30 bg-green-500/5' 
                    : 'text-zinc-500 border-zinc-800 bg-zinc-900'
                  }`}>
                    {(log.status || 'INFO').toUpperCase()}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full opacity-20">
                <Activity className="animate-pulse mb-4 text-cyan-400" size={48} />
                <p className="text-sm tracking-[0.5em] font-bold uppercase text-white">Veri Akışı Bekleniyor...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon, label, val }) {
  return (
    <div className="bg-[#0a0a0a] border border-zinc-800 p-5 hover:border-zinc-600 transition-all cursor-default group relative overflow-hidden">
      <div className="flex justify-between items-start mb-4 relative z-10">
        <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold group-hover:text-zinc-300">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-black italic tracking-tighter text-white group-hover:text-cyan-400 transition-colors relative z-10">{val}</div>
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-transparent group-hover:bg-cyan-500/20 transition-all" />
    </div>
  );
}