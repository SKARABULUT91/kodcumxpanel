import { useState } from 'react';
import { useXMasterStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Plus, Trash2, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function ProxyPage() {
  const { proxies, addProxy, removeProxy, addLog } = useXMasterStore();
  const [form, setForm] = useState({ host: '', port: '', username: '', password: '' });

  const handleAdd = async () => {
    if (!form.host || !form.port) return;
    const res = await api.saveProxy(form);
    if (res.success) {
      addProxy(form);
      addLog(`🌐 Proxy eklendi: ${form.host}`, 'success');
      setForm({ host: '', port: '', username: '', password: '' });
    } else {
      addLog(`❌ Hata: ${res.detail}`, 'error');
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
        <h2 className="text-xs font-black uppercase tracking-widest mb-4">Yeni Proxy Ekle</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input placeholder="IP/Host" value={form.host} onChange={e => setForm({...form, host: e.target.value})} />
          <Input placeholder="Port" value={form.port} onChange={e => setForm({...form, port: e.target.value})} />
          <Input placeholder="Kullanıcı" value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
          <Input placeholder="Şifre" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
        </div>
        <Button onClick={handleAdd} className="mt-4 w-full font-black">SİSTEME ENJEKTE ET</Button>
      </div>
      {/* Liste kısmı aynı kalabilir */}
    </div>
  );
}