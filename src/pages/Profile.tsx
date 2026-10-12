import React, { useState } from 'react';
import { User, Shield, Key, Save, CheckCircle, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { authService } from '../services/auth.service';

export const Profile: React.FC = () => {
  const { user, adminProfile, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(adminProfile?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await refreshProfile();
      setSuccessMsg('Profil berhasil diperbarui!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSendReset = async () => {
    if (!user?.email) return;
    try {
      await authService.resetPassword(user.email);
      setSuccessMsg('Email ganti password telah dikirim ke ' + user.email);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <User className="w-6 h-6 text-electric-400" />
          <span>Profil Administrator</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Informasi identitas akun dan hak akses otoritas di konsol admin NdraTik.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      <div className="glass-panel rounded-3xl p-6 lg:p-8 border border-white/5 space-y-6">
        <div className="flex items-center gap-4 border-b border-white/5 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-electric-500/15 border border-electric-500/30 text-electric-300 flex items-center justify-center font-bold text-2xl uppercase">
            {adminProfile?.displayName?.charAt(0) || user?.email?.charAt(0) || 'A'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{adminProfile?.displayName || user?.email?.split('@')[0]}</h2>
            <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <Badge variant="primary" size="sm">{adminProfile?.role || 'Admin'}</Badge>
              <span className="text-[11px] text-emerald-400 font-medium">● Sesi Aktif</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Email Akun (Firebase Auth)
            </label>
            <input
              type="text"
              disabled
              value={user?.email || ''}
              className="w-full glass-input text-xs px-3.5 py-2.5 rounded-xl font-mono text-slate-400 bg-dark-900 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Nama Tampilan (Display Name)
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full glass-input text-xs px-3.5 py-2.5 rounded-xl text-white"
            />
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-white/5">
            <button
              type="button"
              onClick={handleSendReset}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-dark-800 rounded-xl transition-colors"
            >
              Ganti Password via Email
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-electric-500 hover:bg-electric-400 text-dark-950 shadow-electric-glow"
            >
              {saving ? 'Menyimpan...' : 'Simpan Profil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
