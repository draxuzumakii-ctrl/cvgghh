import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Save, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Smartphone, 
  ShieldAlert, 
  Download, 
  Globe, 
  Layers 
} from 'lucide-react';
import { configService } from '../services/config.service';
import { AppConfig } from '../types';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';

export const RemoteConfig: React.FC = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [formData, setFormData] = useState<Partial<AppConfig>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const unsub = configService.subscribeConfig((data) => {
      setConfig(data);
      setFormData(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleChange = (key: keyof AppConfig, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await configService.updateConfig(
        formData,
        user?.email || 'admin@ndraatik.com',
        user?.uid || 'uid'
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to update config:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('Reset semua konfigurasi ke nilai bawaan?')) {
      configService.getConfig().then((res) => setFormData(res));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <span className="w-8 h-8 border-4 border-electric-500 border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-electric-400" />
            <span>Remote Configuration Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Ubah parameter operasional aplikasi Android secara real-time tanpa perlu menerbitkan update APK baru.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl bg-dark-800 hover:bg-dark-750 transition-colors border border-white/5"
          >
            Reset Form
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
          <span className="font-semibold">Konfigurasi berhasil disimpan dan dipublikasikan ke Firestore! Semua aplikasi mobile akan tersinkronisasi.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Maintenance & Emergency Banner */}
        <div className="glass-panel rounded-3xl p-6 lg:p-8 border border-white/5 space-y-5">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Mode Pemeliharaan & Banner Darurat</h2>
            </div>
            <Badge variant={formData.maintenanceMode ? 'danger' : 'success'}>
              {formData.maintenanceMode ? 'ACTIVE MAINTENANCE' : 'SYSTEM HEALTHY'}
            </Badge>
          </div>

          <div className="p-4 rounded-2xl bg-dark-850/80 border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Toggle Maintenance Mode</p>
              <p className="text-[11px] text-slate-400">Blokir akses sementara pada aplikasi saat update database atau server maintenance.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.maintenanceMode || false}
                onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-dark-750 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Pesan Pemeliharaan Kustom (Maintenance Message)
            </label>
            <textarea
              value={formData.maintenanceMessage || ''}
              onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
              rows={2}
              className="w-full glass-input text-xs p-3 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Teks Pengumuman / Banner Beranda (Home Banner Text)
            </label>
            <input
              type="text"
              value={formData.homeBannerText || ''}
              onChange={(e) => handleChange('homeBannerText', e.target.value)}
              className="w-full glass-input text-xs px-3.5 py-2.5 rounded-xl font-medium"
            />
          </div>
        </div>

        {/* Section 2: Version Enforcement & APK Direct URL */}
        <div className="glass-panel rounded-3xl p-6 lg:p-8 border border-white/5 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-white/5 pb-4">
            <Smartphone className="w-5 h-5 text-electric-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Versi Aplikasi & Pembaruan (APK)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Versi APK Terbaru (Name)
              </label>
              <input
                type="text"
                value={formData.latestVersionName || ''}
                onChange={(e) => handleChange('latestVersionName', e.target.value)}
                className="w-full glass-input text-xs px-3.5 py-2.5 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Kode Versi Terbaru (Code)
              </label>
              <input
                type="number"
                value={formData.latestVersionCode || 10}
                onChange={(e) => handleChange('latestVersionCode', Number(e.target.value))}
                className="w-full glass-input text-xs px-3.5 py-2.5 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Minimal Kode Versi yang Didukung
              </label>
              <input
                type="number"
                value={formData.minSupportedVersionCode || 1}
                onChange={(e) => handleChange('minSupportedVersionCode', Number(e.target.value))}
                className="w-full glass-input text-xs px-3.5 py-2.5 rounded-xl font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              URL Download APK Rilis Terbaru
            </label>
            <input
              type="url"
              value={formData.latestApkUrl || ''}
              onChange={(e) => handleChange('latestApkUrl', e.target.value)}
              className="w-full glass-input text-xs px-3.5 py-2.5 rounded-xl font-mono"
            />
          </div>

          <div className="p-4 rounded-2xl bg-dark-850/80 border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Paksa Update (Force Update Global)</p>
              <p className="text-[11px] text-slate-400">Pengguna wajib memperbarui aplikasi ke versi terbaru agar dapat digunakan.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.forceUpdate || false}
                onChange={(e) => handleChange('forceUpdate', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-dark-750 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-electric-500"></div>
            </label>
          </div>
        </div>

        {/* Section 3: Downloader Limits & Stream Resolvers */}
        <div className="glass-panel rounded-3xl p-6 lg:p-8 border border-white/5 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-white/5 pb-4">
            <Download className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Parameter Batasan Unduhan & Stream Fallback</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Batas Unduhan Bersamaan (Concurrent Tasks)
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={formData.maxDownloadTasks || 3}
                onChange={(e) => handleChange('maxDownloadTasks', Number(e.target.value))}
                className="w-full glass-input text-xs px-3.5 py-2.5 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Maksimal Ukuran File yang Diizinkan (MB)
              </label>
              <input
                type="number"
                value={formData.maxFileSizeMb || 500}
                onChange={(e) => handleChange('maxFileSizeMb', Number(e.target.value))}
                className="w-full glass-input text-xs px-3.5 py-2.5 rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-dark-850/80 border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Direct Stream Fallback Resolver</p>
              <p className="text-[11px] text-slate-400">Aktifkan fallback internal otomatis jika endpoint server TikTok rate-limited.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.directFallbackEnabled ?? true}
                onChange={(e) => handleChange('directFallbackEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-dark-750 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Pesan Error Kustom saat Parsing Gagal (Custom Error Message)
            </label>
            <input
              type="text"
              value={formData.customErrorMessage || ''}
              onChange={(e) => handleChange('customErrorMessage', e.target.value)}
              className="w-full glass-input text-xs px-3.5 py-2.5 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Link Resmi / Mirror Backup (Official Website)
            </label>
            <input
              type="url"
              value={formData.officialLink || ''}
              onChange={(e) => handleChange('officialLink', e.target.value)}
              className="w-full glass-input text-xs px-3.5 py-2.5 rounded-xl font-mono"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 text-xs font-bold rounded-xl bg-electric-500 hover:bg-electric-400 text-dark-950 shadow-electric-glow flex items-center gap-2 uppercase tracking-wider"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-dark-950 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan & Terapkan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
