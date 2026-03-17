
import React from 'react';
import { Discovery } from '../types';

interface ValidationLabProps {
  activeResearch: Discovery | null;
}

const ValidationLab: React.FC<ValidationLabProps> = ({ activeResearch }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500">
      <div className="bg-[#0d1117] border border-slate-800 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
          <div className="text-[80px] font-black text-slate-500 rotate-12 uppercase tracking-tighter">LAB</div>
        </div>

        <h3 className="text-[14px] font-black uppercase tracking-[0.5em] text-red-500 mb-12 flex items-center gap-4">
          <span className="w-3.5 h-3.5 rounded-full bg-red-600 shadow-[0_0_15px_red] animate-pulse"></span>
          Diagnostic Physics Engine
        </h3>

        {!activeResearch ? (
          <div className="py-20 text-center text-[10px] font-black text-slate-700 uppercase tracking-[0.6em]">
            No Target Loaded for Validation
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {activeResearch.validation.map((v, i) => (
                <div key={i} className={`p-8 rounded-[2.5rem] border transition-all ${v.status === 'valid' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[11px] font-black uppercase tracking-widest text-white">{v.parameter}</span>
                    <span className={`text-[10px] font-mono px-3 py-1 rounded-full uppercase tracking-widest font-black ${v.status === 'valid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                      {v.status}
                    </span>
                  </div>
                  <div className="text-[12px] font-mono text-slate-400 mb-6 bg-black/40 p-4 rounded-xl border border-slate-800 text-center font-bold">
                    {v.formula}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {v.diagnostic}
                  </p>
                  <div className="mt-6 pt-6 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Error Margin</span>
                    <span className="text-[11px] font-mono text-white font-black">{v.margin}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-10 bg-black/40 rounded-[2.5rem] border border-slate-800">
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8">Internal Algorithm Flow</h4>
               <div className="flex items-center justify-between gap-6 overflow-x-auto pb-4">
                  {['Normalization', 'Noise Reduction', 'Feature Selection', 'Bayesian Check', 'Final Sync'].map((step, i) => (
                    <React.Fragment key={step}>
                      <div className="shrink-0 text-center space-y-3">
                         <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-mono text-blue-400 font-bold">{i+1}</div>
                         <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{step}</div>
                      </div>
                      {i < 4 && <div className="h-0.5 w-12 bg-slate-800 shrink-0"></div>}
                    </React.Fragment>
                  ))}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidationLab;
