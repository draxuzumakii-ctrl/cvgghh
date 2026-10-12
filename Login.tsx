import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, Lock, Mail, ArrowRight, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { authService } from '../services/auth.service';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Mohon masukkan email dan password admin.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await authService.login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      let msg = 'Gagal login. Periksa email atau password Anda.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Kredensial salah. Email atau password tidak valid.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Terlalu banyak percobaan gagal. Silakan coba lagi nanti.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    try {
      setLoading(true);
      await authService.resetPassword(resetEmail);
      setResetSent(true);
    } catch (err: any) {
      setError('Gagal mengirim email reset: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Demo credential autofill helper for convenience
  const fillDemoCredentials = () => {
    setEmail('admin@ndraatik.com');
    setPassword('NdraTikAdmin2026!');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-dark-950 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-electric-500/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-electric-500/10 border border-electric-500/30 text-electric-400 mb-4 shadow-electric-glow">
            <Radio className="w-7 h-7 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-['JetBrains_Mono',monospace]">
            NDRATIK <span className="text-electric-400">ADMIN</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 tracking-wide">
            Control Tower · APK Management & Real-time Operations
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel-electric rounded-3xl p-8 border border-white/10 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center justify-between pb-5 border-b border-white/5 mb-6">
            <div>
              <h2 className="text-base font-bold text-white">Admin Authentication</h2>
              <p className="text-xs text-slate-400">Masuk menggunakan akun Firebase Admin</p>
            </div>
            <span className="p-2 rounded-xl bg-electric-500/10 text-electric-400 border border-electric-500/20">
              <Shield className="w-4 h-4" />
            </span>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Email Administrator
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ndraatik.com"
                  required
                  className="w-full glass-input text-xs pl-10 pr-4 py-3 rounded-xl focus:border-electric-500 transition-all placeholder:text-slate-500 font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  className="text-[11px] text-electric-400 hover:text-electric-300 hover:underline"
                >
                  Lupa password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full glass-input text-xs pl-10 pr-4 py-3 rounded-xl focus:border-electric-500 transition-all placeholder:text-slate-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-electric-500 hover:bg-electric-400 text-dark-950 font-bold text-xs tracking-wider uppercase transition-all duration-200 shadow-electric-glow flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-dark-950 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick autofill helper */}
          <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Firebase: adminapk-116ba</span>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="text-[11px] text-slate-400 hover:text-electric-300 underline font-medium"
            >
              Gunakan demo credentials
            </button>
          </div>
        </div>

        {/* Security badge footer */}
        <p className="text-center text-[11px] text-slate-500 mt-6 font-mono">
          Secured with Firebase Authentication · Role-Based Access Control
        </p>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm glass-panel-electric rounded-2xl p-6 border border-white/10">
            <h3 className="text-base font-bold text-white mb-2">Reset Password Admin</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Masukkan alamat email admin Anda untuk menerima link pemulihan kata sandi dari Firebase.
            </p>

            {resetSent ? (
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3 mb-4">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span>Link pemulihan telah dikirim ke email Anda! Periksa inbox atau spam.</span>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="admin@ndraatik.com"
                  required
                  className="w-full glass-input text-xs px-3.5 py-2.5 rounded-xl font-mono"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowResetModal(false); setResetSent(false); }}
                    className="px-3.5 py-2 rounded-xl text-xs text-slate-300 hover:text-white bg-dark-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-electric-500 text-dark-950 hover:bg-electric-400"
                  >
                    {loading ? 'Mengirim...' : 'Kirim Link'}
                  </button>
                </div>
              </form>
            )}

            {resetSent && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => { setShowResetModal(false); setResetSent(false); }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-electric-500 text-dark-950"
                >
                  Tutup
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
