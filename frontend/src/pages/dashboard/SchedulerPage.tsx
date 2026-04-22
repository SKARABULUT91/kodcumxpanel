import { useState, useEffect, useRef } from 'react'; // useRef ve useEffect eklendi
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Plus, Trash2, Clock, Calendar, ShieldCheck } from 'lucide-react'; // ShieldCheck eklendi
import type { ScheduledTask } from '@/lib/types';

const actionOptions = [
  { value: 'feed-like', label: 'Akış Beğeni' },
  { value: 'feed-rt', label: 'Akış RT' },
  { value: 'target-follow', label: 'Hedef Takip' },
  { value: 'cleanup-unfollow', label: 'Takipten Çıkma' },
  { value: 'campaign', label: 'Kampanya Çalıştır' },
];

const scheduleLabels: Record<string, string> = {
  once: 'Bir Kez',
  hourly: 'Saatlik',
  daily: 'Günlük',
  weekly: 'Haftalık',
};

export default function SchedulerPage() {
  const { scheduledTasks, addScheduledTask, updateScheduledTask, removeScheduledTask, addLog, settings, updateSettings, accounts } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [taskAction, setTaskAction] = useState('feed-like');
  const [taskTarget, setTaskTarget] = useState('');
  const [taskSchedule, setTaskSchedule] = useState<'once' | 'hourly' | 'daily' | 'weekly'>('daily');
  const [taskTime, setTaskTime] = useState('09:00');

  // --- HAYALET MOTORU BAŞLANGIÇ ---
  const workerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Arka planda her dakika başı kontrol yapan işçi
    workerRef.current = setInterval(() => {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', hour12: false });

      scheduledTasks.forEach(task => {
        if (task.enabled && task.status === 'pending' && task.scheduledTime === currentTime) {
          runGhostOperation(task);
        }
      });
    }, 60000);

    return () => { if (workerRef.current) clearInterval(workerRef.current); };
  }, [scheduledTasks]);

  const runGhostOperation = (task: ScheduledTask) => {
    const activeAccount = accounts.find(a => a.isActive);
    if (!activeAccount) return;

    updateScheduledTask(task.id, { status: 'running' });
    
    // Rastgele Kamuflaj Üretimi
    const res = ['1920x1080', '1366x768', '1536x864'][Math.floor(Math.random() * 3)];
    const font = ['Ubuntu', 'Roboto', 'Segoe UI'][Math.floor(Math.random() * 3)];
    const delay = (Math.random() * (4.5 - 2.0) + 2.0).toFixed(2);

    addLog(`🛡️ @${activeAccount.username} için ${task.name} başladı. [${res} | ${font} | ${delay}s]`, 'info');

    // Görevi tamamla (Simülasyon)
    setTimeout(() => {
      updateScheduledTask(task.id, { status: 'completed' });
      addLog(`✅ ${task.name} başarıyla infiltre edildi.`, 'success');
    }, 8000);
  };
  // --- HAYALET MOTORU BİTİŞ ---

  const handleAdd = () => {
    if (!taskName.trim()) return;
    const task: ScheduledTask = {
      id: crypto.randomUUID(),
      name: taskName.trim(),
      action: taskAction,
      target: taskTarget,
      schedule: taskSchedule,
      scheduledTime: taskTime,
      enabled: true,
      status: 'pending',
      nextRun: new Date().toISOString(),
    };
    addScheduledTask(task);
    addLog(`"${task.name}" görevi planlandı.`, 'success');
    setTaskName('');
    setTaskTarget('');
    setShowAdd(false);
  };

  const statusConfig: Record<string, { label: string; class: string }> = {
    pending: { label: 'Bekliyor', class: 'text-muted-foreground bg-muted' },
    running: { label: 'Sızıyor...', class: 'text-primary bg-primary/10 animate-pulse' }, // Running durumuna animasyon eklendi
    completed: { label: 'Tamamlandı', class: 'text-success bg-success/10' },
    failed: { label: 'Başarısız', class: 'text-destructive bg-destructive/10' },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-black italic uppercase tracking-tighter text-primary flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" /> Kodcum Operasyon Merkezi
          </h1>
          <p className="text-xs text-muted-foreground">Görevlerinizi planlayın ve otomatik olarak çalıştırın.</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} size="sm" className="font-bold italic">
          <Plus className="w-4 h-4 mr-1.5" /> Görev Ekle
        </Button>
      </div>

      {/* Smart Scheduling - Tasarımın Aynısı */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">🧠 Akıllı Zamanlama</div>
            <p className="text-xs text-muted-foreground">Twitter'ın yoğun saatlerine göre bot aktivitelerini optimize eder.</p>
          </div>
          <Switch checked={settings.smartScheduling} onCheckedChange={(v) => updateSettings({ smartScheduling: v })} />
        </div>
        {settings.smartScheduling && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Saatlik Oran Limiti</Label>
              <Input type="number" value={settings.rateLimitPerHour} onChange={(e) => updateSettings({ rateLimitPerHour: +e.target.value })} className="h-8 text-xs" />
            </div>
            <div className="flex items-end">
              <p className="text-[10px] text-muted-foreground italic">Aktif Hayalet Koruması: %100</p>
            </div>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="bg-card border border-border rounded-lg p-5 animate-fade-in space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Yeni Zamanlanmış Görev</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold">Görev Adı</Label>
              <Input placeholder="Ör: Sabah Beğeni Turu" value={taskName} onChange={(e) => setTaskName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold">İşlem</Label>
              <select value={taskAction} onChange={(e) => setTaskAction(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {actionOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold">Hedef (Opsiyonel)</Label>
              <Input placeholder="@user veya #hashtag" value={taskTarget} onChange={(e) => setTaskTarget(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold">Periyot</Label>
              <select value={taskSchedule} onChange={(e) => setTaskSchedule(e.target.value as ScheduledTask['schedule'])} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {Object.entries(scheduleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold">Saat</Label>
              <Input type="time" value={taskTime} onChange={(e) => setTaskTime(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} disabled={!taskName.trim()} className="font-bold">Görevi Planla</Button>
            <Button variant="outline" onClick={() => setShowAdd(false)}>İptal</Button>
          </div>
        </div>
      )}

      {/* Liste Bölümü - Tasarımın Aynısı */}
      <div className="space-y-3">
        {scheduledTasks.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-10 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground text-sm">Henüz zamanlanmış görev yok.</p>
          </div>
        ) : (
          scheduledTasks.map((t) => (
            <div key={t.id} className="bg-card border border-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:border-primary/20 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className={cn("w-3.5 h-3.5", t.status === 'running' ? "text-primary animate-spin" : "text-primary")} />
                  <span className="text-foreground font-semibold text-sm">{t.name}</span>
                  <span className={cn('text-[9px] font-black uppercase px-2 py-0.5 rounded-full', statusConfig[t.status].class)}>
                    {statusConfig[t.status].label}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                  {actionOptions.find((a) => a.value === t.action)?.label || t.action} • {scheduleLabels[t.schedule]} • {t.scheduledTime}
                  {t.target && ` • ${t.target}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={t.enabled} onCheckedChange={(v) => updateScheduledTask(t.id, { enabled: v })} />
                <Button size="sm" variant="outline" className="text-xs border-destructive/20 text-destructive hover:bg-destructive/5" onClick={() => removeScheduledTask(t.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
