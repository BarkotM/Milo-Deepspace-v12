
import React from 'react';
import { Discovery } from '../types';

interface DiscoveriesDatabaseProps {
  discoveries: Discovery[];
  onSelect: (d: Discovery) => void;
}

const DiscoveriesDatabase: React.FC<DiscoveriesDatabaseProps> = ({ discoveries, onSelect }) => {
  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Registry Archive</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.4em] font-black">Persistent discovery cache // Offline Secure</p>
        </div>
        <div className="flex gap-4">
           <input 
             type="text" 
             placeholder="Search Registry..." 
             className="bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:border-blue-500 w-64" 
           />
           <button className="px-6 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Export Repository</button>
        </div>
      </div>

      {discoveries.length === 0 ? (
        <div className="py-48 text-center text-slate-800 uppercase tracking-[1em] font-black border-4 border-dashed border-slate-900 rounded-[4rem]">
          Registry Database Null
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {discoveries.map(d => (
            <div 
              key={d.id} 
              onClick={() => onSelect(d)}
              className="group bg-[#0d1117] border border-slate-800 rounded-[2.5rem] p-8 hover:border-blue-500/50 hover:bg-slate-900/40 transition-all cursor-pointer shadow-2xl relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                   <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-1">{new Date(d.timestamp).toLocaleDateString()} // {d.id}</div>
                   <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tighter">{d.name}</h3>
                </div>
                <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[9px] font-black text-blue-400 uppercase tracking-widest">{d.objectClass}</div>
              </div>
              
              <div className="space-y-4 mb-8">
                 <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Confidence Score</span>
                    <span className="text-[11px] font-mono text-emerald-500 font-black">{(d.confidence * 100).toFixed(1)}%</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Validation Status</span>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">PHYSICS_SYNCED</span>
                 </div>
              </div>

              <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed font-medium italic mb-8">
                {d.report}
              </div>

              <div className="flex gap-2">
                 <span className="px-3 py-1 bg-black/40 rounded-lg text-[8px] font-black text-slate-600 border border-slate-800 uppercase tracking-widest">{d.mode}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiscoveriesDatabase;
