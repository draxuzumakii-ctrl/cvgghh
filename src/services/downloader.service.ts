import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from './firebase';
import { DownloadEvent } from '../types';

const DOWNLOADS_COLLECTION = 'downloadEvents';

// Initial mock events if collection is empty
const SEED_DOWNLOAD_EVENTS: DownloadEvent[] = [
  {
    id: 'evt-1',
    status: 'SUCCESS',
    type: 'video',
    fileSizeBytes: 18452091,
    domain: 'v16-webapp-prime.tiktok.com',
    errorCode: '',
    installationId: 'inst-9831',
    appVersion: 'v2.5.0',
    timestamp: new Date(Date.now() - 1000 * 60 * 3)
  },
  {
    id: 'evt-2',
    status: 'SUCCESS',
    type: 'audio',
    fileSizeBytes: 4210940,
    domain: 'sf16-ies-music.tiktokcdn.com',
    errorCode: '',
    installationId: 'inst-5512',
    appVersion: 'v2.5.0',
    timestamp: new Date(Date.now() - 1000 * 60 * 7)
  },
  {
    id: 'evt-3',
    status: 'FAILED',
    type: 'video',
    fileSizeBytes: 0,
    domain: 'tiktok.com',
    errorCode: 'HTTP_403_FORBIDDEN',
    installationId: 'inst-2291',
    appVersion: 'v2.4.2',
    timestamp: new Date(Date.now() - 1000 * 60 * 14)
  },
  {
    id: 'evt-4',
    status: 'SUCCESS',
    type: 'video',
    fileSizeBytes: 31204910,
    domain: 'v19-webapp-prime.tiktok.com',
    errorCode: '',
    installationId: 'inst-1104',
    appVersion: 'v2.5.0',
    timestamp: new Date(Date.now() - 1000 * 60 * 22)
  },
  {
    id: 'evt-5',
    status: 'FAILED',
    type: 'video',
    fileSizeBytes: 0,
    domain: 'vt.tiktok.com',
    errorCode: 'RATE_LIMITED_429',
    installationId: 'inst-4811',
    appVersion: 'v2.5.0',
    timestamp: new Date(Date.now() - 1000 * 60 * 35)
  }
];

export const downloaderService = {
  subscribeRecentEvents(callback: (events: DownloadEvent[]) => void) {
    const q = query(collection(db, DOWNLOADS_COLLECTION), orderBy('timestamp', 'desc'), limit(50));
    return onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        callback(SEED_DOWNLOAD_EVENTS);
      } else {
        const events: DownloadEvent[] = [];
        snapshot.forEach((doc) => {
          events.push({ id: doc.id, ...doc.data() } as DownloadEvent);
        });
        callback(events);
      }
    }, () => {
      callback(SEED_DOWNLOAD_EVENTS);
    });
  },

  async getDownloadEvents(): Promise<DownloadEvent[]> {
    try {
      const q = query(collection(db, DOWNLOADS_COLLECTION), orderBy('timestamp', 'desc'), limit(50));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return SEED_DOWNLOAD_EVENTS;
      const events: DownloadEvent[] = [];
      snapshot.forEach((doc) => {
        events.push({ id: doc.id, ...doc.data() } as DownloadEvent);
      });
      return events;
    } catch {
      return SEED_DOWNLOAD_EVENTS;
    }
  }
};
