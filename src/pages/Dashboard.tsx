import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  DownloadCloud, 
  CheckCircle2, 
  XCircle, 
  Package, 
  AlertTriangle, 
  Activity, 
  ArrowUpRight, 
  Plus, 
  Bell, 
  Wrench,
  TrendingUp,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { configService } from '../services/config.service';
import { releasesService } from '../services/releases.service';
import { downloaderService } from '../services/downloader.service';
import { AppConfig, Release, DownloadEvent } from '../types';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { adminProfile, user } = useAuth();
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [releases, setReleases] = useState<Release[]>([]);
  const [downloadEvents, setDownloadEvents] = useState<DownloadEvent[]>([]);
  const [isTogglingMaintenance, setIsTogglingMaintenance] = useState(false);
  const [quickAnnouncementText, setQuickAnnouncementText] = useState('');
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  useEffect(() => {
    // Realtime listeners
    const unsubConfig = configService.subscribeConfig((data) => setConfig(data));
    const unsubReleases = releasesService.subscribeReleases((data) => setReleases(data));
    const unsubDownloader = downloaderService.subscribeRecentEvents((data) => setDownloadEvents(data));

    return () => {
      unsubConfig();
      unsubReleases();
      unsubDownloader();
    };
  }, []);

  const handleToggleMaintenance = async () => {
    if (!config) return;
    try {
      setIsTogglingMaintenance(true);
      await configService.updateConfig(
        { maintenanceMode: !config.maintenanceMode },
        user?.email || 'admin@ndraatik.com',
        user?.uid || 'uid'
      );
    } catch (err) {
      console.error('Failed to toggle maintenance:', err);
    } finally {
      setIsTogglingMaintenance(false);
    }
  };

  const handleSendAnnouncement = async () => {
    if (!quickAnnouncementText) return;
    try {
      await configService.updateConfig(
        { homeBannerText: quickAnnouncementText },
        user?.email || 'admin@ndraatik.com',
        user?.uid || 'uid'
      );
      setShowAnnouncementModal(false);
      setQuickAnnouncementText('');
    } catch (err) {
      console.error('Failed to send announcement:', err);
    }
  };

  // Mock Trend Data for Charts
  const downloadTrends = [
    { day: 'Sen', downloads: 2450, success: 2380, failed: 70 },
    { day: 'Sel', downloads: 2980, success: 2890, failed: 90 },
    { day: 'Rab', downloads: 3420, success: 3340, failed: 80 },
    { day: 'Kam', downloads: 4100, success: 4010, failed: 90 },
    { day: 'Jum', downloads: 4890, success: 4760, failed: 130 },
    { day: 'Sab', downloads: 6240, success: 6090, failed: 150 },
    { day: 'Min', downloads: 7100, success: 6940, failed: 160 },
  ];

  const installTrends = [
    { day: 'Sen', installs: 310 },
    { day: 'Sel', installs: 420 },
    { day: 'Rab', installs: 380 },
    { day: 'Kam', installs: 520 },
    { day: 'Jum', installs: 690 },
    { day: 'Sab', installs: 840 },
    { day: 'Min', installs: 950 },
  ];

  const pieData = [
    { name: 'Sukses (No Watermark)', value: 82, color: '#00f0ff' },
    { name: 'Sukses (Audio MP3)', value: 14, color: '#38bdf8' },
    { name: 'Gagal / Timeout', value: 4, color: '#f43f5e' },
  ];

  const latestRelease = releases[0];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner / Hero Greeting */}
      <div className="glass-panel-electric rounded-3xl p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-white/10">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-electric-400">
              Live Operations Online
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Selamat datang, <span className="text-electric-400">{adminProfile?.displayName || user?.email?.split('@')[0] || 'Admin'}</span>
          </h1>
          <p className="text-xs lg:text-sm text-slate-300 mt-1 max-w-xl">
            Semua sistem NdraTik Downloader berjalan optimal. Pantau metrik APK, konfigurasi rilis, dan aktivitas unduhan secara real-time.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => navigate('/releases')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-dark-950 font-bold text-xs tracking-wider uppercase transition-all shadow-electric-glow"
          >
            <Plus className="w-4 h-4" />
            <span>Upload APK Baru</span>
          </button>

          <button
            onClick={() => setShowAnnouncementModal(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-dark-800 hover:bg-dark-750 text-white font-semibold text-xs border border-white/10 transition-colors"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Pengumuman</span>
          </button>

          <button
            onClick={handleToggleMaintenance}
            disabled={isTogglingMaintenance}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
              config?.maintenanceMode
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>{config?.maintenanceMode ? 'Matikan Maintenance' : 'Mode Maintenance'}</span>
          </button>
        </div>
      </div>

      {/* Maintenance alert warning if active */}
      {config?.maintenanceMode && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 flex items-center justify-between text-xs animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <p className="font-bold">Mode Pemeliharaan Sedang AKTIF!</p>
              <p className="text-slate-300">{config.maintenanceMessage}</p>
            </div>
          </div>
          <button
            onClick={handleToggleMaintenance}
            className="px-3 py-1.5 rounded-lg bg-rose-500 text-white font-bold hover:bg-rose-600 transition-colors"
          >
            Nonaktifkan Sekarang
          </button>
        </div>
      )}

      {/* Stat Cards Grid (8 Core Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Instalasi"
          value="128,490"
          subtitle="perangkat terdaftar"
          icon={Users}
          trend={{ value: '14.2% minggu ini', isPositive: true }}
          accent="electric"
        />
        <StatCard
          title="Aktif Hari Ini (DAU)"
          value="34,812"
          subtitle="user unik"
          icon={Activity}
          trend={{ value: '8.6%', isPositive: true }}
          accent="emerald"
        />
        <StatCard
          title="Total Unduhan Sukses"
          value="512,940"
          subtitle="video & audio"
          icon={DownloadCloud}
          trend={{ value: '96.2% success rate', isPositive: true }}
          accent="electric"
        />
        <StatCard
          title="Gagal / Error (24h)"
          value="142"
          subtitle="0.8% dari total request"
          icon={XCircle}
          trend={{ value: '-28%', isPositive: true }}
          accent="rose"
        />
        <StatCard
          title="Versi APK Aktif"
          value={config?.latestVersionName || 'v2.5.0'}
          subtitle={`Build #${config?.latestVersionCode || 10}`}
          icon={Package}
          accent="purple"
        />
        <StatCard
          title="Aktif Bulanan (MAU)"
          value="98,240"
          subtitle="pengguna aktif 30 hari"
          icon={TrendingUp}
          trend={{ value: '22.4%', isPositive: true }}
          accent="emerald"
        />
        <StatCard
          title="Tingkat Keberhasilan"
          value="98.4%"
          subtitle="rata-rata mingguan"
          icon={CheckCircle2}
          accent="emerald"
        />
        <StatCard
          title="Status Endpoint"
          value={config?.maintenanceMode ? 'MAINTENANCE' : 'NORMAL (ONLINE)'}
          subtitle="Direct TikTok Stream Resolver"
          icon={Activity}
          accent={config?.maintenanceMode ? 'amber' : 'emerald'}
        />
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Downloads Chart */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white">Tren Aktivitas Unduhan Harian</h2>
              <p className="text-xs text-slate-400">Total request unduhan 7 hari terakhir</p>
            </div>
            <Badge variant="primary">7 Hari Terakhir</Badge>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={downloadTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="electricGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2846" />
                <XAxis dataKey="day" stroke="#64748b" textAnchor="middle" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0d1322', 
                    borderColor: 'rgba(0,240,255,0.3)', 
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff'
                  }} 
                />
                <Area type="monotone" dataKey="downloads" stroke="#00f0ff" strokeWidth={3} fillOpacity={1} fill="url(#electricGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Download Distribution Pie Chart */}
        <div className="glass-panel rounded-3xl p-6 border border-white/5 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-1">Rasio Jenis Unduhan</h2>
            <p className="text-xs text-slate-400 mb-4">Distribusi video vs audio</p>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0d1322', 
                      borderColor: 'rgba(255,255,255,0.1)', 
                      borderRadius: '12px',
                      fontSize: '11px' 
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/5">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-300">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Latest Release Card & Live Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Release Summary Card */}
        <div className="glass-panel rounded-3xl p-6 border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-electric-400" />
                <span>Rilis APK Terbaru</span>
              </h2>
              <Badge variant={latestRelease?.isPublished ? 'success' : 'warning'}>
                {latestRelease?.isPublished ? 'PUBLISHED' : 'DRAFT'}
              </Badge>
            </div>

            <div className="p-4 rounded-2xl bg-dark-850 border border-white/5 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white font-mono">{config?.latestVersionName || 'v2.5.0'}</h3>
                  <p className="text-xs text-slate-400">Version Code: {config?.latestVersionCode || 10}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-emerald-400">Force Update: {config?.forceUpdate ? 'YA' : 'TIDAK'}</span>
                  <p className="text-[11px] text-slate-500">Min SDK: {config?.minSupportedVersionCode || 1}</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/5 text-xs text-slate-300">
                <p className="font-semibold text-slate-400 mb-1">Catatan Rilis:</p>
                <p className="line-clamp-3 whitespace-pre-line text-[11px] text-slate-300">{config?.changelog || 'Optimalisasi performa'}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/releases')}
            className="w-full py-2.5 rounded-xl bg-dark-800 hover:bg-dark-750 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 border border-white/5 transition-colors"
          >
            <span>Kelola Semua Rilis APK</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Live Downloads Stream */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-electric-400" />
                <span>Live Event Unduhan Terbaru</span>
              </h2>
              <p className="text-xs text-slate-400">Aktivitas real-time dari aplikasi mobile</p>
            </div>
            <button
              onClick={() => navigate('/downloader')}
              className="text-xs text-electric-400 hover:text-electric-300 flex items-center gap-1 font-semibold"
            >
              <span>Lihat Detail</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 font-semibold uppercase text-[11px]">
                  <th className="py-2.5 px-3">Tipe</th>
                  <th className="py-2.5 px-3">Domain Stream</th>
                  <th className="py-2.5 px-3">Ukuran File</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Versi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {downloadEvents.slice(0, 5).map((evt) => (
                  <tr key={evt.id} className="hover:bg-dark-800/50 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-semibold uppercase tracking-wider text-[11px] px-2 py-0.5 rounded bg-dark-800 text-slate-300">
                        {evt.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-300 max-w-[180px] truncate">
                      {evt.domain}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      {evt.fileSizeBytes ? `${(evt.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB` : '-'}
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant={evt.status === 'SUCCESS' ? 'success' : 'danger'} size="sm">
                        {evt.status === 'SUCCESS' ? 'BERHASIL' : (evt.errorCode || 'GAGAL')}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                      {evt.appVersion}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Emergency Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg glass-panel-electric rounded-3xl p-6 border border-white/10 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Broadcast Banner Beranda</h3>
                <p className="text-xs text-slate-400">Pesan ini akan langsung muncul di bar bagian atas aplikasi pengguna.</p>
              </div>
            </div>

            <textarea
              value={quickAnnouncementText}
              onChange={(e) => setQuickAnnouncementText(e.target.value)}
              placeholder="Contoh: ✨ Server unduhan sedang ditingkatkan, mohon tunggu sebentar..."
              rows={4}
              className="w-full glass-input text-xs p-3.5 rounded-xl text-white placeholder:text-slate-500"
            />

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAnnouncementModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl bg-dark-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSendAnnouncement}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-electric-500 hover:bg-electric-400 text-dark-950 shadow-electric-glow"
              >
                Terbitkan ke Aplikasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
