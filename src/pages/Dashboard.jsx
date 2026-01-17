import { useState, useEffect } from 'react';
import { useSocket, SOCKET_EVENTS } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { Spinner } from '../components/Loading';
import {
  BarChart3, TrendingUp, Users, ThumbsUp,
  RefreshCw, Star, Activity
} from 'lucide-react';

export default function DashboardPage() {
  const { subscribe, connectedAgents, whatsappStatus } = useSocket();
  const { error: showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [realtimeStats, setRealtimeStats] = useState(null);
  const [trend, setTrend] = useState(null);

  const loadData = async () => {
    try {
      const [statsData, trendData] = await Promise.all([
        api.getRealtimeStats().catch(() => null),
        api.getSurveyTrend(7).catch(() => null),
      ]);
      setRealtimeStats(statsData);
      setTrend(trendData);
    } catch (err) { 
      console.error(err);
      showError('Error al cargar estadísticas'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => { loadData(); }, []);
  
  useEffect(() => {
    const unsub = subscribe(SOCKET_EVENTS.DASHBOARD_SURVEY_UPDATE, loadData);
    return () => unsub?.();
  }, [subscribe]);

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Spinner size="lg" /></div>;

  const stats = realtimeStats || {};
  const counts = stats.counts || {};
  const percentages = stats.percentages || {};

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Panel de Control</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Visión general del rendimiento y métricas en tiempo real.</p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:border-blue-300 hover:text-blue-600 hover:shadow-md transition-all text-sm font-semibold active:scale-95 disabled:opacity-70"
        >
          <RefreshCw size={18} className={refreshing ? 'animate-spin text-blue-600' : 'text-slate-400'} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Agentes Online', value: connectedAgents.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'Estado WhatsApp', value: whatsappStatus === 'connected' ? 'Conectado' : 'Desconectado', icon: Activity, color: whatsappStatus === 'connected' ? 'text-emerald-600' : 'text-rose-600', bg: whatsappStatus === 'connected' ? 'bg-emerald-50' : 'bg-rose-50', border: whatsappStatus === 'connected' ? 'border-emerald-100' : 'border-rose-100' },
          { label: 'Encuestas Totales', value: Number(stats.total || 0), icon: BarChart3, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
          { label: 'Rating Promedio', value: Number(stats.averageRating || 0).toFixed(1), icon: Star, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
                <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">{stat.value}</h3>
              </div>
              <div className={`p-3.5 rounded-xl ${stat.bg} ${stat.color} ${stat.border} border shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon size={24} strokeWidth={2} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Satisfaction Bars */}
        <div className="bg-white p-7 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full">
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2.5">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                <ThumbsUp size={18} />
              </div>
              Nivel de Satisfacción
            </h2>
            <p className="text-xs text-slate-400 mt-1 ml-11">Distribución de calificaciones</p>
          </div>
          
          <div className="space-y-7 flex-1 justify-center flex flex-col">
            {[
              { label: 'Excelente', count: counts.EXCELENTE, pct: percentages.EXCELENTE, color: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
              { label: 'Regular', count: counts.REGULAR, pct: percentages.REGULAR, color: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
              { label: 'Mala', count: counts.MALA, pct: percentages.MALA, color: 'bg-rose-500', bg: 'bg-rose-50', text: 'text-rose-700' },
            ].map((item) => (
               <div key={item.label} className="space-y-2.5">
                  <div className="flex justify-between text-sm items-end">
                    <span className={`font-bold ${item.text} flex items-center gap-2`}>
                      {item.label}
                    </span>
                    <div className="text-right leading-none">
                      <span className="text-slate-800 font-bold text-base block">{item.count || 0}</span>
                      <span className="text-slate-400 text-[10px] font-medium">{Number(item.pct || 0).toFixed(0)}% del total</span>
                    </div>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out shadow-sm`} style={{ width: `${item.pct || 0}%` }} />
                  </div>
               </div>
            ))}
          </div>
        </div>

        {/* Weekly Trend Chart */}
        <div className="lg:col-span-2 bg-white p-7 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full">
           <div className="mb-6 flex justify-between items-start">
             <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2.5">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                    <TrendingUp size={18} />
                  </div>
                  Tendencia Semanal
                </h2>
                <p className="text-xs text-slate-400 mt-1 ml-11">Volumen de encuestas últimos 7 días</p>
             </div>
           </div>

           <div className="flex-1 flex items-end justify-between gap-4 pt-4 px-2 min-h-[240px] border-b border-dashed border-slate-200 relative">
              {/* Background grid lines effect */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-30">
                 <div className="border-t border-slate-100 w-full h-px"></div>
                 <div className="border-t border-slate-100 w-full h-px"></div>
                 <div className="border-t border-slate-100 w-full h-px"></div>
                 <div className="border-t border-slate-100 w-full h-px"></div>
              </div>

              {trend?.data?.map((day) => {
                 const exc = Number(day.EXCELENTE || 0);
                 const reg = Number(day.REGULAR || 0);
                 const bad = Number(day.MALA || 0);
                 const total = exc + reg + bad;
                 const maxVal = Math.max(...trend.data.map(d => Number(d.EXCELENTE||0) + Number(d.REGULAR||0) + Number(d.MALA||0))) || 1;
                 const heightPct = Math.max((total / maxVal) * 100, 5);

                 return (
                    <div key={day.date} className="flex flex-col items-center gap-3 flex-1 h-full justify-end group cursor-pointer z-10">
                       {/* Tooltip on hover */}
                       <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute mb-2 bottom-full bg-slate-800 text-white text-[10px] py-1 px-2 rounded shadow-lg whitespace-nowrap pointer-events-none z-20">
                          Total: {total} (Exc: {exc}, Reg: {reg}, Mal: {bad})
                       </div>

                       <div className="w-full max-w-[48px] flex flex-col-reverse rounded-xl overflow-hidden relative transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl shadow-sm" style={{ height: `${heightPct}%` }}>
                          <div style={{ height: `${(exc/total)*100}%` }} className="w-full bg-emerald-500 transition-colors"></div>
                          <div style={{ height: `${(reg/total)*100}%` }} className="w-full bg-amber-400 transition-colors"></div>
                          <div style={{ height: `${(bad/total)*100}%` }} className="w-full bg-rose-500 transition-colors"></div>
                       </div>
                       <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">
                          {new Date(day.date + 'T00:00:00').toLocaleDateString('es', { weekday: 'short' }).slice(0, 3)}
                       </span>
                    </div>
                 )
              })}
           </div>
        </div>
      </div>
      
    </div>
  );
}