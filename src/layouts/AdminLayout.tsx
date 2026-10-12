import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Bell, 
  DownloadCloud, 
  BarChart3, 
  Smartphone, 
  AlertOctagon, 
  Sliders, 
  Wrench, 
  ShieldCheck, 
  FileText, 
  Settings as SettingsIcon, 
  User as UserIcon,
  LogOut, 
  Search, 
  Menu, 
  X,
  ExternalLink,
  Radio
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';

export const AdminLayout: React.FC = () => {
  const { adminProfile, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'APK Releases', path: '/releases', icon: Package },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Downloader Monitor', path: '/downloader', icon: DownloadCloud },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Installations', path: '/installations', icon: Smartphone },
    { name: 'Error Reports', path: '/errors', icon: AlertOctagon },
    { name: 'Remote Config', path: '/config', icon: Sliders },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench },
    { name: 'Admin Users', path: '/admins', icon: ShieldCheck, role: ['Owner', 'Admin'] },
    { name: 'Audit Logs', path: '/audit-logs', icon: FileText },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-dark-950 text-slate-100">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-dark-900 border-r border-white/5 select-none z-20">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 px-6 h-18 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl bg-electric-500/10 border border-electric-500/30 flex items-center justify-center text-electric-400 shadow-electric-glow">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-wide text-white flex items-center gap-1.5 font-['JetBrains_Mono',monospace]">
              NDRATIK <span className="text-electric-400 text-xs font-semibold px-1.5 py-0.5 rounded bg-electric-500/10 border border-electric-500/20">PRO</span>
            </h1>
            <p className="text-[11px] text-slate-400 tracking-wider font-medium">ADMIN CONSOLE</p>
          </div>
        </div>

        {/* Project Info Pill */}
        <div className="px-5 py-3">
          <div className="px-3 py-2 rounded-xl bg-dark-850 border border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono text-[11px]">adminapk-116ba</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-electric-500/15 text-electric-300 border border-electric-500/30 shadow-electric-glow font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-dark-800 border border-transparent'
                  }`
                }
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-electric-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout in Footer */}
        <div className="p-3 border-t border-white/5 bg-dark-900/50">
          <div className="p-3 rounded-xl bg-dark-850/80 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-electric-600/20 border border-electric-500/30 text-electric-300 flex items-center justify-center font-bold text-xs uppercase">
                {adminProfile?.displayName?.charAt(0) || user?.email?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{adminProfile?.displayName || user?.email?.split('@')[0]}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge variant="primary" size="sm">{adminProfile?.role || 'Admin'}</Badge>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-dark-900/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 lg:px-8 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 lg:hidden text-slate-400 hover:text-white rounded-lg hover:bg-dark-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Bar */}
            <div className="relative hidden sm:block w-72 lg:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search releases, errors, installations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full glass-input text-xs pl-9 pr-4 py-2 rounded-xl focus:border-electric-500 transition-all placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NavLink
              to="/profile"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-800/80 hover:bg-dark-750 border border-white/5 text-xs text-slate-300 hover:text-white transition-colors"
            >
              <UserIcon className="w-3.5 h-3.5 text-electric-400" />
              <span className="hidden md:inline font-medium">Profile</span>
            </NavLink>

            <a
              href="https://console.firebase.google.com/project/adminapk-116ba"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-electric-500/10 hover:bg-electric-500/20 border border-electric-500/20 text-electric-300 text-xs font-semibold transition-colors"
            >
              <span className="hidden md:inline">Firebase Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </header>

        {/* Mobile Sidebar Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
            <div className="relative w-64 bg-dark-900 border-r border-white/10 flex flex-col h-full z-10">
              <div className="flex items-center justify-between px-6 h-16 border-b border-white/5">
                <span className="font-bold text-sm tracking-wider text-white">NDRATIK MENU</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive ? 'bg-electric-500/15 text-electric-300 border border-electric-500/30' : 'text-slate-400 hover:text-white'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
          
