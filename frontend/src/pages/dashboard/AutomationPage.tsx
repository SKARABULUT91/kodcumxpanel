import { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Play, 
  Square, 
  MousePointer2, 
  Clock, 
  Activity,
  Monitor,
  Type,
  ShieldCheck,
  Zap,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

const BACKEND_URL = "https://snr-engine-backend.onrender.com";

export default function AutomationPage() {
  const { accounts, addLog } = useStore();
  const activeAccount = accounts.find(a => a.isActive);
  
  const [isRunning, setIsRunning] = useState(false);
  const [targetUrl, setTargetUrl] = useState('');
  const [cycleInput, setCycleInput] = useState('10');
  
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [currentDelay, setCurrentDelay] = useState('0.0');
  const [currentMove, setCurrentMove] = useState('Analiz Ediliyor...');
  const [screenRes, setScreenRes] = useState('1920x1080');
  const [activeFont, setActiveFont] = useState('Inter, sans-serif');

  // Görsel Efekt Üretici (Kimlik simülasyonu)
  const generateVisualEffects = useCallback(() => {
    const resolutions = ['1920x1080', '1366x768', '1536x864', '1440x900', '1600x900', '1280x800'];
    const fonts = ['Roboto', 'Open Sans', 'Ubuntu', 'Segoe UI', 'Verdana', 'Helvetica'];
    const moves = ['Analyzing Tweet', 'Simulating Scroll', 'Mouse Jitter', 'Checking Ad-Slot', 'Profile Scan', 'Natural Hover'];
    
    setScreenRes(resolutions[Math.floor(Math.random() * resolutions.length)]);
    setActiveFont(fonts[Math.floor(Math.random() * fonts.length)]);
    setCurrentMove(moves[Math.floor(Math.random() * moves.length)]);
    setCurrentDelay((Math.random() * (25 - 15) + 15).toFixed(1));
  }, []);

  const checkBotStatus = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/bot-report`);
      const data = await res.json();
      
      if (data.status === "running") {
        setIsRunning(true);
        setTargetUrl(data.target);
        setProgress({ 
          current: data.progress.completed, 
          total: data.progress.total 
        });
        generateVisualEffects();
      } else {
        setIsRunning(false);
      }
    } catch (err) {
      console.error("Status check failed");
    }
  }, [generateVisualEffects]);

  // Sayfa açıldığında kimliği hemen oluştur
  useEffect(() => {
    generateVisualEffects(); 
    checkBotStatus();
    const interval = setInterval(checkBotStatus, 5000);
    return () => clearInterval(interval);
  }, [checkBotStatus, generateVisualEffects]);

  const handleToggle = async () => {
    if (!activeAccount || !targetUrl) {
      addLog("⚠️ HATA: Hesap seçilmedi veya URL boş.", "error");
      return;
    }

    if (!isRunning) {
      try {
        generateVisualEffects(); // Başlatırken kimliği tazele
        addLog(`🚀 [${activeAccount.username}] Operasyon Hazırlığı...`, 'info');
        
        const response = await fetch(`${BACKEND_URL}/api/start-automation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            url: targetUrl,
            cycles: parseInt(cycleInput)
          }) 
        });

        const data = await response.json();

        if (data.status === "active") {
          setIsRunning(true);
          setProgress({ current: 0, total: parseInt(cycleInput) });
          addLog(`✅ SNR ENGINE: Operasyon Başlatıldı.`, 'success');
        }
      } catch (error: any) {
        addLog(`🔴 Bağlantı Hatası!`, 'error');
      }
    } else {
      try {
        await fetch(`${BACKEND_URL}/api/stop-automation`, { method: 'POST' });
        setIsRunning(false);
        addLog(`🛑 Operasyon durduruldu.`, 'warning');
      } catch (err) {
        addLog(`❌ Durdurma başarısız.`, 'error');
      }
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* ÜST PANEL */}
      <div className={cn(
        "p-5 rounded-2xl border-2 flex items-center justify-between transition-all duration-700",
        isRunning ? "border-primary bg-primary/5 shadow-[0_0_30px_rgba(var(--primary),0.1)]" : "border-white/5 bg-zinc-900/50"
      )}>
        <div className="flex items-center gap-5">
          <div className={cn(
            "p-4 rounded-2xl transition-all duration-500",
            isRunning ? "bg-primary text-white" : "bg-white/5 text-zinc-600"
          )}>
            <Zap size={28} className={isRunning ? "animate-pulse" : ""} />
          </div>
          <div>
            <h2 className="font-black italic uppercase tracking-tighter text-lg leading-none mb-1">
              {isRunning ? `@${activeAccount?.username} SAHADA` : "SİSTEM BEKLEMEDE"}
            </h2>
            <div className="flex items-center gap-2">
              <div className={cn("h-1.5 w-1.5 rounded-full", isRunning ? "bg-green-500 animate-ping" : "bg-zinc-700")} />
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                {isRunning ? `DÖNGÜ: ${progress.current} / ${progress.total}` : "GÜVENLİ MOD AKTİF"}
              </p>
            </div>
          </div>
        </div>

        <Button 
          variant={isRunning ? "destructive" : "default"} 
          onClick={handleToggle}
          className="font-black italic uppercase px-8 h-12 shadow-xl"
        >
          {isRunning ? <><Square size={16} className="mr-2 fill-current" /> STOP</> : <><Play size={16} className="mr-2 fill-current" /> START</>}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-8 bg-zinc-900 border-2 border-white/5">
          <div className="flex items-center gap-3 text-primary mb-8">
            <Activity size={24} />
            <h3 className="font-black italic text-lg uppercase tracking-widest">Sızma Yapılandırması</h3>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3 space-y-2">
                <Label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest ml-1">Hedef URL</Label>
                <Input 
                  disabled={isRunning}
                  className="bg-black/60 border-white/10 h-14 font-mono text-sm text-primary" 
                  placeholder="https://x.com/target" 
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest ml-1">Döngü</Label>
                <Input 
                  disabled={isRunning}
                  type="number"
                  className="bg-black/60 border-white/10 h-14 font-mono text-center text-lg font-bold" 
                  value={cycleInput}
                  onChange={(e) => setCycleInput(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                <p className="text-[8px] font-black text-zinc-500 uppercase mb-2">Aksiyon</p>
                <p className="text-[11px] font-bold text-white truncate">{currentMove}</p>
              </div>
              <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                <p className="text-[8px] font-black text-zinc-500 uppercase mb-2">Gecikme</p>
                <p className="text-sm font-black text-primary font-mono">{currentDelay}s</p>
              </div>
              <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                <p className="text-[8px] font-black text-zinc-500 uppercase mb-2">Çözünürlük</p>
                <p className="text-[11px] font-bold text-blue-400">{screenRes}</p>
              </div>
              <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                <p className="text-[8px] font-black text-zinc-500 uppercase mb-2">Font</p>
                <p className="text-[11px] font-bold text-orange-400 truncate">{activeFont.split(',')[0]}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* TERMİNAL */}
        <Card className="bg-black border-2 border-white/5 p-5 font-mono text-[10px] flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-3">
            <span className="font-black text-primary uppercase tracking-widest flex items-center gap-2">
              <RotateCcw size={12} className={isRunning ? "animate-spin" : ""} /> Canlı Terminal
            </span>
          </div>
          <div className="space-y-4 overflow-y-auto h-[350px] pr-2 custom-scrollbar">
            {!isRunning && <p className="text-zinc-700 text-center mt-32 italic uppercase tracking-widest animate-pulse">Sistem Hazır...</p>}
            {isRunning && (
              <div className="space-y-3 animate-in fade-in duration-500">
                <p className="text-zinc-500">[{new Date().toLocaleTimeString()}] Kimlik Doğrulandı.</p>
                <p className="text-blue-500 opacity-80">&gt; Config: {screenRes} | {activeFont.split(',')[0]}</p>
                <p className="text-primary font-black">&gt; Status: {currentMove}</p>
                <div className="h-px bg-white/10 my-2" />
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
