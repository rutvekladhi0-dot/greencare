import { useState } from 'react';
import { Stethoscope, LogIn, LogOut, User, Menu, X, ShieldAlert, BookOpen, Calendar, Users, Briefcase } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ user, onOpenAuth, onLogout, activeTab, setActiveTab }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Home', icon: BookOpen },
    { id: 'departments', label: 'Departments', icon: Briefcase },
    { id: 'doctors', label: 'Doctors', icon: Users },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-emerald-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <button 
              onClick={() => handleNavClick('home')} 
              className="flex items-center space-x-2.5 group cursor-pointer"
              id="navbar-logo-btn"
            >
              <div className="bg-emerald-600 text-white p-2.5 rounded-xl shadow-md shadow-emerald-200 transition-all group-hover:scale-105 group-hover:bg-emerald-700">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div className="text-left">
                <span className="block font-sans text-xl font-extrabold text-slate-800 tracking-tight leading-none">
                  GreenCare
                </span>
                <span className="block text-xs font-semibold text-emerald-600 tracking-wider uppercase mt-1">
                  Hospital Portal
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  id={`nav-tab-${item.id}`}
                  className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <IconComp className="h-4.5 w-4.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Authenticated Links */}
            {user && (
              <>
                <button
                  onClick={() => handleNavClick('dashboard')}
                  id="nav-tab-dashboard"
                  className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Calendar className="h-4.5 w-4.5" />
                  <span>Dashboard</span>
                </button>

                {user.role === 'admin' && (
                  <button
                    onClick={() => handleNavClick('admin')}
                    id="nav-tab-admin"
                    className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      activeTab === 'admin'
                        ? 'bg-amber-50 text-amber-700 border-b-2 border-amber-500'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <ShieldAlert className="h-4.5 w-4.5" />
                    <span>Admin Panel</span>
                  </button>
                )}
              </>
            )}
          </div>

          {/* User Auth Buttons (Desktop) */}
          <div className="hidden md:flex items-center space-x-3.5">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                  <img
                    src={user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`}
                    alt={user.displayName || 'Profile'}
                    className="h-8 w-8 rounded-full border border-emerald-200 bg-white object-cover"
                  />
                  <div className="text-left text-xs">
                    <p className="font-bold text-slate-800 leading-tight">
                      {user.displayName}
                    </p>
                    <p className="text-slate-500 capitalize font-medium">
                      {user.role}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  id="nav-logout-btn"
                  className="flex items-center space-x-1.5 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                id="nav-login-btn"
                className="flex items-center space-x-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-emerald-100 hover:bg-emerald-700 hover:shadow-emerald-200 transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
              >
                <LogIn className="h-4.5 w-4.5" />
                <span>Login / Register</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none transition-all cursor-pointer"
              aria-expanded="false"
              id="mobile-menu-toggle-btn"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 animate-fadeIn" id="mobile-menu-dropdown">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            {menuItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center space-x-2.5 w-full text-left px-4 py-3 rounded-lg text-base font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <IconComp className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {user && (
              <>
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className={`flex items-center space-x-2.5 w-full text-left px-4 py-3 rounded-lg text-base font-semibold transition-all cursor-pointer ${
                    activeTab === 'dashboard' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Calendar className="h-5 w-5" />
                  <span>Dashboard</span>
                </button>

                {user.role === 'admin' && (
                  <button
                    onClick={() => handleNavClick('admin')}
                    className={`flex items-center space-x-2.5 w-full text-left px-4 py-3 rounded-lg text-base font-semibold transition-all cursor-pointer ${
                      activeTab === 'admin' ? 'bg-amber-50 text-amber-700' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldAlert className="h-5 w-5" />
                    <span>Admin Panel</span>
                  </button>
                )}
              </>
            )}

            <div className="pt-4 border-t border-slate-100 mt-2">
              {user ? (
                <div className="px-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`}
                      alt={user.displayName || 'Profile'}
                      className="h-10 w-10 rounded-full border border-emerald-200 bg-white"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-800 leading-tight">{user.displayName}</p>
                      <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center justify-center space-x-2 w-full bg-rose-50 text-rose-600 py-2.5 rounded-lg text-sm font-semibold hover:bg-rose-100 transition-all cursor-pointer"
                  >
                    <LogOut className="h-4.5 w-4.5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="px-2">
                  <button
                    onClick={() => {
                      onOpenAuth();
                      setIsOpen(false);
                    }}
                    className="flex items-center justify-center space-x-2 w-full bg-emerald-600 text-white py-3 rounded-lg text-base font-bold shadow-md shadow-emerald-100 hover:bg-emerald-700 transition-all cursor-pointer"
                  >
                    <LogIn className="h-5 w-5" />
                    <span>Login / Register</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
