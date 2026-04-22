import { useState, useRef } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { 
  ShieldX, Target, History, DatabaseBackup, 
  Save, Trash2, Download, Upload, Eye 
} from 'lucide-react';

export default function DataPage() {
  const {
    blacklistUsers, setBlacklistUsers,
    interactedUsers, clearInteractedUsers,
    addLog, exportData, importData,
  } = useStore();
  const [whitelistKeywords, setWhitelistKeywords] = useState('');
  const [showInteracted, setShowInteracted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    // "max-w-full" ve "p-2" ile kenar boşluklarını sıfıra yakın yaptık
    <div className="w-full max-w-full space-y-4 p-2 animate-in fade-in duration-500">
      
      {/* Üst Başlık Alanı - Boşluk bırakmadan direkt konuya giriş */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-2">
        <div className="flex flex-col">
          <h1 className="text-xl font-black italic uppercase tracking-tighter text-primary leading-none">VERİ & OPERASYON MERKEZİ</h1>
          <span className="text-[9px] font-bold text-zinc-500 tracking-[0.3em] mt-1">SİSTEM PARAMETRELERİ VE VERİTABANI KONTROLÜ</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        
        {/* Blacklist & Whitelist - Yan Yana veya Alt Alta (Genişletilmiş) */}
        <div className="space-y-4">
          <div className="bg-zinc-900/40 border border-red-500/20 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <ShieldX className="text-red-500 w-4 h-4" />
              <h2 className="text-[10px] font-black uppercase tracking-widest text-red-500/80">KARA LİSTE (BLACKLIST)</h2>
            </div>
            <Textarea
              placeholder="username1..."
              value={blacklistUsers}
              onChange={(e) => setBlacklistUsers(e.target.value)}
              className="h-[180px] bg-black/40 border-white/5 text-red-400 font-mono text-xs focus:ring-red-500/30 w-full"
            />
            <Button className="w-full mt-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-black font-black uppercase text-[10px] h-8 transition-all" onClick={() => toast({ title: 'KARA LİSTE KİLİTLENDİ' })}>
              <Save className="w-3 h-3 mr-2" /> PARAMETRELERİ KAYDET
            </Button>
          </div>

          <div className="bg-zinc-900/40 border border-green-500/20 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Target className="text-green-500 w-4 h-4" />
              <h2 className="text-[10px] font-black uppercase tracking-widest text-green-500/80">HEDEF KELİME FİLTRESİ</h2>
            </div>
            <Textarea
              placeholder="harika, teşekkürler..."
              value={whitelistKeywords}
              onChange={(e) => setWhitelistKeywords(e.target.value)}
              className="h-[140px] bg-black/40 border-white/5 text-green-400 font-mono text-xs focus:ring-green-500/30 w-full"
            />
            <Button className="w-full mt-3 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-black font-black uppercase text-[10px] h-8 transition-all">
              <Save className="w-3 h-3 mr-2" /> FİLTREYİ AKTİF ET
            </Button>
          </div>
        </div>

        {/* Geçmiş & Yedekleme - Sağ Kolon */}
        <div className="space-y-4">
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4 shadow-sm h-fit">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="text-primary w-4 h-4" />
                <h2 className="text-[10px] font-black uppercase tracking-widest text-primary/80">ETKİLEŞİM KAYITLARI</h2>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setShowInteracted(!showInteracted)}><Eye size={14}/></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={clearInteractedUsers}><Trash2 size={14}/></Button>
              </div>
            </div>
            
            {showInteracted ? (
              <div className="max-h-[300px] overflow-y-auto bg-black/60 p-3 rounded-lg border border-white/5 font-mono text-[10px] text-zinc-400 space-y-1">
                {interactedUsers.length === 0 ? '> VERİ YOK.' : interactedUsers.map((u, i) => <div key={i} className="border-b border-white/5 pb-1">@{u}</div>)}
              </div>
            ) : (
              <div className="h-[100px] flex items-center justify-center border-2 border-dashed border-white/5 rounded-lg opacity-20 text-[10px] font-bold uppercase italic">
                Liste Gizlendi
              </div>
            )}
          </div>

          <div className="bg-zinc-900/40 border border-orange-500/20 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <DatabaseBackup className="text-orange-500 w-4 h-4" />
              <h2 className="text-[10px] font-black uppercase tracking-widest text-orange-500/80">SİSTEM YEDEKLEME (JSON)</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => addLog('Yedek alınıyor...')} className="bg-orange-500/10 text-orange-500 border border-orange-500/20 font-black uppercase text-[10px] h-9 hover:bg-orange-500 hover:text-black transition-all">
                <Download className="w-3.5 h-3.5 mr-2" /> YEDEK İNDİR
              </Button>
              <Button onClick={() => fileInputRef.current?.click()} className="bg-zinc-800 text-zinc-300 font-black uppercase text-[10px] h-9 hover:bg-zinc-700 transition-all">
                <Upload className="w-3.5 h-3.5 mr-2" /> VERİ YÜKLE
              </Button>
            </div>
            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={() => {}} />
          </div>

          {/* Sistem Durum Paneli - Boş kalan alt kısmı doldurur */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
             <div className="flex justify-between items-center text-[10px] font-black italic uppercase">
                <span className="text-primary">Veritabanı Durumu:</span>
                <span className="text-green-500">ÇALIŞIYOR</span>
             </div>
             <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-[70%] bg-primary animate-pulse" />
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
