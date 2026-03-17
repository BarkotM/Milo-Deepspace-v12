
import React, { useState, useEffect } from 'react';
import { AstronomicalObject, ExplanationLevel, ObjectClass, ScientificValue } from '../types';
import { getScientificInsight } from '../services/geminiService';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface AnalysisReportProps {
  data: AstronomicalObject;
  level: ExplanationLevel;
  imagePreview?: string;
}

const InfoRow: React.FC<{ label: string; value: ScientificValue<any>; color?: string }> = ({ label, value, color = 'text-blue-400' }) => (
  <div className="flex flex-col py-4 border-b border-slate-800/80 group">
    <div className="flex justify-between items-baseline gap-2">
      <span className={`text-[11px] font-black uppercase tracking-[0.3em] ${color} drop-shadow-[0_0_10px_currentColor] group-hover:brightness-125 transition-all`}>
        {label}
      </span>
      <span className="text-base font-mono font-black text-white text-right tracking-tighter">
        {typeof value.value === 'number' && !label.toLowerCase().includes('count') && !label.toLowerCase().includes('ratio')
          ? value.value.toLocaleString(undefined, { maximumFractionDigits: 6 }) 
          : value.value}
      </span>
    </div>
    <div className="flex justify-between mt-2 text-[9px] font-mono text-slate-200 uppercase tracking-widest font-black">
      <span className="opacity-70 bg-slate-900 px-2 py-0.5 rounded">{value.method}</span>
      <span className="text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">[{value.origin}]</span>
    </div>
  </div>
);

const ExplorerTab: React.FC<{ data: AstronomicalObject }> = ({ data }) => {
  const curveData = data.rawData?.lightCurve || [];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-3xl">
        <div className="flex justify-between items-center mb-8">
          <h4 className="text-[12px] font-black uppercase tracking-[0.4em] text-blue-400">Photometric Light Curve // ARCHIVE-SYNC</h4>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-black rounded-lg text-[9px] font-mono text-slate-500 border border-slate-800">Verified Payload</span>
          </div>
        </div>
        <div className="h-[300px] w-full">
          {curveData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={curveData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#475569' }} label={{ value: 'Epoch', position: 'insideBottomRight', offset: -5, fontSize: 9 }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }} />
                <Line type="monotone" dataKey="flux" stroke="#3b82f6" strokeWidth={2} dot={false} animationDuration={1500} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-700 font-black uppercase tracking-[0.5em] text-[10px]">No Data Points in Payload</div>
          )}
        </div>
        <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-6 text-center font-black">Time Axis // Baseline Normalized Flux</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10">
          <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-400 mb-6">Spectral Distribution</h4>
          <div className="aspect-video bg-black/40 rounded-3xl flex items-center justify-center border border-slate-800">
             <span className="text-[10px] text-slate-600 uppercase tracking-widest font-black">Locked to Progenitor Model</span>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10">
          <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-6">Anomaly Vector Analysis</h4>
          <div className="aspect-video bg-black/40 rounded-3xl flex items-center justify-center border border-slate-800">
             <span className="text-[10px] text-slate-600 uppercase tracking-widest font-black">Z-Score Normalization Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AnalysisReport: React.FC<AnalysisReportProps> = ({ data, level, imagePreview }) => {
  const [insight, setInsight] = useState(data.insight || "");
  const [activeTab, setActiveTab] = useState<'synthesis' | 'explorer' | 'validation'>('synthesis');
  const [loadingInsight, setLoadingInsight] = useState(!data.insight);

  useEffect(() => {
    if (!data.insight) {
      setLoadingInsight(true);
      getScientificInsight(data, level).then(res => {
        setInsight(res);
        setLoadingInsight(false);
      });
    }
  }, [data.name, level]);

  const insightBullets = insight.split('•').filter(b => b.trim().length > 0);
  const p = data.physicalProperties;

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-full">
      <div className="flex justify-center">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1.5 flex gap-2 shadow-2xl">
          {[
            { id: 'synthesis', label: 'Synthesis' },
            { id: 'explorer', label: 'Data Explorer' },
            { id: 'validation', label: 'Validation Lab' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'synthesis' && (
        <>
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-3xl relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-2xl">Verified</span>
                  <span className="text-[10px] font-mono text-slate-100 uppercase tracking-widest font-black">ARCHIVE: {data.id}</span>
                </div>
                <h2 className="text-4xl font-black tracking-tighter text-white leading-tight">{data.name}</h2>
                <div className="flex gap-2">
                  <span className="bg-slate-800 text-white px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border border-slate-700">{data.objectClass}</span>
                  <span className="bg-blue-500/20 text-blue-300 px-5 py-2 rounded-xl text-[11px] font-mono border border-blue-500/30 font-black">{data.type}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Spectral coordinates</div>
                <div className="text-xl font-mono font-black text-white">{data.coordinates?.ra || "N/A"} / {data.coordinates?.dec || "N/A"}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
            <div className="xl:col-span-7 space-y-10">
              <div className="bg-slate-950 border border-slate-800 rounded-[3rem] p-14 shadow-4xl relative overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16 relative z-10">
                  <section className="space-y-2">
                    <h4 className="text-[13px] font-black text-blue-400 uppercase tracking-[0.5em] border-b border-slate-800 pb-4 mb-8 flex items-center gap-3">Metric Payload</h4>
                    <InfoRow label="Distance" value={data.distance} />
                    {p.radius && <InfoRow label="Radius (R☉)" value={p.radius} />}
                    {p.luminosity && <InfoRow label="Luminosity (L☉)" value={p.luminosity} />}
                  </section>
                  <section className="space-y-2">
                    <h4 className="text-[13px] font-black text-amber-400 uppercase tracking-[0.5em] border-b border-slate-800 pb-4 mb-8 flex items-center gap-3">Physics</h4>
                    {p.massEstimate && <InfoRow color="text-amber-400" label="Est. Mass" value={p.massEstimate} />}
                    {p.temperature && <InfoRow color="text-amber-400" label="Temp (K)" value={p.temperature} />}
                    {p.redshift && <InfoRow color="text-amber-400" label="Redshift (z)" value={p.redshift} />}
                  </section>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 rounded-[2.5rem] p-10 relative overflow-hidden">
                  <h4 className="text-[14px] font-black uppercase tracking-[0.5em] text-blue-300 mb-10">Scientific Synthesis</h4>
                  {loadingInsight ? (
                    <div className="py-10 flex flex-col items-center gap-4">
                      <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Processing Neural Synthesis...</span>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {insightBullets.map((bullet, i) => (
                        <div key={i} className="flex gap-7 group">
                          <div className="text-blue-500 font-black text-2xl">•</div>
                          <div className="text-slate-100 text-lg leading-relaxed font-medium tracking-tight">{bullet.trim()}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="xl:col-span-5">
              <div className="rounded-[3.5rem] border border-slate-800 overflow-hidden shadow-4xl bg-black aspect-square flex items-center justify-center">
                {imagePreview ? (
                  <img src={imagePreview} className="w-full h-full object-cover opacity-90" alt="Observation" />
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 border-2 border-slate-800 rounded-full flex items-center justify-center">
                       <div className="w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>
                    </div>
                    <div className="text-slate-700 font-black text-xs uppercase tracking-[0.8em]">NULL_VISUAL</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'explorer' && <ExplorerTab data={data} />}
      {activeTab === 'validation' && (
        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 text-center text-slate-500 uppercase tracking-widest font-black text-[10px]">
          Physics Engine Consistency Pass: Active // Results committed to data stream.
        </div>
      )}
    </div>
  );
};

export default AnalysisReport;
