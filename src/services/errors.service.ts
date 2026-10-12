import { 
  collection, 
  doc, 
  getDocs, 
  updateDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from './firebase';
import { ErrorReport } from '../types';
import { authService } from './auth.service';

const ERRORS_COLLECTION = 'errorReports';

const SEED_ERRORS: ErrorReport[] = [
  {
    id: 'err-101',
    errorCode: 'PARSER_HTML_STRUCTURE_CHANGED',
    message: 'TikTok HTML signature modified on web client; video selector returned null',
    screen: 'HomeScreen / UrlAnalyzer',
    appVersion: 'v2.4.2',
    androidSdk: 33,
    status: 'INVESTIGATING',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    notes: 'Direct API resolver fallback automatically rescued 94% of sessions.'
  },
  {
    id: 'err-102',
    errorCode: 'DOWNLOAD_STORAGE_PERMISSION_DENIED',
    message: 'User rejected WRITE_EXTERNAL_STORAGE on Android 9 device',
    screen: 'DownloadManager / SaveMediaStream',
    appVersion: 'v2.5.0',
    androidSdk: 28,
    status: 'RESOLVED',
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    notes: 'Handled with scoped storage and fallback prompt.'
  },
  {
    id: 'err-103',
    errorCode: 'AUDIO_EXTRACT_TIMED_OUT',
    message: 'Socket timeout after 30s while fetching MP3 stream',
    screen: 'BatchDownloaderScreen',
    appVersion: 'v2.5.0',
    androidSdk: 34,
    status: 'UNRESOLVED',
    timestamp: new Date(Date.now() - 1000 * 60 * 300),
    notes: 'Need to add auto retry with exponential backoff.'
  }
];

export const errorsService = {
  subscribeErrors(callback: (errors: ErrorReport[]) => void) {
    const q = query(collection(db, ERRORS_COLLECTION), orderBy('timestamp', 'desc'), limit(50));
    return onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        callback(SEED_ERRORS);
      } else {
        const items: ErrorReport[] = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as ErrorReport);
        });
        callback(items);
      }
    }, () => {
      callback(SEED_ERRORS);
    });
  },

  async getErrors(): Promise<ErrorReport[]> {
    try {
      const q = query(collection(db, ERRORS_COLLECTION), orderBy('timestamp', 'desc'), limit(50));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return SEED_ERRORS;
      const items: ErrorReport[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as ErrorReport);
      });
      return items;
    } catch {
      return SEED_ERRORS;
    }
  },

  async updateErrorStatus(
    errorId: string, 
    status: 'UNRESOLVED' | 'INVESTIGATING' | 'RESOLVED', 
    notes: string,
    adminEmail: string,
    adminUid: string
  ): Promise<void> {
    try {
      const errorRef = doc(db, ERRORS_COLLECTION, errorId);
      await updateDoc(errorRef, {
        status,
        notes
      });
    } catch {
      // If mock, no-op silently
    }

    await authService.logAudit(
      adminUid,
      adminEmail,
      'UPDATE_ERROR_STATUS',
      'CONFIG',
      `Error ${errorId} marked as ${status}`
    );
  }
};
