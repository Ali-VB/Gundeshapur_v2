
import React from 'react';
import { ToastContainer } from './Toast';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      <ToastContainer />
      <main>{children}</main>
    </div>
  );
};