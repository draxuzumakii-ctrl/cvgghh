import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Key, 
  Lock 
} from 'lucide-react';
import { adminsService } from '../services/admins.service';
import { AdminUser, AdminRole } from '../types';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';

export const AdminUsers: React.FC = () => {
  const { user, adminProfile } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [newRole, setNewRole] = useState<AdminRole>('Operator');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsub = adminsService.subscribeAdmins((data) => setAdmins(data));
    return () => unsub();
  }, []);

  const handleOpenEdit = (adm: AdminUser) => {
    setSelectedAdmin(adm);
    setNewRole(adm.role);
  };

  const handleSaveRole = async () => {
    if (!selectedAdmin) return;
    try {
      setIsUpdating(true);
      await adminsService.updateRole(
        selectedAdmin.uid,
        newRole,
        user?.email || 'admin@ndraatik.com',
        user?.uid || 'uid'
      );
      setSuccessMsg(`Role ${selectedAdmin.email} berhasil diubah menjadi ${newRole}`);
      setTimeout(() => setSuccessMsg(null), 3000);
      setSelectedAdmin(null);
    } catch (err) {
      console.error('Failed to change role:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleActive = async (adm: AdminUser) => {
    if (adm.role === 'Owner') {
      alert('Akun Owner tidak dapat dinonaktifkan.');
      return;
    }
    try {
      await adminsService.toggleActive(
        adm.uid,
        !adm.isActive,
        user?.email || 'admin@ndraatik.com',
        user?.uid || 'uid'
      );
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <ShieldCheck className="w-6 h-6 text-electric-400" />
          <span>Pengelolaan Administrator & Akses Role</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Atur peran hak akses (Role-Based Access Control) untuk staf dan pengelola aplikasi NdraTik.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Role Capabilities Reference Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-dark-850 border border-white/5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-xs">Owner</span>
            <Badge variant="primary" size="sm">Superuser</Badge>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Akses penuh ke semua konfigurasi, upload APK, kelola administrator, dan mutasi data database.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-dark-850 border border-white/5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-xs">Admin</span>
            <Badge variant="success" size="sm">Management</Badge>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Dapat upload APK, broadcast notifikasi, dan ubah remote config, tanpa hak menghapus Owner.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-dark-850 border border-white/5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-xs">Operator</span>
            <Badge variant="warning" size="sm">Operations</Badge>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Dapat kirim push notification dan periksa error report tanpa hak mengubah release APK.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-dark-850 border border-white/5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-xs">Viewer</span>
            <Badge variant="neutral" size="sm">Read-Only</Badge>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Hanya dapat melihat statistik dashboard dan analitik perangkat tanpa hak edit data.
          </p>
        </div>
      </div>

      {/* Admins Table */}
      <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Daftar Akun Administrator</span>
            <Badge variant="primary" size="sm">{admins.length} Pengguna</Badge>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 font-semibold uppercase text-[11px] bg-dark-900/50">
                <th className="py-3.5 px-4">Nama & Email</th>
                <th className="py-3.5 px-4">Role Akses</th>
                <th className="py-3.5 px-4">Status Akun</th>
                <th className="py-3.5 px-4">Terdaftar</th>
                <th className="py-3.5 px-4">Terakhir Login</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {admins.map((adm) => (
                <tr key={adm.uid} className="hover:bg-dark-800/40 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-electric-500/10 text-electric-400 border border-electric-500/20 flex items-center justify-center font-bold text-xs uppercase">
                        {adm.displayName?.charAt(0) || adm.email?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <p className="font-bold text-white text-xs">{adm.displayName || 'Admin'}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{adm.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <Badge 
                      variant={
                        adm.role === 'Owner' ? 'primary' : 
                        adm.role === 'Admin' ? 'success' : 
                        adm.role === 'Operator' ? 'warning' : 'neutral'
                      }
                    >
                      {adm.role}
                    </Badge>
                  </td>

                  <td className="py-4 px-4">
                    {adm.isActive ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>AKTIF</span>
                      </span>
                    ) : (
                      <span className="text-rose-400 font-semibold flex items-center gap-1 text-[11px]">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>NONAKTIF</span>
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-4 text-[11px] text-slate-400 font-mono">
                    {adm.createdAt?.toDate ? adm.createdAt.toDate().toLocaleDateString('id-ID') : 'Baru saja'}
                  </td>

                  <td className="py-4 px-4 text-[11px] text-slate-300 font-mono">
                    {adm.lastLoginAt?.toDate ? adm.lastLoginAt.toDate().toLocaleTimeString('id-ID') : 'Hari ini'}
                  </td>

                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(adm)}
                        className="px-2.5 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-300 hover:text-white transition-colors text-xs font-semibold flex items-center gap-1 border border-white/5"
                      >
                        <Edit className="w-3.5 h-3.5 text-electric-400" />
                        <span>Ubah Role</span>
                      </button>

                      {adm.role !== 'Owner' && (
                        <button
                          onClick={() => handleToggleActive(adm)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                            adm.isActive 
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20' 
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                          }`}
                        >
                          {adm.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Role Modal */}
      {selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md glass-panel-electric rounded-3xl p-6 border border-white/10 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Ubah Hak Akses Role</h3>
            <p className="text-xs text-slate-400 font-mono mb-4">{selectedAdmin.email}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Pilih Role Baru
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as AdminRole)}
                  className="w-full glass-input text-xs px-3.5 py-2.5 rounded-xl bg-dark-900"
                >
                  <option value="Owner">Owner (Superuser)</option>
                  <option value="Admin">Admin (Management)</option>
                  <option value="Operator">Operator (Operations)</option>
                  <option value="Viewer">Viewer (Read-Only)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedAdmin(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl bg-dark-800"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveRole}
                  disabled={isUpdating}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-electric-500 hover:bg-electric-400 text-dark-950 shadow-electric-glow"
                >
                  {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
