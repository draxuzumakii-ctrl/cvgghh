import { doc, getDoc, setDoc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { AppConfig } from '../types';
import { authService } from './auth.service';

const CONFIG_DOC_PATH = 'appConfig/global';

export const defaultConfig: AppConfig = {
  maintenanceMode: false,
  maintenanceMessage: 'NdraTik Downloader sedang dalam pemeliharaan server rutin. Silakan coba beberapa saat lagi.',
  maintenanceScheduledStart: null,
  maintenanceScheduledEnd: null,
  homeBannerText: '✨ Versi baru telah tersedia dengan kecepatan download lebih stabil!',
  officialLink: 'https://ndraatik.web.app',
  announcement: '',
  minSupportedVersionCode: 1,
  latestVersionCode: 10,
  latestVersionName: 'v2.5.0',
  latestApkUrl: 'https://adminapk-116ba.firebasestorage.app/apks/ndraatik-v2.5.0.apk',
  forceUpdate: false,
  changelog: '- Peningkatan kecepatan download multi-thread\n- Perbaikan unduhan audio MP3\n- Optimalisasi pemutar musik latar belakang',
  maxDownloadTasks: 3,
  maxFileSizeMb: 500,
  directFallbackEnabled: true,
  customErrorMessage: 'Gagal mengambil video. Pastikan link TikTok valid atau akun tidak di-private.'
};

export const configService = {
  // Get current config
  async getConfig(): Promise<AppConfig> {
    try {
      const configRef = doc(db, 'appConfig', 'global');
      const snap = await getDoc(configRef);
      if (snap.exists()) {
        return snap.data() as AppConfig;
      } else {
        // Seed initial config
        await setDoc(configRef, {
          ...defaultConfig,
          updatedAt: serverTimestamp(),
          updatedBy: 'System Bootstrap'
        });
        return defaultConfig;
      }
    } catch (err) {
      console.warn('Using default config fallback:', err);
      return defaultConfig;
    }
  },

  // Subscribe to real-time config updates
  subscribeConfig(callback: (config: AppConfig) => void) {
    const configRef = doc(db, 'appConfig', 'global');
    return onSnapshot(configRef, (snap) => {
      if (snap.exists()) {
        callback(snap.data() as AppConfig);
      } else {
        callback(defaultConfig);
      }
    }, (error) => {
      console.warn('Real-time config error, using fallback:', error);
      callback(defaultConfig);
    });
  },

  // Update app config
  async updateConfig(updatedConfig: Partial<AppConfig>, adminEmail: string, adminUid: string): Promise<void> {
    const configRef = doc(db, 'appConfig', 'global');
    const snap = await getDoc(configRef);

    const payload = {
      ...updatedConfig,
      updatedAt: serverTimestamp(),
      updatedBy: adminEmail
    };

    if (!snap.exists()) {
      await setDoc(configRef, {
        ...defaultConfig,
        ...payload
      });
    } else {
      await updateDoc(configRef, payload);
    }

    // Mirror to current doc for backward compatibility with mobile app
    try {
      const currentRef = doc(db, 'appConfig', 'current');
      await setDoc(currentRef, payload, { merge: true });
    } catch (e) {
      console.warn('Failed to mirror to appConfig/current:', e);
    }

    await authService.logAudit(
      adminUid,
      adminEmail,
      'UPDATE_CONFIG',
      'CONFIG',
      `Updated config fields: ${Object.keys(updatedConfig).join(', ')}`
    );
  }
};
