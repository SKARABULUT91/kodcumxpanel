import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertTriangle, Users, Zap, Wifi, Calendar, Activity } from 'lucide-react';

export default function HomePage() {
  const { stats, resetStats, logs, addLog, clearLogs, settings, accounts, campaigns, proxies, scheduledTasks } = useStore();
  const [logFilter, setLogFilter] = useState<'all' | 'error'>('all');

  const statItems = [
    { label: 'BEĞENİ', value: stats.likes, emoji: '❤️' },
    { label: 'RETWEET', value: stats.rts, emoji: '🔁' },
    { label: 'TAKİP', value: stats.follows, emoji: '👤' },
    { label: 'T. BIRAKMA', value: stats.unfollows, emoji: '👋' },
  ];

  const activeAccounts = accounts.filter(a => a.status === 'running' || a.isActive).length;
  const runningCampaigns = campaigns.filter(c => c.status === 'running').length;
  const activeProxies = proxies.filter(p => p.status === 'active').length;
  const pendingTasks = scheduledTasks.filter(t => t.enabled && t.status === 'pending').length;

  const handleReset = () => {
    resetStats();
    addLog('İstatistikler başarıyla sıfırlandı.', 'success');
  };

  const filteredLogs = logFilter === 'error' ? logs.filter((l) => l.type === 'error') : logs;
  const errorCount = logs.filter((l) => l.type === 'error').length;

  return (
    <div>
      {/* System Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase">Hesaplar</div>
            <div className="text-lg font-bold text-foreground">{accounts.length}</div>
            <div className="text-[10px] text-success">{activeAccounts} aktif</div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-warning" />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase">Kampanyalar</div>
            <div className="text-lg font-bold text-foreground">{campaigns.length}</div>
            <div className="text-[10px] text-primary">{runningCampaigns} çalışıyor</div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
            <Wifi className="w-5 h-5 text-success" />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase">Proxy</div>
            <div className="text-lg font-bold text-foreground">{proxies.length}</div>
            <div className="text-[10px] text-success">{activeProxies} aktif</div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/50 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase">Zamanlanmış</div>
            <div className="text-lg font-bold text-foreground">{scheduledTasks.length}</div>
            <div className="text-[10px] text-muted-foreground">{pendingTasks} bekliyor</div>
          </div>
        </div>
      </div>

      {/* Rate Limit */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Activity className="w-4 h-4" /> Saatlik Oran Limiti
          </div>
          <span className="text-xs text-muted-foreground">{stats.likes + stats.rts + stats.follows} / {settings.rateLimitPerHour}</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              ((stats.likes + stats.rts + stats.follows) / settings.rateLimitPerHour) > 0.8
                ? 'bg-destructive'
                : ((stats.likes + stats.rts + stats.follows) / settings.rateLimitPerHour) > 0.5
                  ? 'bg-warning'
                  : 'bg-primary'
            )}
            style={{ width: `${Math.min(100, ((stats.likes + stats.rts + stats.follows) / settings.rateLimitPerHour) * 100)}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        {statItems.map((item) => (
          <div key={item.label} className="bg-card border border-border rounded-lg p-4 lg:p-5">
            <div className="text-[10px] lg:text-xs text-muted-foreground font-medium mb-1.5">{item.emoji} {item.label}</div>
            <div className="text-2xl lg:text-3xl font-bold text-foreground">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" className="border-destructive/20 text-destructive bg-destructive/10 hover:bg-destructive/20" onClick={handleReset}>
          İstatistikleri Sıfırla
        </Button>
      </div>

      {/* Logs */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            📜 Son İşlemler
          </div>
          <div className="flex items-center gap-2">
            <Button variant={logFilter === 'all' ? 'secondary' : 'ghost'} size="sm" className="text-xs h-7" onClick={() => setLogFilter('all')}>Tümü</Button>
            <Button variant={logFilter === 'error' ? 'secondary' : 'ghost'} size="sm" className="text-xs h-7" onClick={() => setLogFilter('error')}>
              <AlertTriangle className="w-3 h-3 mr-1 text-destructive" />Hatalar {errorCount > 0 && `(${errorCount})`}
            </Button>
            <Button variant="ghost" size="sm" className="text-xs h-7 text-muted-foreground" onClick={clearLogs}>Temizle</Button>
          </div>
        </div>
        <div className="bg-background border border-border rounded-lg h-[300px] lg:h-[350px] overflow-y-auto p-3 lg:p-4 font-mono text-[11px] lg:text-xs">
          {filteredLogs.length === 0 ? (
            <div className="text-muted-foreground/50 text-center py-8">
              {logFilter === 'error' ? 'Hata kaydı yok.' : 'Log kaydı yok.'}
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="flex gap-2 py-1 border-b border-card">
                <span className="text-muted-foreground/50 min-w-[50px] lg:min-w-[60px] flex-shrink-0">{log.time}</span>
                <span className={cn(
                  log.type === 'info' && 'text-primary',
                  log.type === 'success' && 'text-success',
                  log.type === 'error' && 'text-destructive',
                  log.type === 'default' && 'text-muted-foreground',
                )}>
                  {log.type === 'error' && '⚠️ '}{log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
