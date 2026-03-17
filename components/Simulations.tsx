
import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

type SimMode = 'blackhole' | 'formation' | 'solar';

interface SimulationParams {
  mass: number;      
  velocity: number;  
  density: number;   
  spin: number; 
  povActive: boolean;
  povProgress: number; 
  povSpeedMultiplier: number; 
  collapseActive: boolean;
  collapseProgress: number;
  solarTimeSpeed: number; // 1.0 = 1 Day per second
  focusedPlanet: string | null;
}

const BH_PARTICLE_COUNT = 600000;
const GAS_PARTICLE_COUNT = 500000;
const STAR_COUNT = 100000;

// Scientific constants for planets (Mean Longitude L at J2000, Period in Years, Distance in AU)
const PLANETS = [
  { name: 'Mercury', color: '#8c8c8c', dist: 0.39, size: 20, period: 0.2408, L0: 252.25 },
  { name: 'Venus', color: '#e3bb76', dist: 0.72, size: 35, period: 0.6152, L0: 181.98 },
  { name: 'Earth', color: '#2271b3', dist: 1.00, size: 38, period: 1.0000, L0: 100.46 },
  { name: 'Mars', color: '#e27b58', dist: 1.52, size: 28, period: 1.8808, L0: 355.45 },
  { name: 'Jupiter', color: '#d39c7e', dist: 5.20, size: 120, period: 11.862, L0: 34.40 },
  { name: 'Saturn', color: '#c5ab6e', dist: 9.58, size: 105, period: 29.447, L0: 49.94, hasRings: true },
  { name: 'Uranus', color: '#b5e3e3', dist: 19.22, size: 70, period: 84.017, L0: 313.23 },
  { name: 'Neptune', color: '#4b70dd', dist: 30.05, size: 68, period: 164.79, L0: 304.88 },
];

// J2000.0 Epoch Reference: January 1, 2000, 12:00 UTC
const J2000 = new Date('2000-01-01T12:00:00Z').getTime();

