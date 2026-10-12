import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';

import { db } from './firebase';
import { Installation } from '../types';

const INSTALLATIONS_COLLECTION = 'installations';

function toDate(value: unknown): Date | undefined {
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  return undefined;
}

export const installationsService = {
  subscribeInstallations(
    callback: (items: Installation[]) => void,
    onError?: (error: Error) => void
  ) {
    const q = query(
      collection(db, INSTALLATIONS_COLLECTION),
      orderBy('lastActiveAt', 'desc'),
      limit(500)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const items: Installation[] = snapshot.docs.map((document) => {
          const data = document.data();

          return {
            id: document.id,
            installationId:
              data.installationId ?? document.id,
            appVersionName:
              data.appVersionName ?? 'Unknown',
            appVersionCode:
              Number(data.appVersionCode ?? 0),
            androidSdk:
              Number(data.androidSdk ?? 0),
            deviceModel:
              data.deviceModel ?? 'Unknown device',
            firstSeenAt: toDate(data.firstSeenAt),
            lastActiveAt: toDate(data.lastActiveAt),
            crashCount:
              Number(data.crashCount ?? 0),
          };
        });

        callback(items);
      },
      (error) => {
        console.error(
          '[Ndratik Analytics] Firestore error:',
          error
        );

        onError?.(error);
      }
    );
  },
};
