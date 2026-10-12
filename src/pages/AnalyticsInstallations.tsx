import React, { useState, useEffect, useMemo } from 'react';
import {
  Smartphone,
  Users,
  BarChart2,
  Cpu,
  Search,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { installationsService } from '../services/installations.service';
import { Installation } from '../types';
import { Badge } from '../components/common/Badge';
import { StatCard } from '../components/common/StatCard';

function androidVersion(sdk: number): string {
  if (sdk >= 35) return 'Android 15+';
  if (sdk === 34) return 'Android 14';
  if (sdk === 33) return 'Android 13';
  if (sdk === 32 || sdk === 31) return 'Android 12';
  if (sdk === 30) return 'Android 11';
  if (sdk === 29) return 'Android 10';
  if (sdk > 0) return `API ${sdk}`;
  return 'Unknown';
}

function formatDate(value: unknown, includeTime = false): string {
  if (!value) return 'Belum tersedia';
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return 'Belum tersedia';
  return includeTime
    ? date.toLocaleString('id-ID')
    : date.toLocaleDateString('id-ID');
}

export const AnalyticsInstallations: React.FC = () => {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [versionFilter, setVersionFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const unsubscribe = installationsService.subscribeInstallations(
      (data) => {
        setInstallations(data);
        setLoading(false);
        setLoadError('');
      },
      (error) => {
        setLoading(false);
        setLoadError(error.message || 'Gagal membaca data Firestore.');
      }
    );
    return () => unsubscribe();
  }, []);

  const versions = useMemo(
    () => Array.from(new Set(installations.map((item) => item.appVersionName))).sort(),
    [installations]
  );

  const latestVersion = useMemo(() => {
    if (!installations.length) return null;
    return installations.reduce((latest, item) =>
      item.appVersionCode > latest.appVersionCode ? item : latest
    );
  }, [installations]);

  const latestVersionCount = latestVersion
    ? installations.filter((item) => item.appVersionCode === latestVersion.appVersionCode).length
    : 0;
  const latestVersionPercentage = installations.length
    ? ((latestVersionCount / installations.length) * 100).toFixed(1)
    : '0.0';

  const android14Count = installations.filter((item) => item.androidSdk === 34).length;
  const android14Percentage = installations.length
    ? ((android14Count / installations.length) * 100).toFixed(1)
    : '0.0';

  const sdkDistribution = [
    { sdk: 'Android 15+', count: installations.filter((i) => i.androidSdk >= 35).length },
    { sdk: 'Android 14', count: installations.filter((i) => i.androidSdk === 34).length },
    { sdk: 'Android 13', count: installations.filter((i) => i.androidSdk === 33).length },
    { sdk: 'Android 12', count: installations.filter((i) => i.androidSdk === 31 || i.androidSdk === 32).length },
    { sdk: 'Android 11', count: installations.filter((i) => i.androidSdk === 30).length },
    { sdk: 'Android 10 atau lebih lama', count: installations.filter((i) => i.androidSdk > 0 && i.androidSdk <= 29).length },
  ];

  const filteredItems = installations.filter((item) => {
    if (versionFilter !== 'ALL' && item.appVersionName !== versionFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return item.deviceModel.toLowerCase().includes(q)
      || item.installationId.toLowerCase().includes(q)
      || item.appVersionName.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Smartphone className="w-6 h-6 text-electric-400" />
          <span>Analytics & Device Fleet Installations</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Statistik dihitung dari dokumen perangkat nyata pada koleksi Firestore installations.
        </p>
      </div>

      {loadError && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div><p className="font-semibold">Gagal memuat Analytics</p><p className="mt-1 break-words">{loadError}</p><p className="mt-1 text-xs">Periksa koneksi Firebase dan Firestore Security Rules.</p></div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Perangkat Terdaftar" value={loading ? '…' : installations.length.toLocaleString('id-ID')} subtitle="Dokumen aktual Firestore" icon={Users} accent="electric" />
        <StatCard title="Adopsi Versi Tertinggi" value={`${latestVersionPercentage}%`} subtitle={latestVersion ? `${latestVersionCount} perangkat · ${latestVersion.appVersionName}` : 'Belum ada data perangkat'} icon={BarChart2} accent="emerald" />
        <StatCard title="Perangkat Android 14" value={`${android14Percentage}%`} subtitle={`${android14Count} perangkat · API 34`} icon={Cpu} accent="purple" />
        <StatCard title="Laporan Crash" value="Tidak tersedia" subtitle="Pelaporan crash belum dihitung" icon={CheckCircle} accent="amber" />
      </div>

      <div className="glass-panel rounded-3xl p-6 border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div><h2 className="text-base font-bold text-white">Distribusi Versi Android SDK</h2><p className="text-xs text-slate-400">Jumlah perangkat dari data aktual Firestore</p></div>
          <Badge variant="primary">OS Ecosystem</Badge>
        </div>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sdkDistribution} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2846" />
              <XAxis dataKey="sdk" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0d1322', borderColor: 'rgba(0,240,255,0.3)', borderRadius: '12px', fontSize: '12px' }} />
              <Bar dataKey="count" name="Perangkat" fill="#00f0ff" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2"><span className="text-xs font-bold uppercase tracking-wider text-slate-300">Daftar Perangkat Terdaftar</span><Badge variant="primary" size="sm">{filteredItems.length}</Badge></div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64"><Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input type="text" placeholder="Cari model / Device ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full glass-input text-xs pl-8 pr-3 py-1.5 rounded-lg" /></div>
            <select value={versionFilter} onChange={(e) => setVersionFilter(e.target.value)} className="glass-input text-xs px-2.5 py-1.5 rounded-lg bg-dark-900">
              <option value="ALL">Semua Versi</option>
              {versions.map((version) => <option key={version} value={version}>{version}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead><tr className="border-b border-white/5 text-slate-400 font-semibold uppercase text-[11px] bg-dark-900/50"><th className="py-3.5 px-4">Device ID</th><th className="py-3.5 px-4">Model Smartphone</th><th className="py-3.5 px-4">Versi Android</th><th className="py-3.5 px-4">Versi Aplikasi</th><th className="py-3.5 px-4">Pertama Kali Aktif</th><th className="py-3.5 px-4">Terakhir Aktif</th><th className="py-3.5 px-4 text-center">Status Crash</th></tr></thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {loading && <tr><td colSpan={7} className="py-8 text-center text-slate-400">Memuat data Firestore…</td></tr>}
              {!loading && !loadError && filteredItems.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-slate-400">Belum ada data perangkat asli.</td></tr>}
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-dark-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[11px] text-electric-400 font-bold">{item.installationId}</td>
                  <td className="py-3.5 px-4 font-semibold text-white">{item.deviceModel}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">{androidVersion(item.androidSdk)} (API {item.androidSdk || '—'})</td>
                  <td className="py-3.5 px-4"><span className="font-mono text-[11px] px-2 py-0.5 rounded bg-dark-800 text-slate-200 border border-white/5">{item.appVersionName}</span></td>
                  <td className="py-3.5 px-4 text-slate-400 text-[11px]">{formatDate(item.firstSeenAt)}</td>
                  <td className="py-3.5 px-4 text-slate-300 text-[11px] font-mono">{formatDate(item.lastActiveAt, true)}</td>
                  <td className="py-3.5 px-4 text-center">{item.crashCount && item.crashCount > 0 ? <Badge variant="warning" size="sm">{item.crashCount} Crash</Badge> : <Badge variant="success" size="sm">Tidak ada data crash</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
        
