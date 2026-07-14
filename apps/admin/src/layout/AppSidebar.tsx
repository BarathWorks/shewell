'use client';

import AppMenu from './AppMenu';
import Link from 'next/link';
import React from 'react';
import { signOut } from 'next-auth/react';
import { confirmDialog } from 'primereact/confirmdialog';

const AppSidebar = () => {
  const onClickSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    confirmDialog({
      message: 'Do you want to logout?',
      header: 'Confirmation',
      icon: 'pi pi-info-circle',
      acceptClassName: 'p-button-danger',
      accept: () => signOut()
    });
  };

  return (
    <div className="flex flex-column h-full" style={{ minHeight: 'calc(100vh - 3rem)' }}>
      {/* Sidebar Header */}
      <div className="layout-sidebar-header mb-4 px-2 pt-2">
        <Link href="/" className="flex align-items-center gap-2" style={{ textDecoration: 'none' }}>
          <img 
            src="/layout/images/vyan-logo.png" 
            alt="Shewell Logo" 
            style={{ height: '35px', maxWidth: '100%', objectFit: 'contain' }} 
          />
        </Link>
      </div>

      {/* Sidebar Menu */}
      <div className="flex-1 overflow-y-auto">
        <AppMenu />
      </div>

      {/* Sidebar Bottom Profile Widget */}
      <div className="mt-auto pt-3 border-top-1 border-300">
        <div className="flex align-items-center gap-3 p-2 border-round hover:surface-100 cursor-pointer transition-colors transition-duration-200">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBB8JeCMFqChy8c02s1FL7RMYhoe7wzkWRhjovkDY3xeIryI6MeZG5-AYgdD0fGl0fZR8JlZMQW1v3XjL9UAlylc9978fakSeBNVtge3DCLUDaxWLvHbMCNdDCKDV8sgZtw-iezSpOawCxyQ346Cz8a5sp8QmxjwChdiUefT8iiTL_0YtaWET4nIZvLp_B39zNha6zROqOMo4pXzsMR1VcfPev3FAJIzq1Gg6cVMu2EoDNN8dWvK1ikHg" 
            alt="avatar"
            style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
          <div className="overflow-hidden">
            <p className="m-0 font-bold text-sm text-900 line-height-2 truncate">Shewell Admin</p>
            <p className="m-0 text-500 uppercase text-xs truncate" style={{ letterSpacing: '0.05em', fontSize: '9px', fontWeight: '700' }}>Healthcare Division</p>
          </div>
        </div>
        <a 
          href="#" 
          onClick={onClickSignOut} 
          className="flex align-items-center gap-2 p-2 border-round text-600 hover:text-red-600 hover:bg-red-50 no-underline transition-colors transition-duration-200 mt-1"
          style={{ fontSize: '14px', fontWeight: '500' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
          <span>Logout</span>
        </a>
      </div>
    </div>
  );
};

export default AppSidebar;
