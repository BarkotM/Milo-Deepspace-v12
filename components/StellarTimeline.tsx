
import React, { useState, useMemo } from 'react';
import { SimulationPhase, ExplanationLevel, ObjectClass } from '../types';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface StellarTimelineProps {
  data: SimulationPhase[];
  level: ExplanationLevel;
  objectClass: ObjectClass;
}

const FormationVisualizer: React.FC<{ phase: SimulationPhase, objectClass: ObjectClass }> = ({ phase, objectClass }) => {
  const isNebula = objectClass === ObjectClass.NEBULA;
  const isGalaxy = objectClass === ObjectClass.GALAXY;
  const isStar = objectClass === ObjectClass.STAR;
  const isCluster = objectClass === ObjectClass.GLOBULAR_CLUSTER;
  const isBlackHole = objectClass === ObjectClass.BLACK_HOLE;

  const isBlueGiant = isStar && phase.temp > 10000;

  return (
    <div className="relative w-full aspect-square flex items-center justify-center perspective-[2000px]">
      <svg width="100%" height="100%" viewBox="0 0 400 400" className="overflow-visible drop-shadow-[0_0_80px_rgba(0,0,0,0.95)] transform-gpu rotate-x-[30deg]">
        <defs>
          {/* Volumetric Nebula Filter */}
          <filter id="volumetricNebula" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="35" result="blur" />
            <feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves="6" result="noise" />
            <feDisplacementMap in="blur" in2="noise" scale="60" />
            <feComposite in="noise" in2="SourceAlpha" operator="in" />
          </filter>

          {/* Accretion Warp Filter */}
          <filter id="accretionWarp">
            <feGaussianBlur stdDeviation="2" />
            <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" seed="2" />
            <feDisplacementMap in="SourceGraphic" scale="15" />
          </filter>

          <radialGradient id="highEnergyCore" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="white" />
            <stop offset="20%" stopColor="white" />
            <stop offset="100%" stopColor={phase.color} />
          </radialGradient>

          <radialGradient id="eventHorizonGradient" cx="50%" cy="50%" r="50%">
            <stop offset="88%" stopColor="black" />
            <stop offset="92%" stopColor={phase.color} stopOpacity="0.9" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* 3D Spacetime Grid */}
        <g opacity="0.12" className="transform-gpu -translate-y-24">
          {[...Array(12)].map((_, i) => (
            <path key={i} d={`M${i * 36} 0 L${i * 36} 400`} stroke="white" strokeWidth="0.5" />
          ))}
          {[...Array(12)].map((_, i) => (
            <path key={i} d={`M0 ${i * 36} L400 ${i * 36}`} stroke="white" strokeWidth="0.5" />
          ))}
        </g>

        {/* --- BLACK HOLE SIMULATION --- */}
        {isBlackHole && (
          <g className="origin-center">
            {/* Relativistic Jet / Accretion Glow */}
            <circle cx="200" cy="200" r="160" fill={phase.color} fillOpacity="0.1" filter="blur(40px)" />
            
            {/* Accretion Disk (Perspective Warped) */}
            <g filter="url(#accretionWarp)">
              <ellipse cx="200" cy="200" rx="190" ry="30" fill="none" stroke={phase.color} strokeWidth="12" strokeOpacity="0.3" className="animate-[spin_3s_linear_infinite]" />
              <ellipse cx="200" cy="200" rx="160" ry="25" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="50 30" className="animate-[spin_5s_linear_infinite_reverse]" />
            </g>

            {/* Event Horizon (Pure Black Singularity) */}
            <circle cx="200" cy="200" r="42" fill="url(#eventHorizonGradient)" />
            <circle cx="200" cy="200" r="40" fill="black" />
            
            {/* Photon Sphere (Bright Edge) */}
            <circle cx="200" cy="200" r="46" stroke={phase.color} strokeWidth="2" strokeOpacity="0.6" fill="none" className="animate-pulse" />
          </g>
        )}

        {/* --- NEBULA SIMULATION --- */}
        {isNebula && (
          <g filter="url(#volumetricNebula)">
            <circle cx="200" cy="200" r="140" fill={phase.color} fillOpacity="0.3" className="animate-pulse duration-[8s]" />
            <circle cx="180" cy="180" r="100" fill="white" fillOpacity="0.05" />
            <circle cx="230" cy="210" r="70" fill={phase.color} fillOpacity="0.1" />
          </g>
        )}

        {/* --- GALAXY SIMULATION --- */}
        {isGalaxy && (
          <g className="animate-[spin_50s_linear_infinite] origin-center">
            <ellipse cx="200" cy="200" rx="200" ry="75" fill={phase.color} fillOpacity="0.15" />
            {/* Spiral Arm Density Waves */}
            <path d="M200 200 C280 140 380 200 400 240" stroke={phase.color} strokeWidth="5" strokeOpacity="0.3" fill="none" filter="blur(2px)" />
            <path d="M200 200 C120 260 20 200 0 160" stroke={phase.color} strokeWidth="5" strokeOpacity="0.3" fill="none" filter="blur(2px)" />
            {/* Central Bulge */}
            <circle cx="200" cy="200" r="40" fill="white" filter="blur(25px)" className="animate-pulse" />
          </g>
        )}

        {/* --- GLOBULAR CLUSTER SIMULATION --- */}
        {isCluster && (
          <g>
            <circle cx="200" cy="200" r="160" fill={phase.color} fillOpacity="0.1" filter="blur(30px)" />
            {[...Array(80)].map((_, i) => (
              <circle 
                key={i} 
                cx={200 + Math.cos(i * 1.3) * (Math.random() * 140 * (1 - Math.pow(Math.random(), 2)))} 
                cy={200 + Math.sin(i * 1.3) * (Math.random() * 140 * (1 - Math.pow(Math.random(), 2)))} 
                r={0.8 + Math.random() * 2.2} 
                fill="white" 
                className="animate-pulse" 
                style={{ animationDelay: `${i * 0.04}s`, opacity: 0.6 + Math.random() * 0.4 }}
              />
            ))}
            <circle cx="200" cy="200" r="55" fill="white" filter="blur(40px)" className="opacity-40" />
          </g>
        )}

        {/* --- STAR SIMULATION --- */}
        {isStar && (
          <g>
            {/* Corona / Atmosphere */}
            <circle cx="200" cy="200" r={isBlueGiant ? 170 : 110} fill={phase.color} fillOpacity="0.2" className="animate-pulse duration-[6s]" />
            {/* Plasma Sphere */}
            <circle cx="200" cy="200" r={isBlueGiant ? 110 : 70} fill="url(#highEnergyCore)" className="shadow-2xl" />
            
            {/* Dynamic Solar Flares */}
            {[...Array(4)].map((_, i) => (
              <path 
                key={i} 
                d={`M${200 + Math.cos(i) * 50} ${200 + Math.sin(i) * 50} L${200 + Math.cos(i) * 120} ${200 + Math.sin(i) * 120}`} 
                stroke="white" 
                strokeWidth="1.5" 
                strokeOpacity="0.3" 
                strokeDasharray="10 20" 
                className="animate-[ping_4s_linear_infinite]"
              />
            ))}
          </g>
        )}

        {/* Central Anomaly Diagnostic */}
        <circle cx="200" cy="200" r="3.5" fill="white" filter="blur(1.5px)" className="animate-ping" />
      </svg>
    </div>
  );
};

