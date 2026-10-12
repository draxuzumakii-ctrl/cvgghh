import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ShieldAlert, 
  Clock, 
  Filter, 
  Search, 
  User, 
  Tag 
} from 'lucide-react';
import { adminsService } from '../services/admins.service';
import { AdminAuditLog } from '../types';
import { Badge } from '../components/common/Badge';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsub = adminsService.subscribeAuditLogs((data) => setLogs(data));
    return () => unsub();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (categoryFilter !== 'ALL' && log.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.adminEmail.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'AUTH': return <Badge variant="primary" size="sm">AUTH</Badge>;
      case 'RELEASES': return <Badge variant="success" size="sm">RELEASES</Badge>;
      case 'CONFIG': return <Badge variant="warning" size="sm">CONFIG</Badge>;
      case 'NOTIFICATIONS': return <Badge variant="neutral" size="sm">NOTIF</Badge>;
      default: return <Badge variant="danger" size="sm">ADMINS</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <FileText className="w-6 h-6 text-electric-400" />
          <span>Security Audit Trail & Activity Logs</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Catatan riwayat seluruh aktivitas penting yang dilakukan oleh administrator untuk keperluan keamanan dan kepatuhan.
        </p>
      </div>

      {/* Logs Table */}
      <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Riwayat Audit Aktivitas</span>
            <Badge variant="primary" size="sm">{filteredLogs.length} Entri</Badge>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari aksi / email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full glass-input text-xs pl-8 pr-3 py-1.5 rounded-lg"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="glass-input text-xs px-2.5 py-1.5 rounded-lg bg-dark-900"
            >
              <option value="ALL">Semua Kategori</option>
              <option value="AUTH">AUTH</option>
              <option value="RELEASES">RELEASES</option>
              <option value="CONFIG">CONFIG</option>
              <option value="NOTIFICATIONS">NOTIFICATIONS</option>
              <option value="ADMINS">ADMINS</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 font-semibold uppercase text-[11px] bg-dark-900/50">
                <th className="py-3.5 px-4">Waktu</th>
                <th className="py-3.5 px-4">Administrator</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Aksi (Action)</th>
                <th className="py-3.5 px-4">Detail Aktivitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-dark-800/40 transition-colors">
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                    {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString('id-ID') : 'Baru saja'}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-white">
                    {log.adminEmail}
                  </td>

                  <td className="py-3.5 px-4">
                    {getCategoryBadge(log.category)}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-electric-400">
                    {log.action}
                  </td>

                  <td className="py-3.5 px-4 text-slate-300 text-xs">
                    {log.details}
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
