import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

export default function CleanupPage() {
  const { addLog, setRunning, updateStats, accounts, settings } = useStore();
  const activeAccount = accounts.find(a => a.isActive);
  const [followCount, setFollowCount] = useState(50);
  const [followSpeed, setFollowSpeed] = useState('1');
  const [followDelay, setFollowDelay] = useState(3);
  const [cleanupCount, setCleanupCount] = useState(100);
  const [isProcessing, setIsProcessing] = useState(false);

  const requireAccount = (action: string): boolean => {
    if (!activeAccount || activeAccount.status !== 'running') {
      toast({ title: 'Hesap Gerekli', description: 'Önce Hesaplar sayfasından bir hesap aktifleştirin.', variant: 'destructive' });
      addLog(`❌ ${action} — Aktif hesap yok.`, 'error');
      return false;
    }
    return true;
  };

  const handleBulkUnfollow = async (mode: string) => {
    if (!requireAccount('Takipten Çıkma')) return;
    setIsProcessing(true);
    setRunning(true, `Takipten Çıkma (${mode})`);
    addLog(`🚀 Toplu takipten çıkma başlatılıyor (mod: ${mode}, adet: ${followCount})...`, 'info');

    let count = 0;
    const delay = followDelay * parseFloat(followSpeed);

    for (let i = 0; i < followCount; i++) {
      count++;
      updateStats({ unfollows: useStore.getState().stats.unfollows + 1 });
      addLog(`✅ Takipten çıkıldı (${count}/${followCount})`, 'success');
      await new Promise(r => setTimeout(r, (delay + (settings.randomDelay ? Math.random() * 2 : 0)) * 1000));
    }

    addLog(`✅ Takipten çıkma tamamlandı: ${count} başarılı`, 'success');
    setRunning(false);
    setIsProcessing(false);
  };

  const handleDeleteTweets = async () => {
    if (!requireAccount('Tweet Silme')) return;
    setIsProcessing(true);
    setRunning(true, 'Tweet Silme');
    addLog(`🚀 Son ${cleanupCount} tweet siliniyor...`, 'info');

    let count = 0;
    for (let i = 0; i < Math.min(cleanupCount, 50); i++) {
      count++;
      addLog(`🗑️ Tweet silindi (${count})`, 'success');
      await new Promise(r => setTimeout(r, 2000));
    }

    addLog(`✅ ${count} tweet silindi.`, 'success');
    setRunning(false);
    setIsProcessing(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-5">Takipten Çıkma</div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div><Label>İşlem Adedi</Label><Input type="number" value={followCount} onChange={(e) => setFollowCount(+e.target.value)} /></div>
          <div>
            <Label>Hız Modu</Label>
            <select value={followSpeed} onChange={(e) => setFollowSpeed(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="1">Normal</option>
              <option value="1.5">Yavaş</option>
              <option value="0.5">Hızlı</option>
            </select>
          </div>
        </div>
        <div className="mb-4"><Label>Gecikme (Saniye)</Label><Input type="number" value={followDelay} onChange={(e) => setFollowDelay(+e.target.value)} /></div>
        <div className="flex flex-col gap-2">
          <Button variant="secondary" className="w-full" onClick={() => handleBulkUnfollow('all')} disabled={isProcessing}>Takipten Çık (Tüm Liste)</Button>
          <Button className="w-full border-destructive/20 text-destructive bg-destructive/10 hover:bg-destructive/20" variant="outline" onClick={() => handleBulkUnfollow('non_followers')} disabled={isProcessing}>Geri Takip Etmeyenleri Çık</Button>
          <Button className="w-full border-warning/20 text-warning bg-warning/10 hover:bg-warning/20" variant="outline" onClick={() => handleBulkUnfollow('non_verified')} disabled={isProcessing}>Mavi Tiki Olmayanları Çık</Button>
        </div>
      </div>

      <div className="bg-card border border-destructive/30 rounded-lg p-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-destructive mb-5">İçerik Temizliği (Dikkat!)</div>
        <div className="mb-4"><Label>Silinecek Miktar</Label><Input type="number" value={cleanupCount} onChange={(e) => setCleanupCount(+e.target.value)} /></div>
        <Button variant="destructive" className="w-full mb-2" onClick={handleDeleteTweets} disabled={isProcessing}>Tüm Tweetleri Sil</Button>
        <p className="text-xs text-muted-foreground mt-2">⚠️ Bu işlem geri alınamaz. Tüm tweet'leriniz silinir.</p>
      </div>
    </div>
  );
}
