import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  ShieldAlert, 
  Smartphone, 
  Bell, 
  Power 
} from 'lucide-react';
import { configService } from '../services/config.service';
import { notificationsService } from '../services/notifications.service';
import { AppConfig } from '../types';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';

export const MaintenanceMode: React.FC = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [scheduledStart, setScheduledStart] = useState('');
  const [scheduledEnd, setScheduledEnd] = useState('');
  const [saving, setSaving] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = configService.subscribeConfig((data) => {
      setConfig(data);
      setMaintenanceMode(data.maintenanceMode);
      setMaintenanceMessage(data.maintenanceMessage);
      setScheduledStart(data.maintenanceScheduledStart || '');
      setScheduledEnd(data.maintenanceScheduledEnd || '');
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await configService.updateConfig(
        {
          maintenanceMode,
          maintenanceMessage,
          maintenanceScheduledStart: scheduledStart || null,
          maintenanceScheduledEnd: scheduledEnd || null
        },
        user?.email || 'admin@ndraatik.com',
        user?.uid || 'uid'
      );
      setStatusMessage('Status pemeliharaan server berhasil diperbarui!');
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err) {
      console.error('Failed to update maintenance settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSendMaintenanceBroadcast = async () => {
    try {
      await notificationsService.sendNotification(
        {
          title: '🛠️ Pemberitahuan Pemeliharaan Server Rutin',
          body: maintenanceMessage || 'NdraTik Downloader sedang dalam pemeliharaan server rutin untuk beberapa waktu.',
          type: 'maintenance',
          topic: 'ndratik_all',
          status: 'SENT',
          targetAudience: 'Semua Pengguna',
          createdBy: user?.email || 'admin@ndraatik.com'
        },
        user?.email || 'admin@ndraatik.com',
        user?.uid || 'uid'
      );
      setAlertSent(true);
      setTimeout(() => setAlertSent(false), 4000);
    } catch (err) {
      console.error('Failed to broadcast maintenance notification:', err);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Wrench className="w-6 h-6 text-amber-400" />
          <span>Emergency Maintenance Control Center</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Kendalikan saklar darurat server, atur jendela jadwal perbaikan, dan broadcast notifikasi ke seluruh pengguna.
        </p>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
          <span className="font-semibold">{statusMessage}</span>
        </div>
      )}

      {alertSent && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5 animate-fadeIn">
          <Bell className="w-5 h-5 shrink-0 text-amber-400" />
          <span className="font-semibold">Push notification pemeliharaan berhasil dikirim ke seluruh ponsel pengguna!</span>
        </div>
      )}

      {/* Main Switch Card */}
      <div className={`p-6 lg:p-8 rounded-3xl border transition-all ${
        maintenanceMode 
          ? 'bg-rose-500/10 border-rose-500/40 shadow-2xl shadow-rose-500/10' 
          : 'glass-panel border-white/5'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${
              maintenanceMode ? 'bg-rose-500/20 text-rose-400 ring-2 ring-rose-500/40' : 'bg-dark-800 text-slate-400'
            }`}>
              <Power className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Status Saklar Pemeliharaan</h2>
                <Badge variant={maintenanceMode ? 'danger' : 'success'}>
                  {maintenanceMode ? 'AKTIF (DOWN)' : 'NONAKTIF (ONLINE)'}
                </Badge>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-lg">
                {maintenanceMode 
                  ? 'Aplikasi Android saat ini terkunci dan menampilkan layar pemeliharaan kepada seluruh pengguna.'
                  : 'Aplikasi Android beroperasi dengan normal untuk seluruh pengguna.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setMaintenanceMode(!maintenanceMode)}
            className={`px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
              maintenanceMode 
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/40' 
                : 'bg-dark-800 hover:bg-dark-750 text-slate-300 hover:text-white border border-white/10'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{maintenanceMode ? 'Nonaktifkan Maintenance' : 'Aktifkan Mode Maintenance'}</span>
          </button>
        </div>
      </div>

      {/* Details & Smartphone Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Form */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 lg:p-8 border border-white/5 space-y-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-3">
            Parameter Pesan & Penjadwalan
          </h3>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Pesan yang Ditampilkan kepada Pengguna
            </label>
            <textarea
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              rows={4}
              placeholder="Contoh: Kami sedang melakukan perbaikan performa database. Layanan akan kembali normal dalam 30 menit."
              className="w-full glass-input text-xs p-3.5 rounded-xl text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Estimasi Mulai (Scheduled Start)
              </label>
              <input
                type="datetime-local"
                value={scheduledStart}
                onChange={(e) => setScheduledStart(e.target.value)}
                className="w-full glass-input text-xs px-3.5 py-2.5 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Estimasi Selesai (Scheduled End)
              </label>
              <input
                type="datetime-local"
                value={scheduledEnd}
                onChange={(e) => setScheduledEnd(e.target.value)}
                className="w-full glass-input text-xs px-3.5 py-2.5 rounded-xl"
              />
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/5">
            <button
              type="button"
              onClick={handleSendMaintenanceBroadcast}
              className="px-4 py-2.5 text-xs font-semibold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-xl transition-colors flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              <span>Broadcast Pengumuman Maintenance ke HP</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 text-xs font-bold rounded-xl bg-electric-500 hover:bg-electric-400 text-dark-950 shadow-electric-glow"
            >
              {saving ? 'Menyimpan...' : 'Terapkan Pengaturan'}
            </button>
          </div>
        </div>

        {/* Smartphone Screen Simulation */}
        <div className="glass-panel rounded-3xl p-6 border border-white/5 flex flex-col items-center text-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-electric-400" />
              <span>Preview Tampilan di Smartphone</span>
            </h3>

            {/* Mock Screen */}
            <div className="w-56 h-96 rounded-3xl bg-dark-950 border-4 border-slate-700 p-4 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-2 w-16 h-3 bg-slate-800 rounded-full"></div>

              <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-400 mb-3 animate-pulse">
                <Wrench className="w-8 h-8" />
              </div>

              <h4 className="text-sm font-bold text-white mb-1.5 font-['JetBrains_Mono']">
                Server Maintenance
              </h4>

              <p className="text-[10px] text-slate-300 leading-relaxed px-2 line-clamp-4">
                {maintenanceMessage || 'Server sedang dalam pemeliharaan rutin. Silakan coba kembali nanti.'}
              </p>

              <div className="mt-4 px-3 py-1.5 rounded-lg bg-dark-850 border border-white/10 text-[9px] text-slate-400 font-mono">
                NdraTik Downloader Engine
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-4">
            Pengguna tidak dapat menggunakan fungsi download selama mode ini aktif.
          </p>
        </div>
      </div>
    </div>
  );
};
