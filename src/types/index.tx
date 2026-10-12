export type AdminRole = 'Owner' | 'Admin' | 'Operator' | 'Viewer';

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: any;
  lastLoginAt?: any;
  createdBy?: string;
}

export interface AppConfig {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  maintenanceScheduledStart?: string | null;
  maintenanceScheduledEnd?: string | null;
  homeBannerText?: string;
  officialLink?: string;
  announcement?: string;
  minSupportedVersionCode: number;
  latestVersionCode: number;
  latestVersionName: string;
  latestApkUrl?: string;
  forceUpdate: boolean;
  changelog?: string;
  maxDownloadTasks: number;
  maxFileSizeMb: number;
  directFallbackEnabled: boolean;
  customErrorMessage?: string;
  updatedAt?: any;
  updatedBy?: string;
}

export interface Release {
  id: string;
  releaseName: string;
  versionName: string;
  versionCode: number;
  changelog: string;
  minSupportedVersionCode: number;
  forceUpdate: boolean;
  isPublished: boolean;
  isDraft: boolean;
  scheduledPublishAt?: string | null;
  apkDownloadUrl: string;
  apkStoragePath: string;
  fileSizeBytes: number;
  sha256Checksum: string;
  downloadCount: number;
  createdAt: any;
  publishedAt?: any;
  createdBy: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'broadcast' | 'update' | 'announcement' | 'maintenance';
  topic: string; // e.g. "ndratik_all"
  status: 'PENDING' | 'SENT' | 'FAILED' | 'SCHEDULED';
  targetAudience: string;
  scheduledAt?: string | null;
  sentAt?: any;
  createdBy: string;
  successCount?: number;
  failureCount?: number;
  actionUrl?: string;
}

export interface DownloadEvent {
  id: string;
  status: 'SUCCESS' | 'FAILED';
  type: 'video' | 'audio';
  fileSizeBytes: number;
  domain: string;
  errorCode: string;
  installationId: string;
  appVersion: string;
  timestamp: any;
}

export interface Installation {
  id: string;
  installationId: string;
  appVersionName: string;
  appVersionCode: number;
  androidSdk: number;
  deviceModel: string;
  firstSeenAt?: any;
  lastActiveAt?: any;
  crashCount?: number;
}

export interface ErrorReport {
  id: string;
  errorCode: string;
  message: string;
  screen: string;
  appVersion: string;
  androidSdk: number;
  status: 'UNRESOLVED' | 'INVESTIGATING' | 'RESOLVED';
  timestamp: any;
  notes?: string;
}

export interface AdminAuditLog {
  id: string;
  adminEmail: string;
  adminUid: string;
  action: string; // e.g. "PUBLISH_APK", "UPDATE_CONFIG", "SEND_NOTIFICATION"
  category: 'CONFIG' | 'RELEASES' | 'NOTIFICATIONS' | 'ADMINS' | 'AUTH';
  details: string;
  timestamp: any;
  ipAddress?: string;
}

export interface DashboardStats {
  totalInstallations: number;
  activeToday: number;
  activeMonthly: number;
  totalDownloads: number;
  downloadsSuccess: number;
  downloadsFailed: number;
  successRate: number;
  latestApkVersion: string;
  totalErrors: number;
  backendStatus: 'healthy' | 'degraded' | 'maintenance';
  recentReleasesCount: number;
}
