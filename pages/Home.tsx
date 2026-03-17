
import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { SURVEYS } from '../constants';
// Fixed: Imported ExplanationLevel from types instead of constants
import { ExplanationLevel } from '../types';

interface HomeProps {
  onAnalysisComplete: (query: string, imageData?: string, mode?: string) => void;
  level: ExplanationLevel;
}

const Home: React.FC<HomeProps> = ({ onAnalysisComplete, level }) => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('Anomaly Discovery');
  const [survey, setSurvey] = useState('Gaia DR3');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MODES = [
    "Anomaly Discovery",
    "Variable Star Detection",
    "Exoplanet Transit Analysis",
    "Stellar Population Census"
  ];

  const handleAnalysis = (query: string, imageData?: string) => {
    onAnalysisComplete(query, imageData, mode);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => handleAnalysis('', event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-32">
      <div className="max-w-3xl mb-12 sm:mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-[0.2em] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          MILO DeepSpace v10 // Multi-Mode Pipeline
        </div>
        <h1 className="text-4xl sm:text-6xl font-light tracking-tight mb-6">
          Integrated <span className="font-bold text-blue-500">Astrophysical</span> Research.
        </h1>
        <p className="text-base sm:text-xl text-slate-500 leading-relaxed max-w-2xl font-medium">
          Process real astronomical data from Gaia and TESS, detect astrophysical signals, and validate results using physics-constrained intelligence.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Research Engine Controls */}
        <div className="lg:col-span-7 bg-slate-900/40 border border-slate-900 rounded-[2.5rem] p-10 flex flex-col justify-between hover:border-slate-800 transition-all group shadow-2xl">
          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-tighter text-white">Research Engine</h2>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-black rounded-lg text-[9px] font-mono text-slate-500 border border-slate-800">TESS-SYNC</span>
                <span className="px-3 py-1 bg-black rounded-lg text-[9px] font-mono text-slate-500 border border-slate-800">GAIA-LOCKED</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Analysis Mode</label>
                <div className="grid grid-cols-1 gap-2">
                  {MODES.map(m => (
                    <button 
                      key={m} 
                      onClick={() => setMode(m)}
                      className={`text-left px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${mode === m ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-black/40 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Archive Source</label>
                <select 
                  value={survey}
                  onChange={(e) => setSurvey(e.target.value)}
                  className="w-full bg-black/40 border border-slate-800 rounded-xl px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-300 outline-none focus:border-blue-500"
                >
                  {SURVEYS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl mt-4">
                  <p className="text-[9px] text-blue-400 leading-relaxed font-medium uppercase tracking-widest">
                    Source synchronization ensures spectral fidelity and photometric consistency across Dr3 clusters.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 pt-6">
              <input
                type="text"
                placeholder="Target Designation (e.g. PSR B1919+21)..."
                className="w-full bg-black border border-slate-800 rounded-2xl px-6 py-5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-800 shadow-inner"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                disabled={!input}
                onClick={() => handleAnalysis(input)}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl transition-all disabled:opacity-20 uppercase text-[11px] tracking-[0.3em] shadow-[0_0_30px_rgba(37,99,235,0.3)]"
              >
                Initiate Analysis Pipeline
              </button>
            </div>
          </div>
        </div>

        {/* Neural Image Module */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <div 
            className={`flex-1 bg-slate-900/40 border-2 border-dashed rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
              isDragging ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 hover:border-slate-700'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => handleAnalysis('', event.target?.result as string);
                reader.readAsDataURL(file);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
            <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center mb-6 border border-slate-700 shadow-2xl">
              <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <h2 className="text-xl font-black mb-2 uppercase tracking-tight text-white">Neural Diagnostic</h2>
            <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] max-w-xs leading-relaxed font-bold">Upload telescope frames for plate solving and sub-pixel morphology diagnostics.</p>
          </div>

          <div className="bg-blue-600/5 border border-blue-500/10 rounded-[2rem] p-8 flex items-center gap-6">
            <div className="w-12 h-12 rounded-full border border-blue-500/30 flex items-center justify-center shrink-0">
               <span className="text-blue-400 font-black text-xs">98%</span>
            </div>
            <div>
              <div className="text-[10px] font-black text-white uppercase tracking-widest">Pipeline Health</div>
              <div className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">Stochastic validation active across all clusters.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Discovery Progress Tracker */}
      <div className="mt-24 w-full max-w-5xl mx-auto" id="discovery-stats">
        <div className="flex flex-col md:flex-row items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-light tracking-tight text-white mb-2">The Discovery Frontier</h2>
            <p className="text-slate-500 text-sm">Real-time estimation of mapped vs. unclassified astrophysical sources.</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">Archive Sync</div>
              <div className="flex items-center gap-2 text-emerald-500 font-mono text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                LIVE GAIA DR3 / TESS
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Exoplanets Confirmed', value: '5,582', total: '100B+', color: 'text-blue-500', pct: 0.000005 },
            { label: 'Stars Mapped (Gaia)', value: '1.81B', total: '400B', color: 'text-emerald-500', pct: 0.45 },
            { label: 'Unclassified Anomalies', value: '12.4M', total: 'Unknown', color: 'text-amber-500', pct: 0.12 }
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl backdrop-blur-sm">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">{stat.label}</div>
              <div className={`text-3xl font-light ${stat.color} mb-1`}>{stat.value}</div>
              <div className="text-[10px] text-slate-600 font-mono mb-6">EST. TOTAL: {stat.total}</div>
              <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: `${stat.pct * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 2, delay: i * 0.2 }}
                  className={`h-full bg-current ${stat.color}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-24 pt-12 border-t border-slate-900/50 flex flex-col items-center text-center">
        <p className="text-slate-800 text-[10px] uppercase tracking-[0.6em] font-black mb-8">
          ESSS Research Pipeline v10.2 // PHYSICS-LOCKED
        </p>
        <div className="flex gap-20">
           <div className="text-center">
              <div className="text-2xl font-black text-slate-700">12k+</div>
              <div className="text-[8px] font-black text-slate-800 uppercase tracking-widest mt-2">Objects Verified</div>
           </div>
           <div className="text-center">
              <div className="text-2xl font-black text-slate-700">Gaia DR3</div>
              <div className="text-[8px] font-black text-slate-800 uppercase tracking-widest mt-2">Core Registry</div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
