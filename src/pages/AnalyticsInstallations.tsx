import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Users, 
  BarChart2, 
  Cpu, 
  Filter, 
  Search, 
  CheckCircle, 
  Clock 
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
import { installationsService } from '../services/installations.service';
import { Installation } from '../types';
import { Badge } from '../components/common/Badge';
import { StatCard } from '../components/common/StatCard';

export const AnalyticsInstallations: React.FC = () => {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [versionFilter, setVersionFilter] = useState('ALL');

  useEffect(() => {
    const unsub = installationsService.subscribeInstallations((data) => setInstallations(data));
    return () => unsub();
  }, []);

  const filteredItems = installations.filter((item) => {
    if (versionFilter !== 'ALL' && item.appVersionName !== versionFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.deviceModel.toLowerCase().includes(q) ||
        item.installationId.toLowerCase().includes(q) ||
        item.appVersionName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const sdkDistribution = [
    { sdk: 'Android 14 (API 34)', count: 420 },
    { sdk: 'Android 13 (API 33)', count: 340 },
    { sdk: 'Android 12 (API 31/32)', count: 180 },
    { sdk: 'Android 11 (API 30)', count: 90 },
    { sdk: 'Android 10 & Older', count: 45 },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Smartphone className="w-6 h-6 text-electric-400" />
          <span>Analytics & Device Fleet Installations</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Daftar perangkat Android terdaftar yang menggunakan NdraTik Downloader, model ponsel, serta versi OS Android.
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Perangkat Aktif"
          value="128,490"
          subtitle="Unique Android ID"
          icon={Users}
          accent="electric"
        />
        <StatCard
          title="Adopsi Versi Terbaru"
          value="84.6%"
          subtitle="v2.5.0 Installed"
          icon={BarChart2}
          accent="emerald"
        />
        <StatCard
          title="Dominasi OS Android"
          value="Android 14"
          subtitle="42% total perangkat"
          icon={Cpu}
          accent="purple"
        />
        <StatCard
          title="Crash-Free Users"
          value="99.4%"
          subtitle="Sangat Stabil"
          icon={CheckCircle}
          accent="emerald"
        />
      </div>

      {/* Android SDK Version Distribution Chart */}
      <div className="glass-panel rounded-3xl p-6 border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Distribusi Versi Android SDK</h2>
            <p className="text-xs text-slate-400">Penyebaran level API Android pada perangkat pengguna</p>
          </div>
          <Badge variant="primary">OS Ecosystem</Badge>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sdkDistribution} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2846" />
              <XAxis dataKey="sdk" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0d1322', 
                  borderColor: 'rgba(0,240,255,0.3)', 
                  borderRadius: '12px',
                  fontSize: '12px' 
                }} 
              />
              <Bar dataKey="count" fill="#00f0ff" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Device Installations Table */}
      <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Daftar Perangkat Terdaftar</span>
            <Badge variant="primary" size="sm">{filteredItems.length}</Badge>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari model / Device ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full glass-input text-xs pl-8 pr-3 py-1.5 rounded-lg"
              />
            </div>

            <select
              value={versionFilter}
              onChange={(e) => setVersionFilter(e.target.value)}
              className="glass-input text-xs px-2.5 py-1.5 rounded-lg bg-dark-900"
            >
              <option value="ALL">Semua Versi</option>
              <option value="v2.5.0">v2.5.0</option>
              <option value="v2.4.2">v2.4.2</option>
              <option value="v2.3.0">v2.3.0</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 font-semibold uppercase text-[11px] bg-dark-900/50">
                <th className="py-3.5 px-4">Device ID (Anonymized)</th>
                <th className="py-3.5 px-4">Model Smartphone</th>
                <th className="py-3.5 px-4">Versi Android</th>
                <th className="py-3.5 px-4">Versi Aplikasi</th>
                <th className="py-3.5 px-4">Pertama Kali Aktif</th>
                <th className="py-3.5 px-4">Terakhir Aktif</th>
                <th className="py-3.5 px-4 text-center">Status Crash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-dark-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[11px] text-electric-400 font-bold">
                    {item.installationId}
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-white">
                    {item.deviceModel}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    API {item.androidSdk} ({item.androidSdk >= 34 ? 'Android 14' : item.androidSdk === 33 ? 'Android 13' : 'Android 12'})
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-dark-800 text-slate-200 border border-white/5">
                      {item.appVersionName}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                    {item.firstSeenAt?.toLocaleDateString ? item.firstSeenAt.toLocaleDateString('id-ID') : '5 hari lalu'}
                  </td>

                  <td className="py-3.5 px-4 text-slate-300 text-[11px] font-mono">
                    {item.lastActiveAt?.toLocaleTimeString ? item.lastActiveAt.toLocaleTimeString('id-ID') : 'Baru saja'}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    {item.crashCount && item.crashCount > 0 ? (
                      <Badge variant="warning" size="sm">{item.crashCount} Crash</Badge>
                    ) : (
                      <Badge variant="success" size="sm">Bersih</Badge>
                    )}
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
