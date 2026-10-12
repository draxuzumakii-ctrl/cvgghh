import { 
  collection, 
  doc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from './firebase';
import { AdminRole, AdminUser, AdminAuditLog } from '../types';
import { authService } from './auth.service';

const ADMINS_COLLECTION = 'admins';
const AUDIT_LOGS_COLLECTION = 'adminAuditLogs';

export const adminsService = {
  // Subscribe to admins list
  subscribeAdmins(callback: (admins: AdminUser[]) => void) {
    const q = query(collection(db, ADMINS_COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const items: AdminUser[] = [];
      snapshot.forEach((doc) => {
        items.push({ uid: doc.id, ...doc.data() } as AdminUser);
      });
      callback(items);
    }, (err) => {
      console.warn('Admins listener error:', err);
      callback([]);
    });
  },

  // Update admin role
  async updateRole(
    targetUid: string, 
    newRole: AdminRole, 
    adminEmail: string, 
    adminUid: string
  ): Promise<void> {
    const adminRef = doc(db, ADMINS_COLLECTION, targetUid);
    await updateDoc(adminRef, {
      role: newRole
    });

    await authService.logAudit(
      adminUid,
      adminEmail,
      'UPDATE_ADMIN_ROLE',
      'ADMINS',
      `Changed role of admin ${targetUid} to ${newRole}`
    );
  },

  // Toggle active status
  async toggleActive(
    targetUid: string, 
    isActive: boolean, 
    adminEmail: string, 
    adminUid: string
  ): Promise<void> {
    const adminRef = doc(db, ADMINS_COLLECTION, targetUid);
    await updateDoc(adminRef, {
      isActive
    });

    await authService.logAudit(
      adminUid,
      adminEmail,
      isActive ? 'ACTIVATE_ADMIN' : 'DEACTIVATE_ADMIN',
      'ADMINS',
      `Admin ${targetUid} active status changed to ${isActive}`
    );
  },

  // Subscribe to audit logs
  subscribeAuditLogs(callback: (logs: AdminAuditLog[]) => void) {
    const q = query(collection(db, AUDIT_LOGS_COLLECTION), orderBy('timestamp', 'desc'), limit(100));
    return onSnapshot(q, (snapshot) => {
      const items: AdminAuditLog[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as AdminAuditLog);
      });
      callback(items);
    }, (err) => {
      console.warn('Audit logs listener error:', err);
      callback([]);
    });
  }
};
