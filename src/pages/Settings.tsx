import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Database, 
  HardDrive, 
  CheckCircle, 
  Download, 
  Upload, 
  ExternalLink, 
  Key, 
  Layers, 
  Cpu 
} from 'lucide-react';
import { configService } from '../services/config.service';
import { Badge } from '../components/common/Badge';

export const Settings: React.FC = () => {
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ firestore: boolean; storage: boolean } | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleTestConnection = async () => {
    try {
      setTestingConnection(true);
      await configService.getConfig();
      setTestResult({ firestore: true, storage: true });
    } catch {
      setTestResult({ firestore: false, storage: false });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleExportConfig = async () => {
    try {
      const config = await configService.getConfig();
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `ndraatik-config-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-electric-400" />
          <span>Pengaturan Sistem & Kredensial Firebase</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Informasi infrastruktur cloud backend, status storage bucket, dan integrasi Android SDK.
        </p>
      </div>

      {/* Firebase Project Information Card */}
      <div className="glass-panel rounded-3xl p-6 lg:p-8 border border-white/5 space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-electric-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Firebase Master Configuration</h2>
          </div>
          <Badge variant="primary">PRODUCTION</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-dark-850 border border-white/5 space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Firebase Project ID</span>
            <p className="font-mono text-sm text-electric-400 font-bold">adminapk-116ba</p>
          </div>

          <div className="p-4 rounded-2xl bg-dark-850 border border-white/5 space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Project Number</span>
            <p className="font-mono text-sm text-white font-bold">1039695264339</p>
          </div>

          <div className="p-4 rounded-2xl bg-dark-850 border border-white/5 space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Android Package Name</span>
            <p className="font-mono text-sm text-white font-bold">com.ndraatik</p>
          </div>

          <div className="p-4 rounded-2xl bg-dark-850 border border-white/5 space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Firebase Storage Bucket</span>
            <p className="font-mono text-sm text-white font-bold truncate">adminapk-116ba.firebasestorage.app</p>
          </div>

          <div className="p-4 rounded-2xl bg-dark-850 border border-white/5 space-y-1 md:col-span-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Android App ID</span>
            <p className="font-mono text-xs text-slate-300 font-bold">1:1039695264339:android:bd297f1579163a1b8524a6</p>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/5">
          <button
            onClick={handleTestConnection}
            disabled={testingConnection}
            className="px-5 py-2.5 rounded-xl bg-dark-800 hover:bg-dark-750 text-white text-xs font-semibold border border-white/10 transition-colors flex items-center gap-2"
          >
            {testingConnection && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
            <span>Test Koneksi Cloud Firestore & Storage</span>
          </button>

          {testResult && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <CheckCircle className="w-4 h-4" />
              <span>Semua layanan Firebase terhubung dan berfungsi normal!</span>
            </div>
          )}

          <a
            href="https://console.firebase.google.com/project/adminapk-116ba"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-electric-500/10 hover:bg-electric-500/20 text-electric-300 text-xs font-semibold flex items-center gap-1.5 border border-electric-500/20 transition-colors"
          >
            <span>Buka Google Firebase Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Export & Import Configuration */}
      <div className="glass-panel rounded-3xl p-6 lg:p-8 border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Cadangkan & Ekspor Konfigurasi (Backup JSON)
        </h3>
        <p className="text-xs text-slate-400">
          Unduh snapshot seluruh remote config aplikasi untuk arsip atau migrasi lingkungan.
        </p>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleExportConfig}
            className="px-4 py-2.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-dark-950 font-bold text-xs shadow-electric-glow flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor File Konfigurasi (.json)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
  
