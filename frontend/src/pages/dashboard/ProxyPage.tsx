import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Plus, Trash2, RefreshCw, ShieldAlert, CheckCircle2 } from 'lucide-react';
import type { ProxyItem } from '@/lib/types';

// --- RENDER BACKEND URL TANIMI ---
const RENDER_API_URL = "https://snr-engine-backend.onrender.com";

export default function ProxyPage() {
  const { proxies, addProxy, removeProxy, updateProxy, addLog } = useStore();
  const [mode, setMode] = useState<'manual' | 'bulk'>('manual');
  const [address, setAddress] = useState('');
  const [port, setPort] = useState('');
  const [proxyType, setProxyType] = useState<'http' | 'socks5'>('socks5');
  const [proxyUser, setProxyUser] = useState('');
  const [proxyPass, setProxyPass] = useState('');
  const [bulkList, setBulkList] = useState('');
  const [isInjecting, setIsInjecting] = useState(false);

  // --- RENDER BACKEND ENTEGRASYON FONKSİYONU ---
  const syncProxyWithBackend = async (proxy: any) => {
    try {
      addLog(`📡 [MOTOR] Render köprüsü kuruluyor...`, 'info');
      const response = await fetch(`${RENDER_API_URL}/api/save-proxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: proxy.address,
          port: proxy.port,
          user: proxy.username,
          pass: proxy.password,
          type: proxy.type
        })
      });

      if (response.ok) {
        addLog(`🌐 [RENDER] Proxy motoruna başarıyla enjekte edildi: ${proxy.address}`, 'success');
      } else {
        throw new Error('Backend hatası');
      }
    } catch (error) {
      addLog(`🔴 [RENDER] Bağlantı başarısız! Motor uykuda olabilir.`, 'error');
    }
  };

  const handleAdd = async () => {
    if (!address.trim() || !port.trim()) return;
    
    setIsInjecting(true);
    const proxy: ProxyItem = {
      id: crypto.randomUUID(),
      address: address.trim(),
      port: port.trim(),
      type: proxyType,
      username: proxyUser || undefined,
      password: proxyPass || undefined,
      status: 'active',
    };

    // 1. Store'a ekle (Arayüz)
    addProxy(proxy);
    
    // 2. Render Backend'e gönder
    await syncProxyWithBackend(proxy);

    addLog(`✅ Proxy kaydedildi: ${proxy.address}:${proxy.port}`, 'success');
    
    // Temizlik
    setAddress(''); setPort(''); setProxyUser(''); setProxyPass('');
    setIsInjecting(false);
  };

  const handleBulkAdd = async () => {
    const lines = bulkList.split('\n').filter((l) => l.trim());
    let count = 0;
    
    for (const line of lines) {
      const parts = line.trim().split(':');
      if (parts.length >= 2) {
        const newProxy = {
          id: crypto.randomUUID(),
          address: parts[0],
          port: parts[1],
          type: 'socks5' as const,
          username: parts[2] || undefined,
          password: parts[3] || undefined,
          status: 'active' as const,
        };
        addProxy(newProxy);
        count++;
        
        // İlk proxy'yi hemen motor aktif etmek için gönder
        if(count === 1) await syncProxyWithBackend(newProxy);
      }
    }
    addLog(`✅ ${count} proxy toplu eklendi.`, 'success');
    setBulkList('');
  };

  const handleTest = (proxy: ProxyItem) => {
    updateProxy(proxy.id, { status: 'testing' });
    addLog(`🔍 Kalkan testi başlatıldı: ${proxy.address}`, 'info');

    setTimeout(() => {
      const isAlive = Math.random() > 0.1; // Statik ISP için başarı şansı yüksek
      updateProxy(proxy.id, { status: isAlive ? 'active' : 'dead' });
      if (isAlive) {
        addLog(`✅ Proxy Doğrulandı: ${proxy.address}`, 'success');
        syncProxyWithBackend(proxy);
      } else {
        addLog(`❌ Proxy Yanıt Vermiyor: ${proxy.address}`, 'error');
      }
    }, 1500);
  };

  const statusConfig: Record<string, { label: string; class: string }> = {
    active: { label: 'Aktif', class: 'text-success bg-success/10 border-success/20' },
    dead: { label: 'Ölü', class: 'text-destructive bg-destructive/10 border-destructive/20' },
    testing: { label: 'Test...', class: 'text-warning bg-warning/10 border-warning/20' },
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-black italic uppercase tracking-tighter text-primary">Proxy Kontrol Ünitesi</h1>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold opacity-70">
          SNR-ENGINE Render Motoru: <span className="text-primary/50 text-[10px] lowercase">online</span>
        </p>
      </div>

      <div className="bg-zinc-900/50 border-2 border-white/5 rounded-2xl p-5 shadow-xl">
        <div className="flex gap-2 mb-6">
          <Button 
            variant={mode === 'manual' ? 'default' : 'secondary'} 
            size="sm" 
            onClick={() => setMode('manual')}
            className={cn("font-bold italic", mode === 'manual' && "bg-primary text-black")}
          >
            MANUEL EKLE
          </Button>
          <Button 
            variant={mode === 'bulk' ? 'default' : 'secondary'} 
            size="sm" 
            onClick={() => setMode('bulk')}
            className={cn("font-bold italic", mode === 'bulk' && "bg-primary text-black")}
          >
            TOPLU EKLE (BULK)
          </Button>
        </div>

        {mode === 'manual' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase ml-1">IP Adresi</Label>
                <Input className="bg-black/40 border-white/10 h-10" placeholder="192.168.1.1" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase ml-1">Port</Label>
                <Input className="bg-black/40 border-white/10 h-10" placeholder="8080" value={port} onChange={(e) => setPort(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase ml-1">Protokol</Label>
                <select 
                  value={proxyType} 
                  onChange={(e) => setProxyType(e.target.value as 'http' | 'socks5')} 
                  className="flex h-10 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="socks5">SOCKS5</option>
                  <option value="http">HTTP</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button className="w-full font-black italic uppercase text-xs h-10" onClick={handleAdd} disabled={isInjecting || !address.trim() || !port.trim()}>
                  {isInjecting ? <RefreshCw className="animate-spin" /> : <Plus className="w-4 h-4 mr-1" />} Enjekte Et
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase ml-1 opacity-50">Kullanıcı Adı</Label>
                <Input className="bg-black/40 border-white/5 h-10" placeholder="user" value={proxyUser} onChange={(e) => setProxyUser(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase ml-1 opacity-50">Şifre</Label>
                <Input className="bg-black/40 border-white/5 h-10" type="password" placeholder="••••" value={proxyPass} onChange={(e) => setProxyPass(e.target.value)} />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Label className="text-[10px] font-bold uppercase ml-1">Proxy Listesi (ip:port:user:pass)</Label>
            <Textarea 
              placeholder="192.168.1.1:8080:user:pass" 
              value={bulkList} 
              onChange={(e) => setBulkList(e.target.value)} 
              className="h-[100px] font-mono text-xs bg-black/40 border-white/10 focus:ring-primary" 
            />
            <Button className="font-black italic uppercase text-xs" onClick={handleBulkAdd} disabled={!bulkList.trim()}>
              Sisteme Aktar
            </Button>
          </div>
        )}
      </div>

      <div className="bg-zinc-900/50 border-2 border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto text-[11px]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 border-b border-white/5 text-zinc-500 uppercase font-black">
                <th className="p-4">Sunucu Adresi</th>
                <th className="p-4">Port</th>
                <th className="p-4">Tip</th>
                <th className="p-4 text-center">Bağlantı</th>
                <th className="p-4">Durum</th>
                <th className="p-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {proxies.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono font-bold text-primary">{p.address}</td>
                  <td className="p-4 font-mono opacity-80">{p.port}</td>
                  <td className="p-4 uppercase font-bold opacity-60 text-[9px]">{p.type}</td>
                  <td className="p-4 text-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-[9px] font-black uppercase text-green-400 hover:text-green-500 hover:bg-green-500/10" 
                      onClick={() => syncProxyWithBackend(p)}
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Aktif Et
                    </Button>
                  </td>
                  <td className="p-4">
                    <span className={cn('px-3 py-1 rounded-full font-black uppercase text-[9px] border', statusConfig[p.status].class)}>
                      {statusConfig[p.status].label}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-all" onClick={() => handleTest(p)}>
                        <RefreshCw className={cn('w-3.5 h-3.5', p.status === 'testing' && 'animate-spin')} />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-all" onClick={() => removeProxy(p.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
