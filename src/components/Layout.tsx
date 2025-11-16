import React, { useState, useEffect } from 'react';
import { MapPin, User, BookOpen, BarChart3, Calculator, Search, LogOut, Shield } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
  onSignOut?: () => void;
  headerRef?: React.RefObject<HTMLDivElement>;
  user?: any;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange, onSignOut, headerRef, user }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'search', label: 'Find Services', icon: Search },
    { id: 'calculator', label: 'Calculator', icon: Calculator },
    { id: 'bookmarks', label: 'Wishlist', icon: BookOpen },
    { id: 'admin', label: 'Admin', icon: Shield },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const [headerHeight, setHeaderHeight] = useState<number>(0);

  useEffect(() => {
    const measure = () => {
      const h = headerRef?.current?.getBoundingClientRect().height || 0;
      setHeaderHeight(h);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [headerRef]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header
        ref={headerRef}
        className="bg-white border-b border-slate-200 sticky top-0 z-[999] shadow-sm pt-1"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center shadow-sm">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">CityServices</h1>
                <p className="text-xs text-slate-500 hidden sm:block">Smart City Living</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content (reduced top gap so sticky bar sits slightly closer under header) */}
      <main
        className="container mx-auto px-4 lg:px-8 py-8 pb-24 md:pb-8"
        style={{ paddingTop: headerHeight ? `${Math.max(headerHeight - 8, 0)}px` : undefined }}
      >
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 backdrop-blur-sm bg-white/95">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 ${isActive
                  ? 'text-slate-700'
                  : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <div className="w-4 h-0.5 bg-slate-700 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};