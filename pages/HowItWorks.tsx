
import React from 'react';

const HowItWorks: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 space-y-24">
      <section>
        <h1 className="text-4xl font-bold mb-8">The Analysis Pipeline</h1>
        <p className="text-slate-400 text-lg leading-relaxed">
          MILO functions by bridging raw pixel data and archive queries with modern astrophysical computation. Our pipeline ensures that every AI-generated insight is constrained by physical laws and cross-referenced with professional survey catalogues.
        </p>
      </section>

      <div className="space-y-16">
        <div className="grid md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-1 text-4xl font-light text-blue-500/20">01</div>
          <div className="md:col-span-11 space-y-4">
            <h2 className="text-2xl font-bold">Data Acquisition</h2>
            <p className="text-slate-400 leading-relaxed">
              MILO queries professional astronomical archives using Virtual Observatory standards. We aggregate data from:
            </p>
            <ul className="grid grid-cols-2 gap-4 mt-4">
              {['Gaia DR3', 'SDSS (Sloan Digital Sky Survey)', 'TESS', 'Kepler Space Telescope', 'SIMBAD Astronomical Database', 'VizieR Catalogue Service'].map(s => (
                <li key={s} className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-1 text-4xl font-light text-blue-500/20">02</div>
          <div className="md:col-span-11 space-y-4">
            <h2 className="text-2xl font-bold">Physical Analysis</h2>
            <p className="text-slate-400 leading-relaxed">
              Using fundamental physics, MILO computes derived quantities including:
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                <div className="text-blue-400 font-bold text-xs uppercase mb-1">Stellar Parameters</div>
                <div className="text-slate-300 text-sm">Luminosity, Radius, Temperature, and Spectral Class.</div>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                <div className="text-blue-400 font-bold text-xs uppercase mb-1">Kinematics</div>
                <div className="text-slate-300 text-sm">Proper motion and radial velocity via parallax measurements.</div>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                <div className="text-blue-400 font-bold text-xs uppercase mb-1">Cosmology</div>
                <div className="text-slate-300 text-sm">Redshift validation (photometric and spectroscopic).</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-1 text-4xl font-light text-blue-500/20">03</div>
          <div className="md:col-span-11 space-y-4">
            <h2 className="text-2xl font-bold">AI Reasoning (Constraints)</h2>
            <p className="text-slate-400 leading-relaxed">
              Our AI models do not operate in a vacuum. They are constrained by known astrophysical relationships (e.g., the Hertzsprung-Russell diagram, Stefan-Boltzmann law).
            </p>
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-8 italic text-slate-300 text-sm leading-relaxed">
              "AI outputs are checked for physical plausibility. If an inferred mass is inconsistent with the observed spectral type and luminosity, the system flags the uncertainty and provides a weighted probability distribution of possible astrophysical states."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
