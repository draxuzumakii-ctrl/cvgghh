import { 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp, 
  collection, 
  addDoc 
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { AdminRole, AdminUser } from '../types';

export const authService = {
  // Login
  async login(email: string, password: string):Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check or create admin profile in Firestore
    const adminRef = doc(db, 'admins', user.uid);
    const adminSnap = await getDoc(adminRef);

    if (!adminSnap.exists()) {
      // First admin bootstrapping: if no document exists, assign Owner
      const newAdmin: AdminUser = {
        uid: user.uid,
        email: user.email || email,
        displayName: user.displayName || email.split('@')[0],
        role: 'Owner',
        isActive: true,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      };
      await setDoc(adminRef, newAdmin);
    } else {
      await updateDoc(adminRef, {
        lastLoginAt: serverTimestamp()
      });
    }

    // Log to audit log
    await this.logAudit(user.uid, user.email || email, 'LOGIN', 'AUTH', 'Admin logged into panel');

    return user;
  },

  // Logout
  async logout(): Promise<void> {
    const currentUser = auth.currentUser;
    if (currentUser) {
      await this.logAudit(currentUser.uid, currentUser.email || '', 'LOGOUT', 'AUTH', 'Admin logged out');
    }
    await signOut(auth);
  },

  // Reset password
  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  },

  // Get Admin Profile
  async getAdminProfile(uid: string): Promise<AdminUser | null> {
    const adminRef = doc(db, 'admins', uid);
    const snap = await getDoc(adminRef);
    if (snap.exists()) {
      return snap.data() as AdminUser;
    }
    return null;
  },

  // Audit Log Helper
  async logAudit(
    adminUid: string, 
    adminEmail: string, 
    action: string, 
    category: 'CONFIG' | 'RELEASES' | 'NOTIFICATIONS' | 'ADMINS' | 'AUTH', 
    details: string
  ): Promise<void> {
    try {
      await addDoc(collection(db, 'adminAuditLogs'), {
        adminUid,
        adminEmail,
        action,
        category,
        details,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.warn('Could not write audit log:', err);
    }
  }
};
