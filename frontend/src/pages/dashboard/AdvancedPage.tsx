import { useStore } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Zap, ShieldAlert, MousePointer2, Timer, Ban, Target, Cpu } from 'lucide-react';

export default function AdvancedPage() {
  const { settings, updateSettings } = useStore();

  const SelectToggle = ({ label, value, onChange, icon: Icon }: any) => (
    <div className="flex items-center justify-between bg-zinc-900/40 px-4 py-2 rounded-xl border border-white/5 hover:border-primary/20 transition-all">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} className="text-primary opacity-70" />}
        <Label className="mb-0 text-[11px] font-black uppercase tracking-tight cursor-pointer">{label}</Label>
      </div>
      <select
        value={value ? 'true' : 'false'}
        onChange={(e) => onChange(e.target.value === 'true')}
        className="bg-black border border-white/10 rounded-lg px-2 py-1 text-[10px] font-black uppercase text-primary outline-none focus:ring-1 ring-primary/30"
      >
        <option value="true">AKTİF</option>
        <option value="false">KAPALI</option>
      </select>
    </div>
  );

  return (
    <div className="w-full max-w-full space-y-4 px-2 pb-8">
      
      {/* Üst Bilgi */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex flex-col">
          <h1 className="text-xl font-black italic uppercase tracking-tighter text-primary leading-none">GELİŞMİŞ MOTOR AYARLARI</h1>
          <span className="text-[9px] font-bold text-zinc-500 tracking-[0.3em] mt-1">ADVANCED BOT CONFIGURATION</span>
        </div>
        <Cpu className="text-primary/20" size={32} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        
        {/* Hız Ayarları */}
        <div className="bg-zinc-900/40 border border-primary/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="text-yellow-500 animate-pulse" size={18} />
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-yellow-500/80">Hız Kontrolü</h2>
          </div>

          <div className="space-y-6">
            <select
              value={settings.botSpeedProfile}
              onChange={(e) => updateSettings({ botSpeedProfile: e.target.value })}
              className="flex h-[50px] w-full rounded-xl border-2 border-primary/20 bg-black px-4 py-2 text-sm font-black italic text-primary uppercase outline-none"
            >
              <option value="turbo">🚀 Turbo Mode</option>
              <option value="normal">⚡ Standart Operasyon</option>
              <option value="safe">🛡️ Güvenli Sızma</option>
              <option value="slow">🐢 Hayalet Mod</option>
            </select>

            <div className="grid grid-cols-3 gap-3">
              {[
                { l: "Takip", v: settings.speedFollow, k: "speedFollow" },
                { l: "T. Bırak", v: settings.speedUnfollow, k: "speedUnfollow" },
                { l: "Beğeni", v: settings.speedLike, k: "speedLike" },
                { l: "RT", v: settings.speedRT, k: "speedRT" },
                { l: "Kaydırma", v: settings.speedScroll, k: "speedScroll" },
                { l: "Yükleme", v: settings.speedPageLoad, k: "speedPageLoad" }
              ].map((item) => (
                <div key={item.k} className="space-y-1">
                  <Label className="text-[9px] uppercase font-black text-zinc-500 leading-none">{item.l}</Label>
                  <Input 
                    type="number" 
                    value={item.v} 
                    onChange={(e) => updateSettings({ [item.k]: +e.target.value })} 
                    className="h-8 bg-black border-white/5 text-[11px] font-mono text-primary" 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Spam Koruması */}
        <div className="bg-zinc-900/40 border border-destructive/10 rounded-2xl p-5 shadow-2xl">
          <div className="flex items-center gap-2 mb-6 text-destructive">
            <ShieldAlert size={18} />
            <h2 className="text-xs font-black uppercase tracking-[0.2em]">Spam Koruması</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <SelectToggle icon={MousePointer2} label="İnsan Simülasyonu" value={settings.mouseSim} onChange={(v: any) => updateSettings({ mouseSim: v })} />
            <SelectToggle icon={Timer} label="Rastgele Gecikme" value={settings.randomDelay} onChange={(v: any) => updateSettings({ randomDelay: v })} />
            <SelectToggle label="Onaylı Hesaplar" value={settings.verifiedOnly} onChange={(v: any) => updateSettings({ verifiedOnly: v })} />
            <SelectToggle label="Beğenilenleri Atla" value={settings.skipLikedUsers} onChange={(v: any) => updateSettings({ skipLikedUsers: v })} />
          </div>

          <div className="grid grid-cols-3 gap-3 bg-black/40 p-4 rounded-xl border border-white/5">
            <div className="space-y-1">
              <Label className="text-[9px] uppercase font-black text-zinc-500">Yaş (H)</Label>
              <Input type="number" value={settings.maxTweetAge} onChange={(e) => updateSettings({ maxTweetAge: +e.target.value })} className="h-8 bg-black border-white/10 text-[11px]" />
            </div>
            <div className="space-y-1">
              <Label className="text-[9px] uppercase font-black text-zinc-500">Atlama %</Label>
              <Input type="number" value={settings.skipChance} onChange={(e) => updateSettings({ skipChance: +e.target.value })} className="h-8 bg-black border-white/10 text-[11px]" />
            </div>
            <div className="space-y-1">
              <Label className="text-[9px] uppercase font-black text-zinc-500">Retry</Label>
              <Input type="number" value={settings.maxScrollRetries} onChange={(e) => updateSettings({ maxScrollRetries: +e.target.value })} className="h-8 bg-black border-white/10 text-[11px]" />
            </div>
          </div>
        </div>

        {/* Filtreler */}
        <div className="xl:col-span-2 bg-zinc-900/60 border border-white/5 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-primary">
              <Target size={18} />
              <h2 className="text-xs font-black uppercase tracking-[0.2em]">Operasyon Filtresi</h2>
            </div>
            <div className="w-48">
              <SelectToggle label="FİLTRE SİSTEMİ" value={settings.keywordFilterEnabled} onChange={(v: any) => updateSettings({ keywordFilterEnabled: v })} />
            </div>
          </div>

          {settings.keywordFilterEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-red-500 uppercase tracking-widest">🚫 ENGELLE (Blacklist)</Label>
                <Textarea
                  value={settings.blacklistKeywords}
                  onChange={(e) => updateSettings({ blacklistKeywords: e.target.value })}
                  className="h-[100px] bg-black border-red-500/10 text-red-400 font-mono text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-green-500 uppercase tracking-widest">✅ HEDEFLE (Whitelist)</Label>
                <Textarea
                  value={settings.whitelistKeywords}
                  onChange={(e) => updateSettings({ whitelistKeywords: e.target.value })}
                  className="h-[100px] bg-black border-green-500/10 text-green-400 font-mono text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Shadowban */}
        <div className="xl:col-span-2 bg-gradient-to-r from-destructive/10 to-transparent border border-destructive/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4 text-destructive">
            <Ban size={18} />
            <h2 className="text-xs font-black uppercase tracking-[0.3em]">Anti-Shadowban Protokolü</h2>
          </div>
          <div className="flex flex-col md:flex-row gap-6 items-center">
             <div className="w-full md:w-1/3">
                <SelectToggle label="Durum" value={settings.antiShadowbanEnabled} onChange={(v: any) => updateSettings({ antiShadowbanEnabled: v })} />
             </div>
             {settings.antiShadowbanEnabled && (
                <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                   <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-black text-zinc-500">Mola Limiti</Label>
                      <Input type="number" value={settings.actionsBeforeBreak} onChange={(e) => updateSettings({ actionsBeforeBreak: +e.target.value })} className="bg-black border-destructive/20 text-destructive font-black" />
                   </div>
                   <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-black text-zinc-500">Süre (Dk)</Label>
                      <Input type="number" value={settings.breakDuration} onChange={(e) => updateSettings({ breakDuration: +e.target.value })} className="bg-black border-destructive/20 text-destructive font-black" />
                   </div>
                </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
}
