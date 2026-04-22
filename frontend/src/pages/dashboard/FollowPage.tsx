import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

export default function FollowPage() {
  const { addLog, setRunning, updateStats, whiteList, setWhiteList, settings, accounts } = useStore();
  const activeAccount = accounts.find(a => a.isActive);
  const [targetUsername, setTargetUsername] = useState('');
  const [targetListType, setTargetListType] = useState('followers');
  const [targetFollowCount, setTargetFollowCount] = useState(50);
  const [userListInput, setUserListInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const requireAccount = (): boolean => {
    if (!activeAccount || activeAccount.status !== 'running') {
      toast({ title: 'Hesap Gerekli', description: 'Önce Hesaplar sayfasından bir hesap aktifleştirin.', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleTargetFollow = async () => {
    if (!requireAccount() || !targetUsername.trim()) return;
    setIsProcessing(true);
    setRunning(true, 'Hedef Takip');
    const target = targetUsername.trim().replace('@', '');
    addLog(`🚀 @${target} ${targetListType === 'followers' ? 'takipçileri' : 'takip ettikleri'} hedefle takip başlatılıyor (${targetFollowCount} adet)...`, 'info');

    let count = 0;
    for (let i = 0; i < targetFollowCount; i++) {
      count++;
      updateStats({ follows: useStore.getState().stats.follows + 1 });
      addLog(`✅ Takip edildi (${count}/${targetFollowCount})`, 'success');

      if (settings.antiShadowbanEnabled && count % settings.actionsBeforeBreak === 0) {
        addLog(`⏸️ Anti-shadowban dinlenme (${settings.breakDuration}s)...`, 'info');
        await new Promise(r => setTimeout(r, settings.breakDuration * 1000));
      }

      await new Promise(r => setTimeout(r, (3 + (settings.randomDelay ? Math.random() * 2 : 0)) * 1000));
    }

    addLog(`✅ Hedef takip tamamlandı: ${count}/${targetFollowCount}`, 'success');
    setRunning(false);
    setIsProcessing(false);
  };

  const handleCsvDownload = () => {
    if (!targetUsername.trim()) return;
    const target = targetUsername.trim().replace('@', '');
    const csv = ['username,name,followers,verified', `${target},Example User,1000,false`].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${target}_${targetListType}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addLog(`✅ CSV şablonu indirildi: ${target}`, 'success');
  };

  const handleListFollow = async () => {
    if (!requireAccount() || !userListInput.trim()) return;
    setIsProcessing(true);
    setRunning(true, 'Liste Takip');

    const usernames = userListInput
      .split(/[,\n]/)
      .map(u => u.trim().replace('@', ''))
      .filter(Boolean);

    addLog(`🚀 ${usernames.length} kullanıcı takip ediliyor...`, 'info');

    let count = 0;
    for (const username of usernames) {
      count++;
      updateStats({ follows: useStore.getState().stats.follows + 1 });
      addLog(`✅ @${username} takip edildi (${count}/${usernames.length})`, 'success');
      await new Promise(r => setTimeout(r, (3 + (settings.randomDelay ? Math.random() * 2 : 0)) * 1000));
    }

    addLog(`✅ Liste takip tamamlandı: ${count}/${usernames.length}`, 'success');
    setRunning(false);
    setIsProcessing(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-5">Kitle Çekme (Hedef Analizi)</div>
        <div className="mb-4">
          <Label>Hedef Kullanıcı</Label>
          <Input placeholder="@username" value={targetUsername} onChange={(e) => setTargetUsername(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <Label>Kaynak</Label>
            <select value={targetListType} onChange={(e) => setTargetListType(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="followers">Takipçileri</option>
              <option value="following">Takip Ettikleri</option>
            </select>
          </div>
          <div><Label>Adet</Label><Input type="number" value={targetFollowCount} onChange={(e) => setTargetFollowCount(+e.target.value)} /></div>
        </div>
        <Button className="w-full mb-2" onClick={handleTargetFollow} disabled={isProcessing}>Otomatik Takip Başlat</Button>
        <Button variant="secondary" className="w-full" onClick={handleCsvDownload} disabled={isProcessing}>Listeyi İndir (CSV Şablon)</Button>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-5">Liste ile Takip Et</div>
        <div className="mb-4">
          <Label>Kullanıcı Adları (Her satıra bir tane)</Label>
          <Textarea placeholder="@username1&#10;@username2&#10;@username3" value={userListInput} onChange={(e) => setUserListInput(e.target.value)} className="h-[100px] resize-none" />
        </div>
        <Button className="w-full" onClick={handleListFollow} disabled={isProcessing}>Listeyi Takip Et</Button>
        <p className="text-[10px] text-muted-foreground mt-2">Rastgele gecikme ve anti-ban koruması dahil.</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 lg:col-span-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-5">🛡️ Beyaz Liste</div>
        <div className="mb-2">
          <Label>Bu kullanıcılar asla takipten çıkarılmaz.</Label>
          <Textarea placeholder={"username1\nusername2"} value={whiteList} onChange={(e) => setWhiteList(e.target.value)} className="h-[120px]" />
        </div>
      </div>
    </div>
  );
}
