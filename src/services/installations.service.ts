import { collection, getDocs, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { Installation } from '../types';

const INSTALLATIONS_COLLECTION = 'installations';

const SEED_INSTALLATIONS: Installation[] = [
  {
    id: 'inst-1',
    installationId: 'f9a2-41cd-99b1-e28a',
    appVersionName: 'v2.5.0',
    appVersionCode: 10,
    androidSdk: 34,
    deviceModel: 'Samsung Galaxy S24 Ultra',
    firstSeenAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 12),
    crashCount: 0
  },
  {
    id: 'inst-2',
    installationId: '3c8e-71bd-01ea-ff45',
    appVersionName: 'v2.5.0',
    appVersionCode: 10,
    androidSdk: 33,
    deviceModel: 'Xiaomi Redmi Note 13 Pro',
    firstSeenAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12),
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 35),
    crashCount: 0
  },
  {
    id: 'inst-3',
    installationId: '990b-11af-4422-9b21',
    appVersionName: 'v2.4.2',
    appVersionCode: 9,
    androidSdk: 31,
    deviceModel: 'Infinix Hot 40 Pro',
    firstSeenAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 120),
    crashCount: 1
  },
  {
    id: 'inst-4',
    installationId: '66fa-00ce-8821-419b',
    appVersionName: 'v2.5.0',
    appVersionCode: 10,
    androidSdk: 34,
    deviceModel: 'Google Pixel 8 Pro',
    firstSeenAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 5),
    crashCount: 0
  },
  {
    id: 'inst-5',
    installationId: '88de-33ef-9011-aa74',
    appVersionName: 'v2.3.0',
    appVersionCode: 7,
    androidSdk: 29,
    deviceModel: 'Vivo Y21',
    firstSeenAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    crashCount: 2
  }
];

export const installationsService = {
  subscribeInstallations(callback: (items: Installation[]) => void) {
    const q = query(collection(db, INSTALLATIONS_COLLECTION), orderBy('lastActiveAt', 'desc'), limit(100));
    return onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        callback(SEED_INSTALLATIONS);
      } else {
        const items: Installation[] = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as Installation);
        });
        callback(items);
      }
    }, () => {
      callback(SEED_INSTALLATIONS);
    });
  },

  async getInstallations(): Promise<Installation[]> {
    try {
      const q = query(collection(db, INSTALLATIONS_COLLECTION), orderBy('lastActiveAt', 'desc'), limit(100));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return SEED_INSTALLATIONS;
      const items: Installation[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as Installation);
      });
      return items;
    } catch {
      return SEED_INSTALLATIONS;
    }
  }
};
