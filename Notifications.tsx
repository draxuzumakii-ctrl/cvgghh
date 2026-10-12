import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Send, 
  Clock, 
  RefreshCw, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles, 
  Info, 
  Users, 
  Layers 
} from 'lucide-react';
import { notificationsService } from '../services/notifications.service';
import { NotificationItem } from '../types';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';

export const Notifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState<'broadcast' | 'update' | 'announcement' | 'maintenance'>('broadcast');
  const [targetAudience, setTargetAudience] = useState('Semua Pengguna (All Devices)');
  const [scheduledAt, setScheduledAt] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  useEffect(() => {
    const unsub = notificationsService.subscribeNotifications((data) => {
      setNotifications(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;

    try {
      setIsSending(true);
      await notificationsService.sendNotification(
        {
          title,
          body,
          type,
          topic: 'ndratik_all',
          status: scheduledAt ? 'SCHEDULED' : 'SENT',
          targetAudience,
          scheduledAt: scheduledAt || null,
          actionUrl: actionUrl || undefined,
          createdBy: user?.email || 'admin@ndraatik.com'
        },
        user?.email || 'admin@ndraatik.com',
        user?.uid || 'uid'
      );

      setSuccessBanner(
        scheduledAt 
          ? 'Notifikasi berhasil dijadwalkan!' 
          : 'Broadcast notifikasi berhasil dikirim ke perangkat Android!'
      );
      setTimeout(() => setSuccessBanner(null), 4000);

      // Reset
      setTitle('');
      setBody('');
      setActionUrl('');
      setScheduledAt('');
    } catch (err) {
      console.error('Failed to send notification:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleResend = async (item: NotificationItem) => {
    try {
      await notificationsService.resendNotification(
        item.id,
        item,
        user?.email || 'admin@ndraatik.com',
        user?.uid || 'uid'
      );
      setSuccessBanner(`Notifikasi "${item.title}" berhasil dikirim ulang!`);
      setTimeout(() => setSuccessBanner(null), 3500);
    } catch (err) {
      console.error('Failed to resend:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationsService.deleteNotification(
        id,
        user?.email || 'admin@ndraatik.com',
        user?.uid || 'uid'
      );
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const getTypeBadge = (notifType: string) => {
    switch (notifType) {
      case 'update': return <Badge variant="primary" size="sm">UPDATE APK</Badge>;
      case 'maintenance': return <Badge variant="danger" size="sm">PEMELIHARAAN</Badge>;
      case 'announcement': return <Badge variant="warning" size="sm">PENGUMUMAN</Badge>;
      default: return <Badge variant="neutral" size="sm">BROADCAST</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Bell className="w-6 h-6 text-electric-400" />
          <span>Broadcast Push Notification</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Kirim notifikasi langsung ke notification bar smartphone pengguna Android melalui Firebase Cloud Messaging.
        </p>
      </div>

      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
          <span className="font-semibold">{successBanner}</span>
        </div>
      )}

      {/* Main Grid: Form Composer & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Composer Form */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 lg:p-8 border border-white/5">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Buat Pesan Notifikasi Baru</span>
          </div>

          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Judul Notifikasi
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: 🚀 Update v2.6.0 Siap Diunduh!"
                required
                className="w-full glass-input text-xs px-4 py-3 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Isi Pesan Notifikasi
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Nikmati fitur unduhan audio tanpa batas dengan performa 2x lebih cepat..."
                rows={3}
                required
                className="w-full glass-input text-xs p-3.5 rounded-xl text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Kategori Notifikasi
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full glass-input text-xs px-3.5 py-2.5 rounded-xl bg-dark-900"
                >
                  <option value="broadcast">Broadcast Umum</option>
                  <option value="update">Update Aplikasi (APK)</option>
                  <option value="announcement">Pengumuman Fitur</option>
                  <option value="maintenance">Pemberitahuan Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Target Pengguna
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full glass-input text-xs px-3.5 py-2.5 rounded-xl bg-dark-900"
                >
                  <option value="Semua Pengguna (All Devices)">Semua Pengguna (All Devices)</option>
                  <option value="Versi Lama (< v2.5.0)">Versi Lama (&lt; v2.5.0)</option>
                  <option value="Android 13+ Only">Android 13+ Only</option>
                  <option value="Pengguna Aktif 7 Hari">Pengguna Aktif 7 Hari</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Action Link / Deep Link (Opsional)
                </label>
                <input
                  type="url"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  placeholder="https://ndraatik.web.app/update"
                  className="w-full glass-input text-xs px-3.5 py-2.5 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Jadwal Pengiriman (Opsional)
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full glass-input text-xs px-3.5 py-2.5 rounded-xl"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
              <button
                type="submit"
                disabled={isSending}
                className="px-6 py-3 text-xs font-bold rounded-xl bg-electric-500 hover:bg-electric-400 text-dark-950 shadow-electric-glow flex items-center gap-2"
              >
                {isSending ? (
                  <span className="w-4 h-4 border-2 border-dark-950 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{scheduledAt ? 'Jadwalkan Notifikasi' : 'Kirim Broadcast Sekarang'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Smartphone Notification Preview Simulation */}
        <div className="glass-panel rounded-3xl p-6 border border-white/5 flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-electric-400" />
              <span>Simulasi Notifikasi Smartphone</span>
            </h2>

            {/* Android System Notification Card Mockup */}
            <div className="p-4 rounded-2xl bg-dark-900 border border-white/10 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-electric-500 flex items-center justify-center text-dark-950 text-[9px] font-bold">
                    N
                  </span>
                  <span className="font-semibold text-slate-300">NdraTik Downloader</span>
                  <span>• sekarang</span>
                </div>
                <Badge variant="primary" size="sm">FCM</Badge>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white leading-tight">
                  {title || 'Judul Notifikasi Akan Tampil Di Sini'}
                </h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-normal line-clamp-3">
                  {body || 'Isi deskripsi lengkap pesan push notification yang diterima di ponsel pengguna.'}
                </p>
              </div>

              {actionUrl && (
                <div className="pt-2 text-[10px] text-electric-400 font-mono truncate">
                  Link: {actionUrl}
                </div>
              )}
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-dark-850/60 border border-white/5 space-y-2 text-xs text-slate-400">
              <p className="font-semibold text-slate-300">Spesifikasi Delivery:</p>
              <div className="flex justify-between">
                <span>Channel:</span>
                <span className="font-mono text-white">ndratik_broadcast</span>
              </div>
              <div className="flex justify-between">
                <span>Priority:</span>
                <span className="font-mono text-emerald-400">HIGH_PRIORITY</span>
              </div>
              <div className="flex justify-between">
                <span>Vibrate & Sound:</span>
                <span className="font-mono text-white">Default Notification</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 text-[11px] text-slate-500 text-center">
            Menggunakan Firebase Cloud Messaging Topic Protocol
          </div>
        </div>
      </div>

      {/* History of Sent Notifications */}
      <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Riwayat Pengiriman Notifikasi</span>
            <Badge variant="primary" size="sm">{notifications.length}</Badge>
          </div>
        </div>

        {notifications.length === 0 && !loading ? (
          <EmptyState
            icon={Bell}
            title="Belum ada riwayat notifikasi"
            description="Kirim pengumuman pertama Anda ke semua perangkat pengguna."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 font-semibold uppercase text-[11px] bg-dark-900/50">
                  <th className="py-3.5 px-4">Pesan & Kategori</th>
                  <th className="py-3.5 px-4">Target Audience</th>
                  <th className="py-3.5 px-4">Status Delivery</th>
                  <th className="py-3.5 px-4">Terkirim / Sukses</th>
                  <th className="py-3.5 px-4">Waktu</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {notifications.map((item) => (
                  <tr key={item.id} className="hover:bg-dark-800/40 transition-colors">
                    <td className="py-4 px-4 max-w-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{item.title}</span>
                          {getTypeBadge(item.type)}
                        </div>
                        <p className="text-[11px] text-slate-300 line-clamp-1">{item.body}</p>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-slate-300 text-xs">
                      {item.targetAudience}
                    </td>

                    <td className="py-4 px-4">
                      <Badge 
                        variant={
                          item.status === 'SENT' ? 'success' : 
                          item.status === 'SCHEDULED' ? 'warning' : 'neutral'
                        }
                      >
                        {item.status}
                      </Badge>
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-electric-400">
                      {item.successCount ? `${item.successCount.toLocaleString()} devices` : '-'}
                    </td>

                    <td className="py-4 px-4 text-[11px] text-slate-400">
                      {item.sentAt?.toDate ? item.sentAt.toDate().toLocaleString('id-ID') : 'Baru saja'}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleResend(item)}
                          title="Kirim Ulang Notifikasi"
                          className="p-2 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-300 hover:text-white transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-electric-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Hapus dari Riwayat"
                          className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