const StellarTimeline: React.FC<StellarTimelineProps> = ({ data, level, objectClass }) => {
  const [activeIdx, setActiveIdx] = useState(2);
  const current = data[activeIdx];
  
  const graphData = useMemo(() => data.map((d) => ({
    name: d.label,
    temp: d.temp,
    radius: d.radius
  })), [data]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] p-10 sm:p-14 shadow-4xl relative overflow-hidden group">
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 relative z-10">
        <div>
          <h4 className="text-[15px] font-black uppercase tracking-[0.6em] text-blue-400 flex items-center gap-4">
            <span className="w-4 h-4 rounded-full bg-blue-600 shadow-[0_0_25px_blue] animate-pulse"></span>
            4D {objectClass.toUpperCase()} FORMATION SIMULATOR
          </h4>
          <p className="text-[11px] text-slate-300 uppercase tracking-widest mt-2 font-mono font-black drop-shadow-sm opacity-80">ESSS NEURAL ENGINE V10.5 // PHYSICS-LOCKED REPRESENTATION</p>
        </div>
        <div className="flex gap-4">
           <div className="px-7 py-3.5 bg-slate-950/95 border border-slate-800 rounded-2xl text-[12px] font-mono text-slate-100 shadow-2xl border-t-white/5">
             EPOCH: <span className="text-white font-black">{current.age}</span>
           </div>
           <div className="px-7 py-3.5 bg-blue-600/20 border border-blue-500/30 rounded-2xl text-[12px] font-mono text-blue-300 shadow-2xl backdrop-blur-xl">
             STATE: <span className="text-white font-black uppercase tracking-[0.2em]">{current.state}</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
        
        {/* CENTER: INTERACTIVE SIMULATION CANVAS */}
        <div className="lg:col-span-5 bg-black/90 border border-slate-800 rounded-[3.5rem] overflow-hidden shadow-2xl relative transition-all hover:border-blue-500/60 cursor-crosshair">
          <FormationVisualizer phase={current} objectClass={objectClass} />
          
          <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center bg-black/80 backdrop-blur-2xl px-8 py-5 rounded-[1.8rem] border border-white/10 shadow-3xl">
             <div className="text-[11px] font-black text-slate-200 uppercase tracking-widest">Diagnostic Viewport</div>
             <div className="text-[11px] font-mono text-blue-300 font-black border-l border-white/10 pl-4 ml-4">T-CORE: {current.temp.toLocaleString()} K</div>
          </div>
        </div>

        {/* RIGHT: SCIENTIFIC DATA & GRAPHS */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-12">
          <div className="space-y-10">
            <div className="animate-in slide-in-from-right-6 duration-600">
              <h5 className="text-4xl font-black text-white uppercase tracking-tighter mb-6 leading-none">{current.label}</h5>
              <div className="bg-slate-950/90 border border-slate-800 p-8 rounded-[2.8rem] shadow-inner relative overflow-hidden group/text">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-0 group-hover/text:opacity-100 transition-opacity"></div>
                <p className="text-slate-100 text-lg sm:text-xl leading-relaxed font-medium tracking-tight">
                  {current.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="bg-black/60 border border-slate-800 p-7 rounded-[2.2rem] h-36 flex flex-col shadow-inner group/chart hover:border-blue-500/40 transition-all">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[11px] font-black text-blue-300 uppercase tracking-[0.2em] drop-shadow-[0_0_8px_currentColor]">Thermal Evolution</span>
                  <span className="text-blue-400 font-mono text-[12px] font-black">{current.temp.toLocaleString()} K</span>
                </div>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={graphData}>
                      <Line type="monotone" dataKey="temp" stroke="#3b82f6" strokeWidth={4} dot={false} animationDuration={1000} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-black/60 border border-slate-800 p-7 rounded-[2.2rem] h-36 flex flex-col shadow-inner group/chart hover:border-amber-500/40 transition-all">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[11px] font-black text-amber-300 uppercase tracking-[0.2em] drop-shadow-[0_0_8px_currentColor]">Spatial Expansion</span>
                  <span className="text-amber-400 font-mono text-[12px] font-black">{current.radius.toFixed(4)} Vol-U</span>
                </div>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={graphData}>
                      <Line type="monotone" dataKey="radius" stroke="#f59e0b" strokeWidth={4} dot={false} animationDuration={1000} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* SIMULATION STEP NAVIGATOR */}
          <div className="pt-10">
            <div className="flex justify-between items-center mb-6 px-6">
               <span className="text-[11px] font-black uppercase tracking-[0.6em] text-blue-200/50 font-black">PHASE SEQUENCE NAVIGATION</span>
               <span className="text-[12px] font-mono text-blue-400 font-black border border-blue-500/30 px-4 py-1.5 rounded-xl bg-blue-500/5 shadow-2xl">PHASE {activeIdx + 1} / {data.length}</span>
            </div>
            
            <div className="flex items-center bg-slate-950/90 border border-slate-800 rounded-[2rem] p-3 gap-4 shadow-3xl">
              {data.map((phase, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className={`flex-1 py-5 px-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden ${
                    activeIdx === i 
                    ? 'bg-blue-600 text-white shadow-[0_0_25px_rgba(37,99,235,0.5)] scale-105 border border-white/20' 
                    : 'text-slate-500 hover:text-white hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  {phase.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StellarTimeline;