const Simulations: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [activeSim, setActiveSim] = useState<SimMode>('blackhole');
  const [params, setParams] = useState<SimulationParams>({
    mass: 500, velocity: 92, density: 60, spin: 0.85, 
    povActive: false, povProgress: 0, povSpeedMultiplier: 60, 
    collapseActive: false, collapseProgress: 0,
    solarTimeSpeed: 1.0, focusedPlanet: null
  });

  const [earthTime, setEarthTime] = useState(0);
  const [localTime, setLocalTime] = useState(0);
  const [hudProgress, setHudProgress] = useState(0);
  const [infoMinimized, setInfoMinimized] = useState(false);
  const [controlsMinimized, setControlsMinimized] = useState(false);
  
  // Ephemeris state
  const [simulatedDate, setSimulatedDate] = useState(new Date());

  const earthTimeRef = useRef(0);
  const localTimeRef = useRef(0);
  const activeSimRef = useRef<SimMode>('blackhole');
  const pRef = useRef(params);

  // Time tracking for Solar System (Days since J2000)
  const daysSinceJ2000Ref = useRef((Date.now() - J2000) / (1000 * 60 * 60 * 24));

  useEffect(() => { pRef.current = params; }, [params]);
  useEffect(() => { activeSimRef.current = activeSim; }, [activeSim]);

  const canvasRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const clock = useRef(new THREE.Clock());
  const frameRef = useRef(0);

  const objects = useRef<{
    meshes: Map<string, THREE.Object3D>;
    materials: Map<string, THREE.ShaderMaterial | THREE.Material>;
    starfieldData?: any;
    initialCamPos: THREE.Vector3;
    planets: Map<string, THREE.Mesh>;
  }>({ 
    meshes: new Map(), 
    materials: new Map(),
    initialCamPos: new THREE.Vector3(5000, 1500, 9000),
    planets: new Map()
  });

  const init = () => {
    if (!canvasRef.current) return;
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(35, canvasRef.current.clientWidth / canvasRef.current.clientHeight, 1, 5000000);
    camera.position.copy(objects.current.initialCamPos);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    setupStarfield(scene);
    onResize();
    window.addEventListener('resize', onResize);
  };

  const setupStarfield = (scene: THREE.Scene) => {
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(STAR_COUNT * 3);
    const starCol = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      const r = 400000 + Math.random() * 600000;
      const t = Math.random() * Math.PI * 2;
      const f = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(f) * Math.cos(t);
      const y = r * Math.sin(f) * Math.sin(t);
      const z = r * Math.cos(f);
      starPos[i * 3] = x; starPos[i * 3 + 1] = y; starPos[i * 3 + 2] = z;
      const b = 0.4 + Math.random() * 0.6;
      starCol[i * 3] = b; starCol[i * 3 + 1] = b; starCol[i * 3 + 2] = b;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starCol, 3));
    const starfield = new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 180, vertexColors: true, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending }));
    starfield.name = 'starfield';
    scene.add(starfield);
    objects.current.meshes.set('starfield', starfield);
  };

  const setupSolarSystem = () => {
    const scene = sceneRef.current!;
    objects.current.planets.clear();

    const sun = new THREE.Mesh(new THREE.SphereGeometry(300, 32, 32), new THREE.MeshBasicMaterial({ color: 0xffdd44 }));
    scene.add(sun);
    objects.current.meshes.set('sun', sun);

    const sunGlow = new THREE.Mesh(new THREE.SphereGeometry(450, 32, 32), new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending }));
    scene.add(sunGlow);
    objects.current.meshes.set('sunGlow', sunGlow);

    PLANETS.forEach(p => {
      const visualDist = (Math.log(p.dist + 1) / Math.log(31)) * 25000 + 1000;
      const orbitPts = new THREE.Path().absarc(0, 0, visualDist, 0, Math.PI * 2, false).getPoints(128);
      const orbitLine = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(orbitPts), new THREE.LineBasicMaterial({ color: p.color, transparent: true, opacity: 0.15 }));
      orbitLine.rotation.x = Math.PI / 2;
      scene.add(orbitLine);
      objects.current.meshes.set(`${p.name}_orbit`, orbitLine);

      const mesh = new THREE.Mesh(new THREE.SphereGeometry(p.size, 32, 32), new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.7, metalness: 0.2 }));
      if (p.hasRings) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(p.size * 1.8, 8, 2, 64), new THREE.MeshBasicMaterial({ color: p.color, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
        ring.rotation.x = Math.PI / 2.5;
        mesh.add(ring);
      }
      scene.add(mesh);
      objects.current.planets.set(p.name, mesh);
      objects.current.meshes.set(p.name, mesh);
    });

    const light = new THREE.PointLight(0xffffff, 5, 1000000, 0.5);
    scene.add(light);
    objects.current.meshes.set('solarLight', light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.15));
  };

  const setupBlackHole = () => {
    const scene = sceneRef.current!;
    const Rs = 100 + pRef.current.mass;
    const horizon = new THREE.Mesh(new THREE.SphereGeometry(Rs, 64, 64), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    scene.add(horizon);
    objects.current.meshes.set('horizon', horizon);

    const ringGeo = new THREE.TorusGeometry(Rs * 1.5, 1.2, 32, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
    const photonRing = new THREE.Mesh(ringGeo, ringMat);
    photonRing.rotation.x = Math.PI / 2;
    scene.add(photonRing);
    objects.current.meshes.set('photonRing', photonRing);

    const diskMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uRs: { value: Rs }, uCameraPos: { value: new THREE.Vector3() }, uVelocity: { value: pRef.current.velocity * 0.01 } },
      vertexShader: `
        uniform float uTime; uniform float uRs; uniform vec3 uCameraPos; uniform float uVelocity;
        attribute float aRadius; attribute float aAngle; attribute float aVOff; attribute vec3 aBaseColor;
        varying vec3 vColor;
        void main() {
          float vK = sqrt(uRs * 150000.0 / aRadius);
          float dilation = sqrt(max(0.0001, 1.0 - uRs / aRadius));
          float currentAngle = aAngle + vK * uVelocity * 0.1 * dilation * uTime;
          vec3 truePos = vec3(cos(currentAngle) * aRadius, aVOff, sin(currentAngle) * aRadius);
          vec3 camDir = normalize(uCameraPos);
          vec3 bhToPos = normalize(truePos);
          float thetaTrue = acos(clamp(dot(bhToPos, -camDir), -1.0, 1.0));
          float lensingStrength = (uRs * 2.2) / (aRadius * (1.1 + cos(thetaTrue)));
          vec3 warpAxis = normalize(cross(cross(bhToPos, camDir), camDir));
          vec3 apparentPos = truePos + warpAxis * (lensingStrength * aRadius * 1.15);
          vec3 velocityVec = vec3(-sin(currentAngle), 0.0, cos(currentAngle));
          float beta = dot(velocityVec, -camDir) * 0.45 * (uRs / aRadius);
          float doppler = sqrt((1.0 + beta) / (1.0 - beta));
          vColor = aBaseColor * pow(doppler, 4.0) * dilation;
          vec4 mvPosition = modelViewMatrix * vec4(apparentPos, 1.0);
          gl_PointSize = (20.0 / -mvPosition.z) * 1500.0;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `varying vec3 vColor; void main() { float r = length(gl_PointCoord - vec2(0.5)); if (r > 0.5) discard; gl_FragColor = vec4(vColor, (1.0 - r * 2.0)); }`,
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
    });
    objects.current.materials.set('disk', diskMat);

    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(BH_PARTICLE_COUNT * 3);
    const radius = new Float32Array(BH_PARTICLE_COUNT);
    const angle = new Float32Array(BH_PARTICLE_COUNT);
    const vOff = new Float32Array(BH_PARTICLE_COUNT);
    const color = new Float32Array(BH_PARTICLE_COUNT * 3);
    for (let i = 0; i < BH_PARTICLE_COUNT; i++) {
      const r = Rs * 2.3 + Math.pow(Math.random(), 2.5) * 18000;
      const t = Math.random() * Math.PI * 2;
      radius[i] = r; angle[i] = t; vOff[i] = (Math.random() - 0.5) * 45 * (Rs/r);
      const c = new THREE.Color().setHSL(0.06 + (r - Rs*2.3)/18000 * 0.15, 0.9, 0.6);
      color[i*3] = c.r; color[i*3+1] = c.g; color[i*3+2] = c.b;
    }
    geo.setAttribute('aRadius', new THREE.BufferAttribute(radius, 1));
    geo.setAttribute('aAngle', new THREE.BufferAttribute(angle, 1));
    geo.setAttribute('aVOff', new THREE.BufferAttribute(vOff, 1));
    geo.setAttribute('aBaseColor', new THREE.BufferAttribute(color, 3));
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const accretion = new THREE.Points(geo, diskMat);
    accretion.frustumCulled = false;
    scene.add(accretion);
    objects.current.meshes.set('accretion', accretion);
  };

  const setupStarFormation = () => {
    const scene = sceneRef.current!;
    const gasMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uCollapse: { value: 0 },
        uSpin: { value: pRef.current.spin },
        uTurbulence: { value: pRef.current.density * 0.05 }
      },
      vertexShader: `
        uniform float uTime; uniform float uCollapse; uniform float uSpin; uniform float uTurbulence;
        attribute vec3 aInitialPos; attribute float aPhase; attribute vec3 aBaseColor;
        varying vec3 vColor; varying float vAlpha;

        void main() {
          vec3 pos = aInitialPos;
          float dist = length(pos);
          float rad = dist * (1.0 - uCollapse * 0.992);
          
          float angularVel = (uSpin * 0.5 + 0.5) * (uCollapse * 6.0 + 1.0) * pow(dist/10000.0, -0.6);
          float angle = aPhase + uTime * angularVel;
          
          float flattening = 1.0 - uCollapse * 0.92;
          vec3 targetPos = vec3(cos(angle) * rad, pos.y * flattening, sin(angle) * rad);
          
          targetPos += vec3(sin(uTime * 0.2 + dist * 0.001), cos(uTime * 0.15 + dist * 0.001), sin(uTime * 0.25 + dist * 0.001)) * uTurbulence * (1.0 - uCollapse);

          float tempFactor = uCollapse * (1.0 - dist / 30000.0) * 3.5;
          vColor = mix(aBaseColor, vec3(1.0, 0.6, 0.3), clamp(tempFactor, 0.0, 1.0));
          if(uCollapse > 0.75) vColor = mix(vColor, vec3(1.0, 1.0, 1.0), (uCollapse - 0.75) * 4.0);
          
          float clearRange = (uCollapse - 0.92) * 20.0;
          vAlpha = (uCollapse > 0.92 && dist < 20000.0 * clearRange) ? 0.0 : 1.0;

          vec4 mvPosition = modelViewMatrix * vec4(targetPos, 1.0);
          gl_PointSize = (18.0 / -mvPosition.z) * 1500.0;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor; varying float vAlpha;
        void main() {
          float r = length(gl_PointCoord - vec2(0.5));
          if (r > 0.5 || vAlpha < 0.1) discard;
          gl_FragColor = vec4(vColor, vAlpha * (1.0 - r * 2.0));
        }
      `,
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
    });
    objects.current.materials.set('gas', gasMat);

    const geo = new THREE.BufferGeometry();
    const initialPos = new Float32Array(GAS_PARTICLE_COUNT * 3);
    const phases = new Float32Array(GAS_PARTICLE_COUNT);
    const colors = new Float32Array(GAS_PARTICLE_COUNT * 3);
    
    for (let i = 0; i < GAS_PARTICLE_COUNT; i++) {
      const r = 3000 + Math.random() * 28000;
      const t = Math.random() * Math.PI * 2;
      const f = Math.acos(2 * Math.random() - 1);
      initialPos[i*3] = r * Math.sin(f) * Math.cos(t);
      initialPos[i*3+1] = r * Math.sin(f) * Math.sin(t) * 0.8;
      initialPos[i*3+2] = r * Math.cos(f);
      phases[i] = t;
      const c = new THREE.Color().setHSL(0.02, 0.9, 0.3 + Math.random() * 0.3);
      colors[i*3] = c.r; colors[i*3+1] = c.g; colors[i*3+2] = c.b;
    }
    geo.setAttribute('aInitialPos', new THREE.BufferAttribute(initialPos, 3));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geo.setAttribute('aBaseColor', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(GAS_PARTICLE_COUNT * 3), 3));
    
    const cloud = new THREE.Points(geo, gasMat);
    cloud.frustumCulled = false;
    scene.add(cloud);
    objects.current.meshes.set('cloud', cloud);

    const jetGeo = new THREE.CylinderGeometry(10, 80, 8000, 32, 1, true);
    const jetMat = new THREE.MeshBasicMaterial({ color: 0x66aaff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending });
    const jetNorth = new THREE.Mesh(jetGeo, jetMat);
    jetNorth.position.y = 4000;
    const jetSouth = new THREE.Mesh(jetGeo, jetMat);
    jetSouth.position.y = -4000;
    const jets = new THREE.Group();
    jets.add(jetNorth, jetSouth);
    scene.add(jets);
    objects.current.meshes.set('jets', jets);
    objects.current.materials.set('jetMat', jetMat);
  };

  const onResize = () => {
    if (!canvasRef.current || !cameraRef.current || !rendererRef.current) return;
    const w = canvasRef.current.clientWidth;
    const h = canvasRef.current.clientHeight;
    cameraRef.current.aspect = w / h;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(w, h);
  };

  const clear = () => {
    const scene = sceneRef.current;
    if (!scene) return;
    objects.current.meshes.forEach((obj, key) => { if(key !== 'starfield') scene.remove(obj) });
    objects.current.meshes.clear();
    const sf = scene.getObjectByName('starfield');
    if (sf) objects.current.meshes.set('starfield', sf);
    objects.current.materials.clear();
  };

  const animate = () => {
    frameRef.current = requestAnimationFrame(animate);
    const dt = Math.min(0.05, clock.current.getDelta());
    const p = pRef.current;
    const sim = activeSimRef.current;
    
    // In solar mode, dt reflects "Simulated Days" passed based on speed
    const simDaysPassed = dt * p.solarTimeSpeed;
    if (sim === 'solar') {
        daysSinceJ2000Ref.current += simDaysPassed;
    }

    const timeScale = sim === 'solar' ? p.solarTimeSpeed : (p.povActive ? p.povSpeedMultiplier : (p.collapseActive ? 8 : 1.2));
    earthTimeRef.current += dt * timeScale;

    if (controlsRef.current && !p.povActive && !p.focusedPlanet) controlsRef.current.update();

    if (sim === 'blackhole') {
      const diskMat = objects.current.materials.get('disk') as THREE.ShaderMaterial;
      if (diskMat) {
        diskMat.uniforms.uTime.value = earthTimeRef.current;
        diskMat.uniforms.uCameraPos.value.copy(cameraRef.current!.position);
        diskMat.uniforms.uRs.value = 100 + p.mass;
        diskMat.uniforms.uVelocity.value = p.velocity * 0.01;
      }
      if (p.povActive) {
        const nextProg = Math.min(1, p.povProgress + 0.001 * (p.povSpeedMultiplier / 60));
        if (nextProg !== p.povProgress) {
          setParams(prev => ({ ...prev, povProgress: nextProg }));
          setHudProgress(nextProg);
        }
        const dilation = Math.sqrt(Math.max(0.0001, 1 - (100+p.mass) / cameraRef.current!.position.length()));
        localTimeRef.current += dt * dilation * p.povSpeedMultiplier;
        const curve = 1.0 - Math.pow(1.0 - p.povProgress, 2.8);
        cameraRef.current!.position.lerpVectors(objects.current.initialCamPos, new THREE.Vector3(0, 0, 0), curve);
        cameraRef.current!.lookAt(0, 0, 0);
        if (p.povProgress >= 0.999) setParams(prev => ({ ...prev, povActive: false }));
      }
    } else if (sim === 'formation') {
      const gasMat = objects.current.materials.get('gas') as THREE.ShaderMaterial;
      const jetMat = objects.current.materials.get('jetMat') as THREE.MeshBasicMaterial;
      if (gasMat) {
        gasMat.uniforms.uTime.value = earthTimeRef.current;
        gasMat.uniforms.uSpin.value = p.spin;
        gasMat.uniforms.uCollapse.value = p.collapseProgress;
      }
      if (jetMat) {
        const jetStr = (p.collapseProgress > 0.55 && p.collapseProgress < 0.95) ? (p.collapseProgress - 0.55) * 4.0 : 0;
        jetMat.opacity = Math.min(0.7, jetStr);
      }
      if (p.collapseActive) {
        const nextProg = Math.min(1, p.collapseProgress + 0.0015);
        if (nextProg !== p.collapseProgress) {
          setParams(prev => ({ ...prev, collapseProgress: nextProg }));
          setHudProgress(nextProg);
        }
        if (p.collapseProgress >= 1) setParams(prev => ({ ...prev, collapseActive: false }));
      }
    } else if (sim === 'solar') {
      PLANETS.forEach(planetData => {
        const mesh = objects.current.planets.get(planetData.name);
        if (mesh) {
          const visualDist = (Math.log(planetData.dist + 1) / Math.log(31)) * 25000 + 1000;
          
          // Mean Daily Motion n = 360 / Period_Days
          const n = 360 / (planetData.period * 365.25);
          const currentLongitude = (planetData.L0 + n * daysSinceJ2000Ref.current) % 360;
          const angleRad = (currentLongitude * Math.PI) / 180;
          
          mesh.position.set(Math.cos(angleRad) * visualDist, 0, Math.sin(angleRad) * visualDist);
          mesh.rotation.y += dt * 0.5;
          if (p.focusedPlanet === planetData.name) {
            const offset = new THREE.Vector3(planetData.size * 5, planetData.size * 2, planetData.size * 5);
            cameraRef.current!.position.copy(mesh.position).add(offset);
            cameraRef.current!.lookAt(mesh.position);
          }
        }
      });
      // Sync clock
      const newDate = new Date(J2000 + daysSinceJ2000Ref.current * 86400000);
      setSimulatedDate(newDate);
    }

    if (Math.floor(earthTimeRef.current * 10) % 2 === 0) {
      setEarthTime(earthTimeRef.current);
      setLocalTime(localTimeRef.current);
    }

    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };

  useEffect(() => {
    init(); animate();
    return () => { cancelAnimationFrame(frameRef.current); rendererRef.current?.dispose(); window.removeEventListener('resize', onResize); };
  }, []);

  useEffect(() => {
    clear();
    setHudProgress(0);
    if (activeSim === 'blackhole') setupBlackHole();
    else if (activeSim === 'formation') setupStarFormation();
    else if (activeSim === 'solar') setupSolarSystem();
  }, [activeSim]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none font-mono">
      <div ref={canvasRef} className="absolute inset-0" />

      {/* SCIENTIFIC HUD OVERLAY */}
      {(params.povActive || params.collapseActive || params.collapseProgress > 0 || activeSim === 'solar') && (
        <div className="absolute inset-0 z-50 pointer-events-none p-12 flex flex-col justify-between border-[20px] border-white/5">
          <div className="flex justify-between items-start">
            <div className="space-y-4">
               <div className="flex items-center gap-4">
                 <div className={`w-3 h-3 rounded-full ${activeSim === 'blackhole' ? 'bg-red-600' : 'bg-blue-600'} animate-pulse`}></div>
                 <div className="text-[12px] font-black text-white uppercase tracking-[0.4em]">{activeSim.toUpperCase()} // ACTIVE</div>
               </div>
               <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Diagnostic Lock: {activeSim === 'solar' ? 'EPHEMERIS_SYNC_V1' : (activeSim === 'blackhole' ? 'SGR_A_PROXIMITY' : 'GMC_COLLAPSE_B2')}</div>
            </div>
            
            {activeSim === 'solar' && (
              <div className="flex flex-wrap gap-2 max-w-sm justify-end pointer-events-auto">
                {PLANETS.map(p => (
                  <button key={p.name} onClick={() => setParams(prev => ({ ...prev, focusedPlanet: prev.focusedPlanet === p.name ? null : p.name }))} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${params.focusedPlanet === p.name ? 'bg-blue-600 text-white border-blue-400' : 'bg-black/60 text-slate-500 border-white/10 hover:border-white/30'}`}>
                    {p.name}
                  </button>
                ))}
              </div>
            )}

            {activeSim !== 'solar' && (
              <div className="text-right space-y-4">
                <div className="bg-black/80 p-6 border border-white/10 rounded-2xl backdrop-blur-md">
                  <div className="text-[9px] text-slate-500 uppercase font-black mb-2 tracking-widest">Operational Delta</div>
                  <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${hudProgress * 100}%` }}></div>
                  </div>
                  <div className="mt-2 text-white font-black text-[10px] tracking-widest">{Math.floor(hudProgress * 100)}% COMPLETE</div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-end">
            <div className="bg-black/80 backdrop-blur-3xl p-10 border border-white/5 rounded-[2.5rem] grid grid-cols-2 gap-16 shadow-2xl">
               <div className="space-y-2">
                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{activeSim === 'solar' ? 'Observation Date' : 'Archive Time (s)'}</div>
                  <div className="text-4xl font-black text-white tabular-nums tracking-tighter">
                    {activeSim === 'solar' ? simulatedDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : earthTime.toFixed(2)}
                  </div>
               </div>
               {activeSim === 'blackhole' && (
                 <div className="space-y-2">
                    <div className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Dilated Time (s)</div>
                    <div className="text-4xl font-black text-blue-400 tabular-nums tracking-tighter">{localTime.toFixed(2)}</div>
                 </div>
               )}
               {activeSim === 'formation' && (
                 <div className="space-y-2">
                    <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Core Thermal Lock</div>
                    <div className="text-4xl font-black text-emerald-400 tabular-nums tracking-tighter">{(params.collapseProgress * 15.4).toFixed(2)}M K</div>
                 </div>
               )}
               {activeSim === 'solar' && (
                 <div className="space-y-2">
                    <div className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Scale Standard</div>
                    <div className="text-4xl font-black text-amber-400 tabular-nums tracking-tighter">1.0 AU</div>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Main Controls Dashboard */}
      {!params.povActive && !params.collapseActive && params.collapseProgress === 0 && (
        <>
          <div className="absolute top-10 left-10 flex gap-4 z-10">
            {['blackhole', 'formation', 'solar'].map(id => (
              <button 
                key={id} 
                onClick={() => { setActiveSim(id as SimMode); setParams(prev => ({...prev, collapseProgress: 0, povProgress: 0, focusedPlanet: null})); }} 
                className={`px-10 py-5 rounded-full text-[10px] font-black uppercase tracking-[0.4em] transition-all border-2 ${activeSim === id ? 'bg-blue-600 border-blue-400 text-white shadow-4xl scale-105' : 'bg-black/80 border-slate-800 text-slate-500 hover:text-white'}`}
              >
                {id}
              </button>
            ))}
            {activeSim === 'blackhole' && (
              <button onClick={() => setParams(p => ({ ...p, povActive: true }))} className="px-10 py-5 rounded-full text-[10px] font-black uppercase tracking-[0.4em] bg-red-600/10 border-2 border-red-500/50 text-red-500 hover:bg-red-600 hover:text-white transition-all animate-pulse">
                Execute Singularity Plunge
              </button>
            )}
            {activeSim === 'formation' && (
              <button onClick={() => setParams(p => ({ ...p, collapseActive: true }))} className="px-10 py-5 rounded-full text-[10px] font-black uppercase tracking-[0.4em] bg-blue-600/10 border-2 border-blue-500/50 text-blue-400 hover:bg-blue-600 hover:text-white transition-all animate-pulse">
                Trigger Gravitational Collapse
              </button>
            )}
          </div>

          <div className={`absolute bottom-12 left-12 transition-all duration-700 ${infoMinimized ? 'w-48 h-16 p-5' : 'w-[550px] p-16'} bg-[#0d1117]/95 border border-white/10 rounded-[3.5rem] backdrop-blur-3xl shadow-4xl overflow-hidden`}>
            <button onClick={() => setInfoMinimized(!infoMinimized)} className="absolute top-8 right-8 text-white font-black opacity-30 hover:opacity-100 transition-opacity">{infoMinimized ? '＋' : '−'}</button>
            <div className={`${infoMinimized ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
               <h2 className="text-6xl font-black text-white uppercase tracking-tighter mb-6 italic">MILO Labs</h2>
               <div className="flex items-center gap-4 mb-8">
                 <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">High Fidelity Physics Modeling</span>
                 <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                 <span className="text-[10px] text-blue-400 uppercase tracking-widest font-black italic">V15.5_EPHEMERIS</span>
               </div>
               <div className="grid grid-cols-2 gap-8">
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                    <div className="text-[9px] font-black text-slate-600 uppercase mb-2 tracking-widest">Simulation Kernel</div>
                    <div className="text-xl font-black text-white">{activeSim === 'solar' ? 'J2000-Sync' : (activeSim === 'blackhole' ? 'Schwarzschild' : 'Jeans-Core')}</div>
                  </div>
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                    <div className="text-[9px] font-black text-slate-600 uppercase mb-2 tracking-widest">Temporal Flow</div>
                    <div className="text-xl font-black text-emerald-400 uppercase">{activeSim === 'solar' ? (params.solarTimeSpeed < 1 ? 'Slowed' : 'Timelapse') : 'Linear'}</div>
                  </div>
               </div>
            </div>
          </div>

          <div className={`absolute bottom-12 right-12 transition-all duration-700 ${controlsMinimized ? 'w-48 h-16 p-5' : 'w-[420px] p-14'} bg-[#0d1117]/95 border border-white/10 rounded-[3.5rem] backdrop-blur-3xl shadow-4xl overflow-hidden`}>
             <button onClick={() => setControlsMinimized(!controlsMinimized)} className="absolute top-8 right-8 text-white font-black opacity-30 hover:opacity-100 transition-opacity">{controlsMinimized ? '＋' : '−'}</button>
             <div className={`${controlsMinimized ? 'opacity-0' : 'opacity-100'} transition-opacity space-y-10`}>
                <div className="space-y-4">
                   <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <span>{activeSim === 'solar' ? 'Time-Lapse Speed (Day/Sec)' : (activeSim === 'blackhole' ? 'Schwarzschild Mass (M☉)' : 'Molecular Density')}</span>
                      <span className="text-white bg-blue-600/20 px-3 py-1 rounded-lg">{activeSim === 'solar' ? params.solarTimeSpeed.toFixed(1) : (activeSim === 'blackhole' ? params.mass : params.density)}</span>
                   </div>
                   <input type="range" min={activeSim === 'solar' ? "0.1" : "10"} max={activeSim === 'solar' ? "100" : "2000"} step={activeSim === 'solar' ? "0.1" : "1"} value={activeSim === 'solar' ? params.solarTimeSpeed : (activeSim === 'blackhole' ? params.mass : params.density)} onChange={e => setParams({...params, [activeSim === 'solar' ? 'solarTimeSpeed' : (activeSim === 'blackhole' ? 'mass' : 'density')]: parseFloat(e.target.value)})} className="w-full accent-blue-500 cursor-pointer" />
                </div>
                {activeSim !== 'solar' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <span>{activeSim === 'blackhole' ? 'Relativistic Velocity' : 'Angular Momentum Spin'}</span>
                        <span className="text-white bg-blue-600/20 px-3 py-1 rounded-lg">{activeSim === 'blackhole' ? params.velocity : Math.floor(params.spin * 100)}%</span>
                    </div>
                    <input type="range" min="1" max="99" value={activeSim === 'blackhole' ? params.velocity : Math.floor(params.spin * 100)} onChange={e => setParams({...params, [activeSim === 'blackhole' ? 'velocity' : 'spin']: parseInt(e.target.value) / 100})} className="w-full accent-blue-500 cursor-pointer" />
                  </div>
                )}
                {activeSim === 'solar' && (
                   <button onClick={() => daysSinceJ2000Ref.current = (Date.now() - J2000) / (1000 * 60 * 60 * 24)} className="w-full py-4 border border-blue-500/30 rounded-xl text-[10px] font-black uppercase text-blue-400 hover:bg-blue-500 hover:text-white transition-all">
                      Sync to Current UTC Date
                   </button>
                )}
             </div>
          </div>
        </>
      )}

      {/* Evolution Completed HUD */}
      {!params.collapseActive && params.collapseProgress >= 1 && activeSim === 'formation' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
           <div className="text-center space-y-10 animate-in zoom-in-95 duration-1000">
              <div className="w-32 h-32 bg-white rounded-full mx-auto blur-[60px] animate-pulse"></div>
              <h3 className="text-8xl font-black text-white tracking-tighter uppercase italic drop-shadow-[0_0_40px_rgba(255,255,255,0.5)]">Protostar Ignition</h3>
              <p className="text-[14px] font-black text-blue-400 uppercase tracking-[0.8em]">Hydrogen Fusion Stabilized // Hydrostatic Balance Locked</p>
              <button 
                onClick={() => setParams(p => ({ ...p, collapseProgress: 0 }))}
                className="px-16 py-8 bg-white text-black font-black uppercase text-[12px] tracking-[0.4em] rounded-full hover:bg-blue-500 hover:text-white transition-all shadow-4xl hover:scale-110 active:scale-95"
              >
                Reset Observation Sequence
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Simulations;
