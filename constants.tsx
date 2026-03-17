
import React from 'react';

// Precise reconstruction of the uploaded logo: 
// A bold rounded square containing a telescope pointing at a 4-pointed star.
export const MILO_LOGO = (
  <svg width="40" height="40" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="12" y="12" width="232" height="232" rx="54" fill="white" />
    <rect x="12" y="12" width="232" height="232" rx="54" stroke="black" strokeWidth="20" fill="transparent" />
    
    {/* 4-pointed star */}
    <path d="M128 50C128 75 110 82 128 105C128 82 146 75 128 50Z" fill="black" />
    <path d="M103 82C128 82 135 64 153 82C135 82 128 100 103 82Z" fill="black" />
    
    {/* Telescope - Simplified geometric form matching the icon */}
    <g transform="translate(128, 155) rotate(-45)">
      {/* Main Tube */}
      <rect x="-65" y="-12" width="110" height="28" fill="black" />
      {/* Objective Lens housing */}
      <rect x="45" y="-18" width="18" height="40" fill="black" />
      {/* Eyepiece */}
      <rect x="-75" y="-8" width="10" height="20" fill="black" />
      {/* Mount/Tripod */}
      <path d="M-5 16L-18 45M-5 16L8 45" stroke="black" strokeWidth="12" strokeLinecap="round" />
    </g>
  </svg>
);

export const SURVEYS = [
  "Gaia DR3",
  "SDSS",
  "TESS",
  "Kepler",
  "SIMBAD",
  "VizieR"
];
