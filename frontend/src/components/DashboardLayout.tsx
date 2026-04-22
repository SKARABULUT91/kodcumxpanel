import { useState, useEffect } from 'react';
import { Home, PlayCircle, UserPlus, Trash2, Database, Settings, Users, Zap, Calendar, BarChart3, Wifi, Menu, X, Ghost } from 'lucide-react';
import { useStore } from '@/lib/store';
import type { PageId } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import HomePage from '@/pages/dashboard/HomePage';
import AutomationPage from '@/pages/dashboard/AutomationPage';
import FollowPage from '@/pages/dashboard/FollowPage';
import CleanupPage from '@/pages/dashboard/CleanupPage';
import DataPage from '@/pages/dashboard/DataPage';
import AdvancedPage from '@/pages/dashboard/AdvancedPage';
import AccountsPage from '@/pages/dashboard/AccountsPage';
import CampaignsPage from '@/pages/dashboard/CampaignsPage';
import SchedulerPage from '@/pages/dashboard/SchedulerPage';
import AnalyticsPage from '@/pages/dashboard/AnalyticsPage';
import ProxyPage from '@/pages/dashboard/ProxyPage';

const navItems: { id: PageId; label: string; icon: typeof Home; group?: string }[] = [
  { id: 'home', label: 'Genel Bakış', icon: Home },
  { id: 'accounts', label: 'Hesaplar', icon: Users },
  { id: 'automation', label: 'Otomasyon', icon: PlayCircle },
  { id: 'campaigns', label: 'Kampanyalar', icon: Zap, group: 'İş Akışı' },
  { id: 'scheduler', label: 'Zamanlayıcı', icon: Calendar },
  { id: 'follow', label: 'Takip Yönetimi', icon: UserPlus, group: 'Araçlar' },
  { id: 'cleanup', label: 'Temizlik', icon: Trash2 },
  { id: 'proxy', label: 'Proxy', icon: Wifi },
  { id: 'analytics', label: 'Analitik', icon: BarChart3, group: 'Raporlar' },
  { id: 'data', label: 'Veri Yönetimi', icon: Database },
  { id: 'advanced', label: 'Ayarlar', icon: Settings, group: 'Sistem' },
];

const pageTitles: Record<PageId, string> = {
  home: 'Genel Bakış',
  accounts: 'Hesap Yönetimi',
  automation: 'Otomasyon',
  campaigns: 'Kampanyalar',
  scheduler: 'Görev Zamanlayıcı',
  follow: 'Takip Yönetimi',
  cleanup: 'Temizlik & Araçlar',
  proxy: 'Proxy Yönetimi',
  analytics: 'Analitik & Raporlar',
  data: 'Veri Yönetimi',
  advanced: 'Gelişmiş Ayarlar',
};

export default function DashboardLayout() {
  const [activePage, setActivePage] = useState<PageId>('home');
  const [botAlive, setBotAlive] = useState(false);
  const { isRunning, activeTask, setRunning, addLog, accounts, sidebarOpen, setSidebarOpen } = useStore();
  const activeAccount = accounts.find(a => a.isActive);

  useEffect(() => {
    const checkBotStatus = async () => {
      try {
        // RENDER BACKEND ADRESİNİ BURAYA BAĞLADIK
        const response = await fetch('https://snr-engine-backend.onrender.com/api/bot-report');
        if (response.ok) {
          setBotAlive(true);
        } else {
          setBotAlive(false);
        }
      } catch (error) {
        setBotAlive(false);
      }
    };

    checkBotStatus();
    const interval = setInterval(checkBotStatus, 10000); // 10 saniyede bir kontrol
    return () => clearInterval(interval);
  }, []);

  const handleStop = () => {
    setRunning(false);
    addLog('Tüm işlemler durduruldu.', 'info');
  };

  const handleNav = (id: PageId) => {
    setActivePage(id);
    setSidebarOpen(false);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'home': return <HomePage />;
      case 'accounts': return <AccountsPage />;
      case 'automation': return <AutomationPage />;
      case 'campaigns': return <CampaignsPage />;
      case 'scheduler': return <SchedulerPage />;
      case 'follow': return <FollowPage />;
      case 'cleanup': return <CleanupPage />;
      case 'proxy': return <ProxyPage />;
      case 'analytics': return <AnalyticsPage />;
      case 'data': return <DataPage />;
      case 'advanced': return <AdvancedPage />;
    }
  };

  let lastGroup = '';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-background/80 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className={cn(
        'fixed lg:static z-50 w-[260px] flex-shrink-0 bg-card border-r border-border flex flex-col h-full transition-transform duration-200',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="flex items-center justify-between p-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg">
              X
            </div>
            <span className="text-foreground text-xl tracking-tight font-bold">X - KODCUM</span>
          </div>
          <button className="lg:hidden text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-0.5 px-4 py-2 overflow-y-auto flex-1">
          {navItems.map((item) => {
            const showGroup = item.group && item.group !== lastGroup;
            if (item.group) lastGroup = item.group;
            return (
              <div key={item.id}>
                {showGroup && (
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-semibold mt-4 mb-1.5 px-3">
                    {item.group}
                  </div>
                )}
                <button
                  onClick={() => handleNav(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    activePage === item.id 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              </div>
            );
          })}
        </nav>
      </div>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-card/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold">{pageTitles[activePage]}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium",
              botAlive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
            )}>
              <div className={cn("w-2 h-2 rounded-full", botAlive ? "bg-green-500 animate-pulse" : "bg-red-500")} />
              {botAlive ? "MOTOR AKTİF" : "MOTOR BAĞLANTISI YOK"}
            </div>
            {isRunning && (
              <Button variant="destructive" size="sm" onClick={handleStop} className="gap-2">
                <X className="w-4 h-4" /> DURDUR
              </Button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
