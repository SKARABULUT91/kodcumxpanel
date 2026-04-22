"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, Send, Users, Shield, Zap, Activity, MessageSquare, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

export default function DashboardLayouts() {
  const [statusData, setStatusData] = useState<any>({ status: 'loading' });
  const [sessions, setSessions] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [tweetText, setTweetText] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Verileri çekme fonksiyonu
  const loadInitialData = useCallback(async () => {
    const [sData, sessData] = await Promise.all([
      api.getStatus(),
      api.getSessions()
    ]);
    
    setStatusData(sData);
    setSessions(sessData.sessions || []);
    
    if (sessData.sessions?.length > 0 && !selectedUser) {
      setSelectedUser(sessData.sessions[0]);
    }
  }, [selectedUser]);

  useEffect(() => {
    loadInitialData();
    const interval = setInterval(loadInitialData, 10000); // 10 saniyede bir tazele
    return () => clearInterval(interval);
  }, [loadInitialData]);

  const handleOperation = async () => {
    if (!selectedUser || !tweetText) return;
    setIsSending(true);
    const result = await api.sendTweet(selectedUser, tweetText);
    if (result.status === "success" || result.success) {
      alert("Operasyon Başarılı!");
      setTweetText("");
    } else {
      alert("Hata: " + (result.detail || "Bilinmeyen hata"));
    }
    setIsSending(false);
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-slate-300 font-sans italic selection:bg-blue-500/30">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0a0a0a] border-r border-white/5 p-6 fixed h-full z-20">
        <div className="flex items-center gap-3 mb-10 group cursor-pointer">
          <div className="p-2 bg-blue-600 rounded-lg shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-transform group-hover:scale-110">
            <Zap size={20} className="text-white fill-current" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tighter uppercase italic">Kodcum <span className="text-blue-500 font-mono text-xs not-italic">v2</span></h1>
        </div>
        <nav className="space-y-2">
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-[2px] mb-4 ml-2 opacity-50">Kontrol Paneli</div>
          <button className="flex items-center gap-4 w-full p-4 bg-blue-600/10 text-blue-500 rounded-2xl border border-blue-500/20 font-bold text-sm">
            <LayoutDashboard size={18}/> <span>Ana Terminal</span>
          </button>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 ml-64 p-12">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-5xl font-black text-white tracking-tighter mb-2 italic">DASHBOARD</h2>
            <p className="text-slate-500 font-medium">Hoş geldin Soner, Python motoru {statusData.status === 'online' ? 'aktif' : 'beklemede'}.</p>
          </div>
          <div className={`px-5 py-2 rounded-2xl border flex items-center gap-3 ${statusData.status === 'online' ? 'bg-green-500/5 border-green-500/20 text-green-500' : 'bg-red-500/5 border-red-500/20 text-red-500'}`}>
            <div className={`w-2.5 h-2.5 rounded-full ${statusData.status === 'online' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500 animate-pulse'}`} />
            <span className="text-[11px] font-black uppercase tracking-widest">SİSTEM: {statusData.status}</span>
          </div>
        </header>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-8 mb-12">
          <StatCard icon={<Users className="text-blue-500" />} label="Aktif Oturum" value={sessions.length} />
          <StatCard icon={<Activity className="text-emerald-500" />} label="Motor Sürümü" value="v2.4 Python" />
          <StatCard icon={<Shield className="text-purple-500" />} label="Güvenlik" value="Stealth" />
        </div>

        {/* OPERATION AREA */}
        <div className="bg-[#0a0a0a] p-10 rounded-[40px] border border-white/5 shadow-3xl max-w-4xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] -mr-32 -mt-32 opacity-50" />
          <div className="flex items-center gap-4 mb-10 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
               <Send size={22} />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight italic uppercase">Hayalet Operasyonu Başlat</h3>
          </div>

          <div className="space-y-8 relative z-10">
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-3">
                 <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">İşlem Yapacak Hesap</label>
                 <select 
                   value={selectedUser}
                   onChange={(e) => setSelectedUser(e.target.value)}
                   className="w-full bg-[#111] border border-white/10 p-5 rounded-[20px] text-white font-bold focus:border-blue-500 transition outline-none appearance-none cursor-pointer"
                 >
                   {sessions.length > 0 ? (
                     sessions.map(user => <option key={user} value={user}>@{user.toUpperCase()}</option>)
                   ) : (
                     <option>Oturum Yok</option>
                   )}
                 </select>
               </div>
               <div className="space-y-3 text-right">
                 <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mr-1">Mod</label>
                 <div className="p-5 bg-blue-600/5 border border-blue-500/20 rounded-[20px] text-blue-500 text-xs font-black uppercase tracking-widest text-center">
                    Shadow Engine Active
                 </div>
               </div>
            </div>

            <div className="space-y-3">
               <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 text-blue-500">Tweet / Mesaj İçeriği</label>
               <textarea 
                 value={tweetText}
                 onChange={(e) => setTweetText(e.target.value)}
                 className="w-full bg-[#111] border border-white/10 p-8 rounded-[30px] text-white font-medium focus:border-blue-500 transition outline-none resize-none h-48 leading-relaxed placeholder:text-slate-700"
                 placeholder="X dünyasına fısılda..."
               />
            </div>

            <button 
              onClick={handleOperation}
              disabled={isSending || statusData.status === 'offline'}
              className="w-full py-6 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-black rounded-[24px] transition-all shadow-xl shadow-blue-600/20 active:scale-[0.97] flex items-center justify-center gap-3 uppercase tracking-[2px]"
            >
              {isSending ? <Loader2 className="animate-spin" /> : <Zap size={20} className="fill-current" />}
              <span>{isSending ? "Operasyon Sürüyor..." : "Ateşle"}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value }: any) {
  return (
    <div className="bg-[#0a0a0a] p-10 rounded-[35px] border border-white/5 hover:border-blue-500/20 transition-all group">
      <div className="mb-6 p-4 bg-white/5 w-fit rounded-2xl group-hover:bg-blue-600 transition-colors text-slate-400 group-hover:text-white">
        {icon}
      </div>
      <div className="text-4xl font-black text-white mb-2 tracking-tighter">{value}</div>
      <div className="text-[10px] font-black text-slate-600 uppercase tracking-[2.5px] group-hover:text-blue-500 transition-colors">{label}</div>
    </div>
  );
}