import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { Outlet, useLocation } from 'react-router-dom';

const Layout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    const segment = path.split('/').filter(Boolean)[0];
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
  };

  return (
    <div className="min-h-screen bg-background print:bg-white">
      {/* Dark overlay — only shown on mobile when sidebar open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/*
        Main wrapper:
        - On mobile: full width (sidebar is off-canvas)
        - On desktop: offset by sidebar width with lg:ml-64
      */}
      <div className="lg:ml-64 flex flex-col min-h-screen print:ml-0">
        <div className="print:hidden">
          <TopNav
            title={getPageTitle()}
            onMenuClick={() => setSidebarOpen(prev => !prev)}
          />
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden print:p-0">
          <Outlet />
        </main>

        <footer className="py-4 text-center text-xs text-textMuted border-t border-border print:hidden">
          © 2026 Inventory &amp; Sales Management System. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default Layout;
