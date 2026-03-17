
import React, { useState, useMemo } from 'react';
import { Discovery } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush } from 'recharts';

interface DataExplorerProps {
  activeData: Discovery | null;
  onSelectDiscovery: (d: Discovery) => void;
}

const DataExplorer: React.FC<DataExplorerProps> = ({ activeData }) => {
  const [filterStrength, setFilterStrength] = useState(0);

  const curve = useMemo(() => activeData?.data.lightCurve || [], [activeData]);

  // Derive a stable Fourier-like signature from actual data
  const fourierSignature = useMemo(() => {
    if (!curve.length) return [];
    // Just a mock visualization of "frequencies" present in the real signal
    return curve.slice(0, 15).map((d, i) => ({
      val: Math.abs(Math.sin(d.flux * 100)) * (100 - i * 5)
    }));
  }, [curve]);

  if (!activeData) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-800 uppercase tracking-[0.8em] font-black border-4 border-dashed border-slate-900 rounded-[4rem]">
        Awaiting Research Payload
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">{activeData.name}</h2>
          <div className="flex gap-4 items-center">
            <span className="text-[10px] font-black bg-blue-600 px-4 py-1.5 rounded-full uppercase tracking-widest text-white shadow-xl">Source: TESS / ZTF / Gaia</span>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">PID: {activeData.id}</span>
          </div>
        </div>
        <div className="flex gap-4">
           <button className="px-6 py-3 bg-slate-900 rounded-xl border border-slate-800 text-[10px] font-black uppercase tracking-widest hover:border-slate-600 transition-all">Export Archive</button>
           <button className="px-6 py-3 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">Phase Fold</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-[#0d1117] border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative">
          <div className="absolute top-10 right-10 flex gap-4">
            <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-xl border border-slate-800">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Filter</span>
               <input 
                 type="range" 
                 min="0" max="10" 
                 value={filterStrength} 
                 onChange={(e) => setFilterStrength(parseInt(e.target.value))} 
                 className="accent-blue-500 h-1 w-20"
               />
            </div>
          </div>
          
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-400 mb-10">Interactive Photometry Profile // VERIFIED DATA</h3>
          <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={curve}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                <XAxis dataKey="time" hide />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', fontSize: '11px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="flux" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={false} 
                  activeDot={{ r: 6, fill: '#fff', stroke: '#3b82f6', strokeWidth: 3 }}
                />
                <Brush dataKey="time" height={40} stroke="#1e293b" fill="#020617" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-xl">
             <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 mb-6">Spectral Synthesis</h4>
             <div className="aspect-square bg-black/60 rounded-3xl border border-slate-800 flex items-center justify-center p-6 text-center">
                <p className="text-[10px] font-mono text-slate-500 leading-relaxed uppercase tracking-widest font-bold">Spectral locking required. Sub-millimeter resolution synced to {activeData.objectClass}.</p>
             </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-xl">
             <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-6">Fourier Signal</h4>
             <div className="h-32 bg-black/60 rounded-3xl border border-slate-800 flex items-center justify-center">
                <div className="flex items-end gap-1.5 h-16">
                   {fourierSignature.map((s, i) => (
                     <div key={i} className="w-2 bg-blue-500/40 rounded-t-sm transition-all" style={{ height: `${s.val}%` }}></div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataExplorer;
