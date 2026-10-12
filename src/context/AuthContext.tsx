import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { authService } from '../services/auth.service';
import { AdminRole, AdminUser } from '../types';

interface AuthContextType {
  user: User | null;
  adminProfile: AdminUser | null;
  loading: boolean;
  hasRole: (requiredRoles: AdminRole[]) => boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (firebaseUser: User) => {
    try {
      const profile = await authService.getAdminProfile(firebaseUser.uid);
      setAdminProfile(profile);
    } catch (err) {
      console.error('Error fetching admin profile:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser);
      } else {
        setAdminProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const hasRole = (requiredRoles: AdminRole[]): boolean => {
    if (!adminProfile) return false;
    // Owner always has access
    if (adminProfile.role === 'Owner') return true;
    return requiredRoles.includes(adminProfile.role);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setAdminProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  return (
    <AuthContext.Provider value={{ user, adminProfile, loading, hasRole, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
