import React, { useState, useEffect, useRef } from 'react';
import { useAuth, useTranslation } from '../../index';
import { Locale } from '../../types';
import { ToastContainer } from './Toast';
import { Logo } from '../common/Logo';
import { GlobeIcon } from '../common/Icons';


export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, signOut } = useAuth();
  const { locale, setLanguage, t } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (lang: Locale) => {
    setLanguage(lang);
    setDropdownOpen(false);
  };

  const libraryName = user?.plan === 'enterprise' && user?.libraryName ? user.libraryName : null;

  return (
    <div className="min-h-screen flex flex-col">
      <ToastContainer />
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-30">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Logo className="h-10"/>
              {libraryName && (
                <>
                  <div className="h-8 w-px bg-slate-700 hidden sm:block"></div>
                  <span className="text-xl font-bold text-slate-300 hidden sm:block">{libraryName}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate-300 hidden sm:block">{user?.email}</span>
              <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setDropdownOpen(!dropdownOpen)} className="p-2 rounded-full hover:bg-slate-700 transition">
                      <GlobeIcon />
                  </button>
                  {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-32 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-40">
                          <button onClick={() => changeLanguage('en')} className={`block w-full text-left px-4 py-2 text-sm ${locale === 'en' ? 'bg-cyan-600' : 'hover:bg-slate-700'}`}>English</button>
                          <button onClick={() => changeLanguage('es')} className={`block w-full text-left px-4 py-2 text-sm ${locale === 'es' ? 'bg-cyan-600' : 'hover:bg-slate-700'}`}>Español</button>
                          <button onClick={() => changeLanguage('fr')} className={`block w-full text-left px-4 py-2 text-sm ${locale === 'fr' ? 'bg-cyan-600' : 'hover:bg-slate-700'}`}>Français</button>
                      </div>
                  )}
              </div>
              <button
                onClick={signOut}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-red-500 transition"
              >
                {t('signOut')}
              </button>
            </div>
          </div>
        </nav>
      </header>
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </main>
    </div>
  );
};
