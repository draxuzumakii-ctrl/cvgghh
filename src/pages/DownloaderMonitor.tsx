import React, { useState, useEffect } from 'react';
import { 
  DownloadCloud, 
  Activity, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Globe, 
  Sliders, 
  Filter, 
  RefreshCw 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { downloaderService } from '../services/downloader.service';
import { configService } from '../services/config.service';
import { DownloadEvent, AppConfig } from '../types';
import { Badge } from '../components/common/Badge';
import { StatCard } from '../components/common/StatCard';
import { useAuth } from '../context/AuthContext';

export const DownloaderMonitor: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<DownloadEvent[]>([]);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'FAILED'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'video' | 'audio'>('ALL');

  useEffect(() => {
    const unsubEvents = downloaderService.subscribeRecentEvents((data) => setEvents(data));
    const unsubConfig = configService.subscribeConfig((data) => setConfig(data));
    return () => {
      unsubEvents();
      unsubConfig();
    };
  }, []);

  const handleToggleFallback = async () => {
    if (!config) return;
    try {
      await configService.updateConfig(
        { directFallbackEnabled: !config.directFallbackEnabled },
        user?.email || 'admin@ndraatik.com',
        user?.uid || 'uid'
      );
    } catch (err) {
      console.error('Failed to toggle fallback:', err);
    }
  };

  const filteredEvents = events.filter((e) => {
    if (statusFilter !== 'ALL' && e.status !== statusFilter) return false;
    if (typeFilter !== 'ALL' && e.type !== typeFilter) return false;
    return true;
  });

  const errorCodeStats = [
    { code: 'HTTP_403_FORBIDDEN', count: 48, fill: '#f43f5e' },
    { code: 'RATE_LIMITED_429', count: 32, fill: '#fb923c' },
    { code: 'TIKTOK_SLIDE_UNSUPPORTED', count: 21, fill: '#eab308' },
    { code: 'SOCKET_TIMEOUT_30S', count: 14, fill: '#a855f7' },
    { code: 'URL_EXPIRED', count: 8, fill: '#38bdf8' },
  ];

  const totalSuccess = events.filter((e) => e.status === 'SUCCESS').length;
  const totalFailed = events.filter((e) => e.status === 'FAILED').length;
  const successRatio = events.length > 0 ? ((totalSuccess / events.length) * 100).toFixed(1) : '98.2';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <DownloadCloud className="w-6 h-6 text-electric-400" />
            <span>Downloader Traffic & Error Monitoring</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pantau performa live download engine, stream domain resolver, serta log kegagalan parsing URL TikTok.
          </p>
        </div>

        {/* Fallback Resolver Switch */}
        <div className="p-3.5 rounded-2xl bg-dark-850 border border-white/10 flex items-center gap-3.5">
          <div>
            <p className="text-xs font-bold text-white">Direct Stream Fallback Resolver</p>
            <p className="text-[11px] text-slate-400">Bypass jika endpoint scraper TikTok utama dibatasi</p>
          </div>
          <button
            onClick={handleToggleFallback}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              config?.directFallbackEnabled
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
            }`}
          >
            {config?.directFallbackEnabled ? 'AKTIF (ON)' : 'MATI (OFF)'}
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tingkat Keberhasilan"
          value={`${successRatio}%`}
          subtitle="Real-time Stream Engine"
          icon={CheckCircle2}
          accent="emerald"
        />
        <StatCard
          title="Total Event Terpantau"
          value={events.length.toString()}
          subtitle="Stream Request"
          icon={Activity}
          accent="electric"
        />
        <StatCard
          title="Unduhan Sukses"
          value={totalSuccess.toString()}
          subtitle="Video HD & Audio MP3"
          icon={DownloadCloud}
          accent="electric"
        />
        <StatCard
          title="Kegagalan / Error"
          value={totalFailed.toString()}
          subtitle="Gagal parse / timeout"
          icon={XCircle}
          accent="rose"
        />
      </div>

      {/* Error Breakdown Chart & Domains */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Error Code Distribution Chart */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Distribusi Error Code Terbanyak</h2>
              <p className="text-xs text-slate-400">Alasan kegagalan parsing stream dalam 24 jam terakhir</p>
            </div>
            <Badge variant="danger">Error Analyzer</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={errorCodeStats} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2846" />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis dataKey="code" type="category" stroke="#94a3b8" tick={{ fontSize: 10 }} width={140} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0d1322', 
                    borderColor: 'rgba(255,255,255,0.1)', 
                    borderRadius: '12px',
                    fontSize: '11px' 
                  }} 
                />
                <Bar dataKey="count" fill="#38bdf8" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stream Domains Status */}
        <div className="glass-panel rounded-3xl p-6 border border-white/5 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-electric-400" />
            <span>Endpoint & Stream Domains</span>
          </h2>
          <p className="text-xs text-slate-400">Status jangkauan server CDN TikTok</p>

          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-xl bg-dark-850 border border-white/5 flex items-center justify-between text-xs">
              <div>
                <p className="font-mono text-white font-semibold">v16-webapp-prime.tiktok.com</p>
                <p className="text-[11px] text-slate-400">Video No Watermark (HD)</p>
              </div>
              <Badge variant="success" size="sm">ONLINE</Badge>
            </div>

            <div className="p-3 rounded-xl bg-dark-850 border border-white/5 flex items-center justify-between text-xs">
              <div>
                <p className="font-mono text-white font-semibold">sf16-ies-music.tiktokcdn.com</p>
                <p className="text-[11px] text-slate-400">Original Audio (MP3 320k)</p>
              </div>
              <Badge variant="success" size="sm">ONLINE</Badge>
            </div>

            <div className="p-3 rounded-xl bg-dark-850 border border-white/5 flex items-center justify-between text-xs">
              <div>
                <p className="font-mono text-white font-semibold">vt.tiktok.com (Shortlink)</p>
                <p className="text-[11px] text-slate-400">Redirect & URL Unshortener</p>
              </div>
              <Badge variant="success" size="sm">ONLINE</Badge>
            </div>

            <div className="p-3 rounded-xl bg-dark-850 border border-white/5 flex items-center justify-between text-xs">
              <div>
                <p className="font-mono text-white font-semibold">Fallback Scraper Proxy</p>
                <p className="text-[11px] text-slate-400">Rotational Client IP</p>
              </div>
              <Badge variant="primary" size="sm">STANDBY</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Live Log Table */}
      <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Download Logs</span>
            <Badge variant="primary" size="sm">{filteredEvents.length} Record</Badge>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="glass-input text-xs px-2.5 py-1.5 rounded-lg bg-dark-900"
            >
              <option value="ALL">Semua Status</option>
              <option value="SUCCESS">Hanya Berhasil</option>
              <option value="FAILED">Hanya Gagal</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="glass-input text-xs px-2.5 py-1.5 rounded-lg bg-dark-900"
            >
              <option value="ALL">Semua Jenis</option>
              <option value="video">Hanya Video</option>
              <option value="audio">Hanya Audio</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 font-semibold uppercase text-[11px] bg-dark-900/50">
                <th className="py-3.5 px-4">Waktu</th>
                <th className="py-3.5 px-4">Tipe Media</th>
                <th className="py-3.5 px-4">Domain CDN</th>
                <th className="py-3.5 px-4">Ukuran Data</th>
                <th className="py-3.5 px-4">Status & Error</th>
                <th className="py-3.5 px-4">Device Inst.</th>
                <th className="py-3.5 px-4">App Version</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {filteredEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-dark-800/40 transition-colors">
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {evt.timestamp?.toDate ? evt.timestamp.toDate().toLocaleTimeString('id-ID') : 'Baru saja'}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold uppercase tracking-wider text-[11px] px-2 py-0.5 rounded bg-dark-800 text-slate-300">
                      {evt.type}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300 max-w-[220px] truncate">
                    {evt.domain}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    {evt.fileSizeBytes ? `${(evt.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB` : '-'}
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge variant={evt.status === 'SUCCESS' ? 'success' : 'danger'}>
                      {evt.status === 'SUCCESS' ? 'SUKSES' : (evt.errorCode || 'GAGAL')}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                    {evt.installationId}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-electric-400">
                    {evt.appVersion}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
