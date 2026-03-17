
import React from 'react';
import { MILO_LOGO } from '../constants';
import { User } from '../types';

interface LayoutProps {
  children?: React.ReactNode;
  activeSection: string;
  setActiveSection: (s: string) => void;
  user: User | null;
}

export default function Layout({ children, activeSection, setActiveSection, user }: LayoutProps) {
  const navItems = [
    { id: 'home', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'research', label: 'Research Engine', icon: 'M12 21V12M12 12V3M12 12H21M12 12H3' },
    { id: 'explorer', label: 'Data Explorer', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'discoveries', label: 'Registry Archive', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { id: 'discovery_pipeline', label: 'Discovery Pipeline', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: 'simulations', label: 'Simulations', icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M9 9l6 3-6 3V9z' }
  ];

  return (
    <div className="flex h-screen bg-[#010409] text-slate-300 font-sans selection:bg-blue-500/30 overflow-hidden">
      {/* Sidebar Nav */}
      <aside className="w-64 border-r border-slate-800 bg-[#0d1117] flex flex-col p-6 shrink-0">
        <div className="flex items-center gap-3 mb-10 group cursor-pointer" onClick={() => setActiveSection('home')}>
          <div className="scale-75 group-hover:rotate-12 transition-transform">{MILO_LOGO}</div>
          <div className="leading-none">
            <h1 className="text-xl font-black text-white tracking-tighter">MILO</h1>
            <span className="text-[9px] uppercase tracking-[0.4em] text-blue-500 font-bold">Stellar</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                activeSection === item.id ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-500'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-slate-800">
           <div className="flex items-center gap-3 p-3 bg-black/30 rounded-2xl border border-slate-800">
             <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-black text-blue-400">
               {user ? user.username[0].toUpperCase() : 'A'}
             </div>
             <div className="overflow-hidden">
               <div className="text-[10px] font-black text-white truncate">{user?.username || 'Researcher'}</div>
               <div className="text-[8px] text-slate-600 uppercase font-black">Connected</div>
             </div>
           </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 border-b border-slate-800 bg-[#0d1117]/80 backdrop-blur-md px-8 flex items-center justify-between z-20">
          <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-500">
            {navItems.find(n => n.id === activeSection)?.label || 'Platform'}
          </h2>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[9px] font-mono text-emerald-500 uppercase font-black tracking-widest">Neural Link Sync</span>
            </div>
            <div className="text-[9px] font-mono text-slate-600 uppercase font-black tracking-widest">GAIA DR3 // TESS // ZTF</div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-12 bg-[#010409]">
          {children}
        </div>
      </main>
    </div>
  );
}
