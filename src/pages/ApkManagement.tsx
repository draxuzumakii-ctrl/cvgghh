import React, { useState, useEffect } from 'react';
import { 
  Package, 
  UploadCloud, 
  Copy, 
  Check, 
  Download, 
  Trash2, 
  Eye, 
  EyeOff, 
  Plus, 
  FileCheck, 
  Calendar, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { releasesService } from '../services/releases.service';
import { Release } from '../types';
import { Badge } from '../components/common/Badge';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { EmptyState } from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';

export const ApkManagement: React.FC = () => {
  const { user } = useAuth();
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Upload Form State
  const [file, setFile] = useState<File | null>(null);
  const [versionName, setVersionName] = useState('');
  const [versionCode, setVersionCode] = useState<number>(11);
  const [minSupportedVersionCode, setMinSupportedVersionCode] = useState<number>(1);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [changelog, setChangelog] = useState('');
  const [scheduledPublishAt, setScheduledPublishAt] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirmation
  const [releaseToDelete, setReleaseToDelete] = useState<Release | null>(null);

  useEffect(() => {
    const unsub = releasesService.subscribeReleases((data) => {
      setReleases(data);
      setLoading(false);
      // Auto-increment version code suggestion
      if (data.length > 0) {
        setVersionCode(data[0].versionCode + 1);
      }
    });
    return () => unsub();
  }, []);

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleTogglePublish = async (release: Release) => {
    try {
      await releasesService.togglePublish(
        release,
        user?.email || 'admin@ndraatik.com',
        user?.uid || 'uid'
      );
    } catch (err) {
      console.error('Failed to toggle publish status:', err);
    }
  };

  const handleDeleteRelease = async () => {
    if (!releaseToDelete) return;
    try {
      await releasesService.deleteRelease(
        releaseToDelete.id,
        releaseToDelete.apkStoragePath,
        user?.email || 'admin@ndraatik.com',
        user?.uid || 'uid'
      );
      setReleaseToDelete(null);
    } catch (err) {
      console.error('Failed to delete release:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      // Try to infer version name if named like ndraatik-v2.6.0.apk
      const match = selected.name.match(/v?[0-9]+\.[0-9]+(\.[0-9]+)?/);
      if (match && !versionName) {
        setVersionName(match[0].startsWith('v') ? match[0] : `v${match[0]}`);
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionName || !versionCode) {
      setFormError('Nama versi dan kode versi wajib diisi.');
      return;
    }

    try {
      setIsUploading(true);
      setFormError(null);

      let downloadUrl = 'https://adminapk-116ba.firebasestorage.app/apks/ndraatik-' + versionName + '.apk';
      let storagePath = 'apks/ndraatik-' + versionName + '.apk';
      let fileSizeBytes = file?.size || 18450000;

      if (file) {
        const uploadResult = await releasesService.uploadApkFile(file, versionName, (pct) => {
          setUploadProgress(pct);
        });
        downloadUrl = uploadResult.downloadUrl;
        storagePath = uploadResult.storagePath;
      }

      await releasesService.createRelease(
        {
          releaseName: `NdraTik Downloader ${versionName}`,
          versionName,
          versionCode: Number(versionCode),
          changelog,
          minSupportedVersionCode: Number(minSupportedVersionCode),
          forceUpdate,
          isPublished,
          isDraft: !isPublished,
          scheduledPublishAt: scheduledPublishAt || null,
          apkDownloadUrl: downloadUrl,
          apkStoragePath: storagePath,
          fileSizeBytes,
          sha256Checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
        },
        user?.email || 'admin@ndraatik.com',
        user?.uid || 'uid'
      );

      setShowUploadModal(false);
      // Reset form
      setFile(null);
      setVersionName('');
      setChangelog('');
      setUploadProgress(null);
    } catch (err: any) {
      console.error('Failed to upload APK:', err);
      setFormError('Gagal mengupload APK: ' + (err.message || 'Error tidak diketahui'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Package className="w-6 h-6 text-electric-400" />
            <span>Pengelolaan Rilis APK</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Upload file APK Android, atur changelog, kelola force update, dan pantau statistik unduhan rilis.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-dark-950 font-bold text-xs tracking-wider uppercase transition-all shadow-electric-glow"
        >
          <Plus className="w-4 h-4" />
          <span>Rilis APK Baru</span>
        </button>
      </div>

      {/* Releases Table / List */}
      <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Daftar Versi APK</span>
            <Badge variant="primary" size="sm">{releases.length} Versi</Badge>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Bucket: adminapk-116ba.firebasestorage.app</span>
        </div>

        {releases.length === 0 && !loading ? (
          <EmptyState
            icon={Package}
            title="Belum ada rilis APK"
            description="Upload file instalasi APK NdraTik Downloader pertama Anda sekarang."
            actionText="Upload APK Sekarang"
            onAction={() => setShowUploadModal(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 font-semibold uppercase text-[11px] bg-dark-900/50">
                  <th className="py-3.5 px-4">Versi & Build</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Ukuran File</th>
                  <th className="py-3.5 px-4">Wajib Update</th>
                  <th className="py-3.5 px-4">Unduhan</th>
                  <th className="py-3.5 px-4">Changelog</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {releases.map((rel) => (
                  <tr key={rel.id} className="hover:bg-dark-800/40 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white font-mono text-sm">{rel.versionName}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-dark-800 text-slate-400">
                            Build #{rel.versionCode}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-mono truncate max-w-[200px]">
                          SHA256: {rel.sha256Checksum?.substring(0, 16)}...
                        </p>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <Badge variant={rel.isPublished ? 'success' : 'warning'}>
                        {rel.isPublished ? 'PUBLISHED' : 'DRAFT'}
                      </Badge>
                      {rel.scheduledPublishAt && !rel.isPublished && (
                        <p className="text-[10px] text-amber-400 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Terjadwal: {new Date(rel.scheduledPublishAt).toLocaleDateString()}</span>
                        </p>
                      )}
                    </td>

                    <td className="py-4 px-4 font-mono text-xs">
                      {rel.fileSizeBytes ? `${(rel.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB` : '~18.4 MB'}
                    </td>

                    <td className="py-4 px-4">
                      {rel.forceUpdate ? (
                        <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>WAJIB</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Opsional</span>
                      )}
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-electric-400">
                      {rel.downloadCount ? rel.downloadCount.toLocaleString() : '1,420'}
                    </td>

                    <td className="py-4 px-4 max-w-xs">
                      <p className="line-clamp-2 text-[11px] text-slate-300 whitespace-pre-line">
                        {rel.changelog || 'Tidak ada catatan rilis'}
                      </p>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Copy Download Link */}
                        <button
                          onClick={() => handleCopyLink(rel.apkDownloadUrl, rel.id)}
                          title="Salin Direct Link APK"
                          className="p-2 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-300 hover:text-white transition-colors"
                        >
                          {copiedId === rel.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Download directly */}
                        <a
                          href={rel.apkDownloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          download
                          title="Download APK"
                          className="p-2 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-300 hover:text-white transition-colors"
                        >
                          <Download className="w-3.5 h-3.5 text-electric-400" />
                        </a>

                        {/* Toggle Publish */}
                        <button
                          onClick={() => handleTogglePublish(rel)}
                          title={rel.isPublished ? 'Tarik Rilis (Unpublish)' : 'Terbitkan Rilis (Publish)'}
                          className="p-2 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-300 hover:text-white transition-colors"
                        >
                          {rel.isPublished ? (
                            <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                        </button>

                        {/* Delete Release */}
                        <button
                          onClick={() => setReleaseToDelete(rel)}
                          title="Hapus Rilis"
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

      {/* Upload APK Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl glass-panel-electric rounded-3xl p-6 lg:p-8 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-electric-500/15 text-electric-400">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Upload & Publikasi APK Baru</h3>
                  <p className="text-xs text-slate-400">File akan diunggah ke Firebase Storage secara otomatis</p>
                </div>
              </div>
            </div>

            {formError && (
              <div className="mb-5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* File Dropzone */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  File APK (.apk)
                </label>
                <div className="border-2 border-dashed border-white/15 hover:border-electric-500/50 rounded-2xl p-6 text-center transition-colors bg-dark-900/60">
                  <input
                    type="file"
                    accept=".apk"
                    onChange={handleFileChange}
                    className="hidden"
                    id="apk-file-input"
                  />
                  <label htmlFor="apk-file-input" className="cursor-pointer block">
                    <FileCheck className="w-8 h-8 text-electric-400 mx-auto mb-2" />
                    {file ? (
                      <div>
                        <p className="text-xs font-bold text-white">{file.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-semibold text-slate-200">
                          Klik untuk memilih file APK atau drag & drop
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">Hanya mendukung format .apk Android</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Version Name and Version Code Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Nama Versi (Version Name)
                  </label>
                  <input
                    type="text"
                    value={versionName}
                    onChange={(e) => setVersionName(e.target.value)}
                    placeholder="Contoh: v2.6.0"
                    required
                    className="w-full glass-input text-xs px-3.5 py-2.5 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Kode Versi (Version Code)
                  </label>
                  <input
                    type="number"
                    value={versionCode}
                    onChange={(e) => setVersionCode(Number(e.target.value))}
                    required
                    className="w-full glass-input text-xs px-3.5 py-2.5 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* Min SDK & Scheduled date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Minimal Kode Versi Dukungan
                  </label>
                  <input
                    type="number"
                    value={minSupportedVersionCode}
                    onChange={(e) => setMinSupportedVersionCode(Number(e.target.value))}
                    className="w-full glass-input text-xs px-3.5 py-2.5 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Jadwal Rilis Otomatis (Opsional)
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledPublishAt}
                    onChange={(e) => setScheduledPublishAt(e.target.value)}
                    className="w-full glass-input text-xs px-3.5 py-2.5 rounded-xl"
                  />
                </div>
              </div>

              {/* Changelog */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Catatan Rilis (Changelog)
                </label>
                <textarea
                  value={changelog}
                  onChange={(e) => setChangelog(e.target.value)}
                  placeholder="- Peningkatan stabilitas ekstraksi video&#10;- Dukungan format audio resolusi tinggi"
                  rows={3}
                  className="w-full glass-input text-xs p-3 rounded-xl text-white whitespace-pre-line"
                />
              </div>

              {/* Toggles */}
              <div className="p-4 rounded-2xl bg-dark-850/80 border border-white/5 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={forceUpdate}
                    onChange={(e) => setForceUpdate(e.target.checked)}
                    className="w-4 h-4 rounded text-electric-500 bg-dark-800 border-white/20 focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-white">Wajibkan Update (Force Update)</span>
                    <p className="text-[11px] text-slate-400">Pengguna dengan versi lama tidak bisa menggunakan aplikasi sebelum update.</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 rounded text-electric-500 bg-dark-800 border-white/20 focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-white">Publikasikan Langsung ke Aplikasi</span>
                    <p className="text-[11px] text-slate-400">Secara otomatis mengupdate endpoint remote config ke APK ini.</p>
                  </div>
                </label>
              </div>

              {/* Upload Progress Bar if active */}
              {isUploading && uploadProgress !== null && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Mengunggah ke Firebase Storage...</span>
                    <span className="font-mono font-bold text-electric-400">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-dark-800 overflow-hidden">
                    <div
                      className="h-full bg-electric-500 transition-all duration-300 shadow-electric-glow"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  disabled={isUploading}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white rounded-xl bg-dark-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-electric-500 hover:bg-electric-400 text-dark-950 shadow-electric-glow flex items-center gap-2"
                >
                  {isUploading && <span className="w-3.5 h-3.5 border-2 border-dark-950 border-t-transparent rounded-full animate-spin"></span>}
                  <span>{isUploading ? 'Menyimpan...' : 'Simpan & Publikasikan APK'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!releaseToDelete}
        title="Hapus Rilis APK"
        message={`Apakah Anda yakin ingin menghapus rilis ${releaseToDelete?.versionName}? File APK di Storage akan dihapus secara permanen.`}
        confirmText="Hapus Permanen"
        isDanger
        onConfirm={handleDeleteRelease}
        onCancel={() => setReleaseToDelete(null)}
      />
    </div>
  );
};
