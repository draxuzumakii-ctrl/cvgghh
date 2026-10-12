import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from './firebase';
import { Release } from '../types';
import { authService } from './auth.service';
import { configService } from './config.service';

const RELEASES_COLLECTION = 'releases';

export const releasesService = {
  // Subscribe to real-time releases
  subscribeReleases(callback: (releases: Release[]) => void) {
    const q = query(collection(db, RELEASES_COLLECTION), orderBy('versionCode', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const items: Release[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as Release);
      });
      callback(items);
    }, (error) => {
      console.warn('Real-time releases error:', error);
      callback([]);
    });
  },

  // Get all releases
  async getReleases(): Promise<Release[]> {
    try {
      const q = query(collection(db, RELEASES_COLLECTION), orderBy('versionCode', 'desc'));
      const snapshot = await getDocs(q);
      const items: Release[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as Release);
      });
      return items;
    } catch (err) {
      console.error('Error fetching releases:', err);
      return [];
    }
  },

  // Upload APK file to Firebase Storage with progress tracking
  uploadApkFile(
    file: File, 
    versionName: string, 
    onProgress?: (progress: number) => void
  ): Promise<{ downloadUrl: string; storagePath: string }> {
    return new Promise((resolve, reject) => {
      const cleanVersion = versionName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `ndraatik-${cleanVersion}-${Date.now()}.apk`;
      const storagePath = `apks/${filename}`;
      const storageRef = ref(storage, storagePath);

      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: 'application/vnd.android.package-archive',
        customMetadata: {
          originalName: file.name,
          versionName
        }
      });

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(Math.round(progress));
        },
        (error) => {
          console.error('APK upload error:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({ downloadUrl, storagePath });
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  },

  // Create a new release
  async createRelease(
    releaseData: Omit<Release, 'id' | 'createdAt' | 'downloadCount' | 'createdBy'>,
    adminEmail: string,
    adminUid: string
  ): Promise<string> {
    const releaseRef = doc(collection(db, RELEASES_COLLECTION));
    const newRelease: any = {
      ...releaseData,
      downloadCount: 0,
      createdAt: serverTimestamp(),
      publishedAt: releaseData.isPublished ? serverTimestamp() : null,
      createdBy: adminEmail
    };

    await setDoc(releaseRef, newRelease);

    // If published, update global appConfig latest version
    if (releaseData.isPublished) {
      await configService.updateConfig({
        latestVersionCode: releaseData.versionCode,
        latestVersionName: releaseData.versionName,
        latestApkUrl: releaseData.apkDownloadUrl,
        changelog: releaseData.changelog,
        forceUpdate: releaseData.forceUpdate,
        minSupportedVersionCode: releaseData.minSupportedVersionCode
      }, adminEmail, adminUid);
    }

    await authService.logAudit(
      adminUid,
      adminEmail,
      'CREATE_RELEASE',
      'RELEASES',
      `Created release ${releaseData.versionName} (${releaseData.versionCode}) - Published: ${releaseData.isPublished}`
    );

    return releaseRef.id;
  },

  // Toggle publish / unpublish
  async togglePublish(
    release: Release, 
    adminEmail: string, 
    adminUid: string
  ): Promise<void> {
    const releaseRef = doc(db, RELEASES_COLLECTION, release.id);
    const newPublished = !release.isPublished;

    await updateDoc(releaseRef, {
      isPublished: newPublished,
      isDraft: !newPublished,
      publishedAt: newPublished ? serverTimestamp() : null
    });

    if (newPublished) {
      // Sync with global config
      await configService.updateConfig({
        latestVersionCode: release.versionCode,
        latestVersionName: release.versionName,
        latestApkUrl: release.apkDownloadUrl,
        changelog: release.changelog,
        forceUpdate: release.forceUpdate
      }, adminEmail, adminUid);
    }

    await authService.logAudit(
      adminUid,
      adminEmail,
      newPublished ? 'PUBLISH_RELEASE' : 'UNPUBLISH_RELEASE',
      'RELEASES',
      `${newPublished ? 'Published' : 'Unpublished'} version ${release.versionName}`
    );
  },

  // Delete release
  async deleteRelease(
    releaseId: string, 
    storagePath: string, 
    adminEmail: string, 
    adminUid: string
  ): Promise<void> {
    // Delete Firestore doc
    await deleteDoc(doc(db, RELEASES_COLLECTION, releaseId));

    // Delete file in Storage if path exists
    if (storagePath) {
      try {
        const fileRef = ref(storage, storagePath);
        await deleteObject(fileRef);
      } catch (err) {
        console.warn('Storage file already deleted or not found:', err);
      }
    }

    await authService.logAudit(
      adminUid,
      adminEmail,
      'DELETE_RELEASE',
      'RELEASES',
      `Deleted release ID: ${releaseId}`
    );
  }
};
      
