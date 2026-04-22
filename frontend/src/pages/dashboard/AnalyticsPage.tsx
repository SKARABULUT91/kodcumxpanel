import { useStore } from '@/lib/store';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { Card } from '@/components/ui/card';
import { TrendingUp, Users, Heart, Zap, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsPage() {
  const { dailyStats = [], stats } = useStore();

  const pieData = [
    { name: 'Beğeni', value: stats.likes },
    { name: 'Retweet', value: stats.rts },
    { name: 'Takip', value: stats.follows },
    { name: 'T. Bırakma', value: stats.unfollows },
  ].filter((d) => d.value > 0);

  const totalActions = stats.likes + stats.rts + stats.follows + stats.unfollows;
  const avgDaily = dailyStats.length > 0
    ? Math.round(dailyStats.reduce((sum, d) => sum + d.likes + (d.retweets || 0) + d.follows, 0) / dailyStats.length)
    : 0;

  return (
    <div className="space-y-4 w-full max-w-full px-2 animate-in fade-in duration-500">
      
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex flex-col">
          <h1 className="text-xl font-black italic uppercase tracking-tighter text-primary leading-none">ANALİTİK VERİ RADARI</h1>
          <span className="text-[9px] font-bold text-zinc-500 tracking-[0.3em] mt-1">REAL-TIME PERFORMANCE METRICS</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
        <StatCard title="Toplam İşlem" value={totalActions} icon={<Zap size={14}/>} color="text-blue-500" />
        <StatCard title="Günlük Ort." value={avgDaily} icon={<TrendingUp size={14}/>} color="text-green-500" />
        <StatCard title="Etkileşim Oranı" value={totalActions > 0 ? `%${Math.round((stats.likes / totalActions) * 100)}` : '%0'} icon={<Heart size={14}/>} color="text-primary" />
        <StatCard title="Veri Havuzu" value={dailyStats.length} icon={<Activity size={14}/>} color="text-purple-500" />
      </div>

      <Card className="p-4 bg-zinc-900/40 border-white/5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-primary w-3.5 h-3.5" />
            <h3 className="text-[10px] font-black uppercase italic tracking-widest opacity-70">Sistem Geneli Günlük Akış</h3>
          </div>
          <div className="flex gap-4 text-[9px] font-bold uppercase opacity-50">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /> Beğeni</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /> Retweet</span>
          </div>
        </div>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyStats} margin={{ left: -20, right: 10 }}>
              <defs>
                <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#52525b' }} tickFormatter={(v) => typeof v === 'string' ? v.slice(5) : v} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#52525b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#09090b', border: '1px solid #27272a', fontSize: '10px', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="likes" stroke={COLORS[0]} strokeWidth={3} fill="url(#colorLikes)" />
              <Area type="monotone" dataKey="retweets" stroke={COLORS[1]} strokeWidth={2} fill="transparent" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pb-4">
        <Card className="p-4 bg-zinc-900/40 border-white/5">
          <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase italic tracking-widest opacity-70">
            <Users className="text-orange-500 w-3.5 h-3.5" />
            <span>Kullanıcı Kazanım / Kayıp</span>
          </div>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyStats} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#52525b' }} tickFormatter={(v) => typeof v === 'string' ? v.slice(5) : v} axisLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#52525b' }} axisLine={false} />
                <Tooltip contentStyle={{ background: '#09090b', border: '1px solid #27272a', fontSize: '10px' }} />
                <Bar dataKey="follows" fill={COLORS[2]} radius={[2, 2, 0, 0]} barSize={20} />
                <Bar dataKey="unfollows" fill={COLORS[3]} radius={[2, 2, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4 bg-zinc-900/40 border-white/5 flex flex-col items-center">
          <div className="w-full flex items-center gap-2 mb-4 text-[10px] font-black uppercase italic tracking-widest opacity-70">
            <Zap className="text-purple-500 w-3.5 h-3.5" />
            <span>Operasyonel Dağılım</span>
          </div>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={8} dataKey="value" stroke="none">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#09090b', border: '1px solid #27272a', fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: any, icon: any, color: string }) {
  return (
    <Card className="bg-zinc-950/50 border-white/5 p-4 hover:border-primary/40 transition-all group relative overflow-hidden flex flex-col justify-center min-h-[80px]">
      <div className="flex justify-between items-center relative z-10">
        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300 transition-colors">{title}</p>
        <div className={cn("p-1.5 rounded-md bg-white/5", color)}>{icon}</div>
      </div>
      <p className="text-2xl font-black italic mt-1 tracking-tighter relative z-10">{value}</p>
      <div className={cn("absolute -right-4 -bottom-4 w-16 h-16 blur-2xl opacity-5 group-hover:opacity-20 transition-opacity rounded-full", color.replace('text-', 'bg-'))} />
    </Card>
  );
}
