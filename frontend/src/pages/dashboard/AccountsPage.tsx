import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Shield, User, Lock, Key, Save, Trash2, Globe, Cpu } from 'lucide-react';

export default function AccountsPage() {
  const { accounts, addAccount, removeAccount, setActiveAccount, addLog } = useStore();
  
  // Sadece ekleme formu açık mı kapalı mı kontrolü
  const [showAdd, setShowAdd] = useState(false);
  
  // Form Verileri (Her şey açık ve net)
  const [form, setForm] = useState({
    username: '',
    password: '',
    twoFA: '',
    proxy: '',
    ua: '',
    token: '',
    ct0: ''
  });

  const handleAdd = () => {
    if (!form.username) return;

    addAccount({
      id: crypto.randomUUID(),
      username: form.username.replace('@', ''),
      password: form.password || '',
      twoFASecret: form.twoFA || '',
      proxy: form.proxy || '',
      userAgent: form.ua || '',
      authToken: form.token || '', 
      ct0: form.ct0 || '',         
      isActive: accounts.length === 0,
      status: 'idle'
    });

    addLog(`🛡️ @${form.username} zırhlı modda eklendi.`, 'success');
    setForm({ username: '', password: '', twoFA: '', proxy: '', ua: '', token: '', ct0: '' });
    setShowAdd(false);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* ÜST PANEL */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <h1 className="text-xl font-black uppercase italic tracking-tighter text-primary flex items-center gap-2">
          <Shield size={22} className="fill-primary/10" /> KODCUM AJANS | HESAP MERKEZİ
        </h1>
        <Button 
          onClick={() => setShowAdd(!showAdd)} 
          size="sm" 
          className="font-bold text-[10px] uppercase tracking-widest h-9"
          variant={showAdd ? "destructive" : "default"}
        >
          {showAdd ? 'VAZGEÇ' : 'YENİ HAYALET EKLE'}
        </Button>
      </div>

      {/* TÜM PARAMETRELERİN AÇIK OLDUĞU FORM */}
      {showAdd && (
        <div className="bg-zinc-900 border-2 border-primary/20 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. GRUP: TEMEL BİLGİLER */}
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black text-zinc-400 flex items-center gap-2">
                <User size={12}/> Kullanıcı Adı
              </Label>
              <Input 
                className="bg-black/50 border-white/10 h-11" 
                placeholder="@kullanici_adi"
                value={form.username} 
                onChange={e => setForm({...form, username: e.target.value})} 
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black text-zinc-400 flex items-center gap-2">
                <Lock size={12}/> Şifre (Varsa)
              </Label>
              <Input 
                type="password" 
                className="bg-black/50 border-white/10 h-11" 
                placeholder="••••••••"
                value={form.password} 
                onChange={e => setForm({...form, password: e.target.value})} 
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black text-zinc-400 flex items-center gap-2">
                <Shield size={12}/> 2FA Kodu (Secret Key)
              </Label>
              <Input 
                className="bg-black/50 border-white/10 h-11" 
                placeholder="JBSW..."
                value={form.twoFA} 
                onChange={e => setForm({...form, twoFA: e.target.value})} 
              />
            </div>

            {/* 2. GRUP: SIZMA PARAMETRELERİ (ARIK HER ZAMAN AÇIK) */}
            <div className="space-y-2 p-3 bg-primary/5 rounded-lg border border-primary/10">
              <Label className="text-[10px] uppercase font-black text-primary flex items-center gap-2 italic">
                <Key size={12}/> Sızma Kodu 1: AUTH TOKEN
              </Label>
              <Input 
                className="bg-black border-primary/20 font-mono text-xs h-11" 
                placeholder="auth_token"
                value={form.token} 
                onChange={e => setForm({...form, token: e.target.value})} 
              />
            </div>

            <div className="space-y-2 p-3 bg-primary/5 rounded-lg border border-primary/10">
              <Label className="text-[10px] uppercase font-black text-primary flex items-center gap-2 italic">
                <Key size={12}/> Sızma Kodu 2: CT0 (CSRF)
              </Label>
              <Input 
                className="bg-black border-primary/20 font-mono text-xs h-11" 
                placeholder="ct0"
                value={form.ct0} 
                onChange={e => setForm({...form, ct0: e.target.value})} 
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black text-zinc-400 flex items-center gap-2">
                <Globe size={12}/> Proxy Adresi
              </Label>
              <Input 
                className="bg-black/50 border-white/10 h-11" 
                placeholder="ip:port:user:pass"
                value={form.proxy} 
                onChange={e => setForm({...form, proxy: e.target.value})} 
              />
            </div>

            <div className="lg:col-span-3 space-y-2">
              <Label className="text-[10px] uppercase font-black text-zinc-400 flex items-center gap-2">
                <Cpu size={12}/> Tarayıcı Kimliği (User-Agent)
              </Label>
              <Input 
                className="bg-black/50 border-white/10 h-11" 
                placeholder="Mozilla/5.0..."
                value={form.ua} 
                onChange={e => setForm({...form, ua: e.target.value})} 
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button onClick={handleAdd} className="h-12 px-12 font-black uppercase italic tracking-widest shadow-lg shadow-primary/20">
              <Save size={18} className="mr-2"/> HAYALETİ SİSTEME İŞLE
            </Button>
          </div>
        </div>
      )}

      {/* HESAP KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {accounts.map((acc) => (
          <div key={acc.id} className={cn(
            "p-5 rounded-2xl border-2 transition-all relative overflow-hidden group",
            acc.isActive ? "border-primary bg-primary/5" : "border-white/5 bg-zinc-900/40"
          )}>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className={cn("p-3 rounded-xl", acc.isActive ? "bg-primary text-white" : "bg-white/5 text-zinc-500")}>
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase italic tracking-tighter text-white">@{acc.username}</h3>
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Durum: Beklemede</p>
                </div>
              </div>
              <button onClick={() => removeAccount(acc.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500/30 hover:text-red-500">
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="mt-5 pt-4 border-t border-white/5 flex gap-2">
              {!acc.isActive ? (
                <Button onClick={() => setActiveAccount(acc.id)} variant="secondary" className="w-full h-9 text-[10px] font-black uppercase italic">
                  OPERATÖRÜ DEĞİŞTİR
                </Button>
              ) : (
                <div className="w-full py-2 bg-primary/20 rounded-lg border border-primary/30 text-center">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">AKTİF OPERATÖR</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
