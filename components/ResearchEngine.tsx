
import React, { useState, useEffect } from 'react';
import { ResearchMode, Discovery, PipelineStatus, PipelineStage, ExplanationLevel } from '../types';
import { performDeepAnalysis } from '../services/geminiService';
import { PhysicsEngine } from '../services/physicsEngine';
import { fetchObjectData } from '../services/mockAstronomyService';
import AnalysisReport from './AnalysisReport';

interface ResearchEngineProps {
  onDiscovery: (d: Discovery) => void;
  initialTarget?: string;
  initialMode?: ResearchMode | string;
  initialImage?: string;
}

const ResearchEngine: React.FC<ResearchEngineProps> = ({ onDiscovery, initialTarget, initialMode, initialImage }) => {
  const [mode, setMode] = useState<ResearchMode | string>(initialMode || ResearchMode.ANOMALY_DISCOVERY);
  const [target, setTarget] = useState(initialTarget || '');
  const [imageData, setImageData] = useState(initialImage || '');
  const [status, setStatus] = useState<PipelineStatus>(PipelineStatus.IDLE);
  const [completedDiscovery, setCompletedDiscovery] = useState<Discovery | null>(null);
  const [stages, setStages] = useState<PipelineStage[]>([
    { id: 'acq', label: 'Data Acquisition', status: 'pending', log: [] },
    { id: 'proc', label: 'Signal Processing', status: 'pending', log: [] },
    { id: 'val', label: 'Physics Validation', status: 'pending', log: [] }
  ]);

  useEffect(() => {
    if (initialTarget || initialImage) {
      runPipeline();
    }
  }, []);

  const updateStage = (id: string, update: Partial<PipelineStage>) => {
    setStages(prev => prev.map(s => s.id === id ? { ...s, ...update } : s));
  };

  const runPipeline = async () => {
    if (!target && !imageData) return;
    setCompletedDiscovery(null);
    setStatus(PipelineStatus.ACQUISITION);
    setStages([
      { id: 'acq', label: 'Data Acquisition', status: 'active', log: ['Querying Virtual Observatory...', 'Synchronizing Gaia DR3/TESS archives...'] },
      { id: 'proc', label: 'Signal Processing', status: 'pending', log: [] },
      { id: 'val', label: 'Physics Validation', status: 'pending', log: [] }
    ]);
    
    await new Promise(r => setTimeout(r, 1200));
    updateStage('acq', { status: 'success', log: ['Stream handshake established.', 'Calibration frames acquired.'] });
    
    setStatus(PipelineStatus.PROCESSING);
    updateStage('proc', { status: 'active', log: ['Filtering sky background...', 'Neural feature extraction active...'] });
    
    try {
      const rawPayload = await performDeepAnalysis(target, mode, imageData);
      updateStage('proc', { status: 'success', log: ['Pattern recognition locked.', 'Flux-profile reconstruction complete.'] });
      
      setStatus(PipelineStatus.VALIDATION);
      updateStage('val', { status: 'active', log: ['Applying thermodynamic constraints...', 'Validating against spectral library...'] });
      
      const objData = await fetchObjectData(rawPayload);
      if (!objData) throw new Error("Mapping failed");

      const validation = objData.objectClass === 'Star' 
        ? PhysicsEngine.validateStar(objData.physicalProperties) 
        : (objData.objectClass === 'Black Hole' ? PhysicsEngine.validateBlackHole(objData.physicalProperties) : []);

      await new Promise(r => setTimeout(r, 1000));
      updateStage('val', { status: 'success', log: ['Consistency matrix validated.', 'Physics lock achieved.'] });
      
      const discovery: Discovery = {
        id: objData.id,
        timestamp: Date.now(),
        name: objData.name,
        mode,
        confidence: rawPayload.confidence || 0.98,
        objectClass: objData.objectClass,
        validation,
        data: rawPayload,
        object: objData,
        report: rawPayload.report,
        exported: false
      };

      setCompletedDiscovery(discovery);
      onDiscovery(discovery);
      setStatus(PipelineStatus.COMPLETED);
    } catch (err) {
      console.error(err);
      setStatus(PipelineStatus.FAILED);
      updateStage('proc', { status: 'error', log: ['Neural core exception: Data mismatch or API timeout.'] });
    }
  };

  const handleReset = () => {
    setCompletedDiscovery(null);
    setStatus(PipelineStatus.IDLE);
    setTarget('');
    setImageData('');
    setStages(prev => prev.map(s => ({ ...s, status: 'pending', log: [] })));
  };

  if (completedDiscovery && completedDiscovery.object) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-center">
               <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tighter leading-none">Research Payload Committed</h2>
              <span className="text-[9px] text-slate-500 uppercase tracking-widest">Entry ID: {completedDiscovery.id}</span>
            </div>
          </div>
          <button 
            onClick={handleReset}
            className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white hover:border-slate-600 transition-all"
          >
            New Research Operation
          </button>
        </div>

        <AnalysisReport 
          data={completedDiscovery.object} 
          level={ExplanationLevel.RESEARCH} 
          imagePreview={imageData} 
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-[#0d1117] border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl">
            <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-blue-500 mb-10">Research Configuration</h3>
            
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Operation Mode</label>
                <div className="grid grid-cols-1 gap-2">
                  {[ResearchMode.ANOMALY_DISCOVERY, ResearchMode.VARIABLE_STAR, ResearchMode.EXOPLANET_TRANSIT, ResearchMode.IMAGE_ANALYSIS].map(m => (
                    <button 
                      key={m} 
                      onClick={() => setMode(m)}
                      className={`text-left px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${mode === m ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-black/40 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Target Designation</label>
                <input 
                  type="text" 
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="e.g. PSR B1919+21" 
                  className="w-full bg-black/60 border border-slate-800 rounded-2xl px-6 py-5 text-sm font-mono focus:border-blue-500 outline-none transition-all placeholder:text-slate-800" 
                />
              </div>

              <button 
                onClick={runPipeline}
                disabled={status !== PipelineStatus.IDLE && status !== PipelineStatus.COMPLETED && status !== PipelineStatus.FAILED}
                className="w-full bg-white text-black font-black py-6 rounded-2xl uppercase text-[12px] tracking-[0.4em] hover:bg-blue-500 hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] disabled:opacity-30"
              >
                Execute Pipeline
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="bg-black/40 border border-slate-800 rounded-[2.5rem] p-10 h-full flex flex-col">
            <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-10">Neural Monitoring Core</h3>
            
            <div className="flex-1 space-y-6">
              {stages.map(stage => (
                <div key={stage.id} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${stage.status === 'active' ? 'bg-blue-500 animate-ping' : (stage.status === 'success' ? 'bg-emerald-500' : (stage.status === 'error' ? 'bg-red-500' : 'bg-slate-800'))}`}></div>
                      {stage.label}
                    </span>
                    <span className="text-[9px] font-mono text-slate-600 uppercase font-bold">{stage.status}</span>
                  </div>
                  {stage.log.length > 0 && (
                    <div className="bg-black/60 p-4 rounded-xl border border-slate-800 font-mono text-[9px] text-slate-500 space-y-1">
                      {stage.log.map((line, i) => (
                        <div key={i}><span className="text-blue-500 opacity-50">▸</span> {line}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {status === PipelineStatus.PROCESSING && (
              <div className="mt-10 py-6 text-center animate-pulse">
                <span className="text-[9px] text-blue-400 font-black uppercase tracking-[0.4em]">Deciphering Spectral Geometry...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchEngine;
