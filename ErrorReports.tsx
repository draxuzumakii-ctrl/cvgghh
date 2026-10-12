import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  CheckCircle2, 
  HelpCircle, 
  Clock, 
  Filter, 
  Search, 
  Edit3, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { errorsService } from '../services/errors.service';
import { ErrorReport } from '../types';
import { Badge } from '../components/common/Badge';
import { StatCard } from '../components/common/StatCard';
import { useAuth } from '../context/AuthContext';

export const ErrorReports: React.FC = () => {
  const { user } = useAuth();
  const [errors, setErrors] = useState<ErrorReport[]>([]);
  const [selectedError, setSelectedError] = useState<ErrorReport | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNRESOLVED' | 'INVESTIGATING' | 'RESOLVED'>('ALL');
  const [newStatus, setNewStatus] = useState<'UNRESOLVED' | 'INVESTIGATING' | 'RESOLVED'>('INVESTIGATING');
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const unsub = errorsService.subscribeErrors((data) => setErrors(data));
    return () => unsub();
  }, []);

  const handleOpenModal = (err: ErrorReport) => {
    setSelectedError(err);
    setNewStatus(err.status);
    setNotes(err.notes || '');
  };

  const handleSaveStatus = async () => {
    if (!selectedError) return;
    try {
      setIsUpdating(true);
      await errorsService.updateErrorStatus(
        selectedError.id,
        newStatus,
        notes,
        user?.email || 'admin@ndraatik.com',
        user?.uid || 'uid'
      );
      // Update local view
      setErrors((prev) =>
        prev.map((e) => (e.id === selectedError.id ? { ...e, status: newStatus, notes } : e))
      );
      setSelectedError(null);
    } catch (err) {
      console.error('Failed to update error status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredErrors = errors.filter((err) => {
    if (statusFilter !== 'ALL' && err.status !== statusFilter) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return <Badge variant="success">RESOLVED</Badge>;
      case 'INVESTIGATING':
        return <Badge variant="warning">INVESTIGATING</Badge>;
      default:
        return <Badge variant="danger">UNRESOLVED</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <AlertOctagon className="w-6 h-6 text-rose-400" />
          <span>Error Reports & Crash Monitoring</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Laporan anomali parsing link, kegagalan download, dan crash stacktrace dari aplikasi mobile pengguna.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Error Laporan"
          value={errors.length.toString()}
          subtitle="Tercatat di sistem"
          icon={AlertOctagon}
          accent="rose"
        />
        <StatCard
          title="Belum Ditangani"
          value={errors.filter((e) => e.status === 'UNRESOLVED').length.toString()}
          subtitle="Butuh investigasi segera"
          icon={AlertTriangle}
          accent="rose"
        />
        <StatCard
          title="Sedang Diselidiki"
          value={errors.filter((e) => e.status === 'INVESTIGATING').length.toString()}
          subtitle="Dalam penanganan dev"
          icon={Clock}
          accent="amber"
        />
        <StatCard
          title="Telah Terselesaikan"
          value={errors.filter((e) => e.status === 'RESOLVED').length.toString()}
          subtitle="Patch diterapkan"
          icon={CheckCircle2}
          accent="emerald"
        />
      </div>

      {/* Error Table */}
      <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Daftar Laporan Error</span>
            <Badge variant="primary" size="sm">{filteredErrors.length}</Badge>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="glass-input text-xs px-3 py-1.5 rounded-lg bg-dark-900"
            >
              <option value="ALL">Semua Status</option>
              <option value="UNRESOLVED">UNRESOLVED</option>
              <option value="INVESTIGATING">INVESTIGATING</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 font-semibold uppercase text-[11px] bg-dark-900/50">
                <th className="py-3.5 px-4">Error Code & Pesan</th>
                <th className="py-3.5 px-4">Komponen / Screen</th>
                <th className="py-3.5 px-4">Versi & OS</th>
                <th className="py-3.5 px-4">Status Penanganan</th>
                <th className="py-3.5 px-4">Catatan Tindakan</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {filteredErrors.map((err) => (
                <tr key={err.id} className="hover:bg-dark-800/40 transition-colors">
                  <td className="py-4 px-4 max-w-sm">
                    <div>
                      <span className="font-mono font-bold text-rose-400 text-xs">{err.errorCode}</span>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{err.message}</p>
                    </div>
                  </td>

                  <td className="py-4 px-4 font-mono text-[11px] text-slate-300">
                    {err.screen}
                  </td>

                  <td className="py-4 px-4 font-mono text-[11px]">
                    <span className="text-electric-400">{err.appVersion}</span>
                    <p className="text-slate-500">Android API {err.androidSdk}</p>
                  </td>

                  <td className="py-4 px-4">
                    {getStatusBadge(err.status)}
                  </td>

                  <td className="py-4 px-4 max-w-xs text-[11px] text-slate-400 italic">
                    {err.notes || 'Belum ada catatan'}
                  </td>

                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => handleOpenModal(err)}
                      className="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-300 hover:text-white transition-colors text-xs font-semibold flex items-center gap-1.5 ml-auto border border-white/5"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-electric-400" />
                      <span>Update</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Status Modal */}
      {selectedError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md glass-panel-electric rounded-3xl p-6 border border-white/10 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Update Status Error</h3>
            <p className="text-xs text-rose-400 font-mono mb-4">{selectedError.errorCode}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Ubah Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full glass-input text-xs px-3.5 py-2.5 rounded-xl bg-dark-900"
                >
                  <option value="UNRESOLVED">UNRESOLVED (Belum Selesai)</option>
                  <option value="INVESTIGATING">INVESTIGATING (Sedang Diperiksa)</option>
                  <option value="RESOLVED">RESOLVED (Terselesaikan)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Catatan Resolusi / Tindakan
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tambahkan catatan solusi atau perbaikan kode..."
                  rows={3}
                  className="w-full glass-input text-xs p-3 rounded-xl text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedError(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl bg-dark-800"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveStatus}
                  disabled={isUpdating}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-electric-500 hover:bg-electric-400 text-dark-950 shadow-electric-glow flex items-center gap-1.5"
                >
                  {isUpdating ? 'Menyimpan...' : 'Simpan Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
