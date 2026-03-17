
export enum ResearchMode {
  VARIABLE_STAR = 'Variable Star Detection',
  EXOPLANET_TRANSIT = 'Exoplanet Transit Detection',
  ANOMALY_DISCOVERY = 'Anomaly Discovery',
  IMAGE_ANALYSIS = 'Neural Image Analysis'
}

export enum PipelineStatus {
  IDLE = 'IDLE',
  ACQUISITION = 'DATA_ACQUISITION',
  PROCESSING = 'SIGNAL_PROCESSING',
  VALIDATION = 'PHYSICS_VALIDATION',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface PipelineStage {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'success' | 'error';
  log: string[];
}

export interface ValidationResult {
  parameter: string;
  formula: string;
  status: 'valid' | 'invalid' | 'uncertain';
  margin: string;
  diagnostic: string;
}

export interface Discovery {
  id: string;
  timestamp: number;
  name: string;
  mode: ResearchMode | string;
  confidence: number;
  objectClass: string;
  validation: ValidationResult[];
  data: any;
  object?: AstronomicalObject;
  report: string;
  exported: boolean;
}

export enum ExplanationLevel {
  HIGH_SCHOOL = 'High School',
  UNDERGRADUATE = 'Undergraduate',
  RESEARCH = 'Research Level'
}

export enum ObjectClass {
  STAR = 'Star',
  GALAXY = 'Galaxy',
  GLOBULAR_CLUSTER = 'Globular Cluster',
  NEBULA = 'Nebula',
  BLACK_HOLE = 'Black Hole',
  UNKNOWN = 'Unknown'
}

export interface ScientificValue<T> {
  value: T;
  uncertainty?: string;
  method: string;
  origin: string;
}

export interface SimulationPhase {
  label: string;
  age: string;
  state: string;
  temp: number;
  radius: number;
  color: string;
  description: string;
}

export interface ObservationEntry {
  timestamp: number;
  query?: string;
  mode?: string;
  data: any;
}

export interface PixelFeature {
  x: number;
  y: number;
  label: string;
}

export interface AstronomicalObject {
  id: string;
  name: string;
  objectClass: ObjectClass;
  coordinates: { ra: string; dec: string };
  type: string;
  distance: ScientificValue<number>;
  physicalProperties: any;
  simulationData?: SimulationPhase[];
  insight?: string;
  groundingSources?: any[];
  spatialDiagnostics?: any;
  provenance?: any[];
  entotoVisibility?: any;
  rawData?: any; // Stores the original AI payload (light curves, etc)
}

export interface DiscoveryCandidate {
  id: string;
  name: string;
  anomalyScore: number;
  features: {
    meanBrightness: number;
    brightnessVariance: number;
    stdDev: number;
    amplitude: number;
    periodicity: number;
    trendSlope: number;
    snr: number;
  };
  classification: 'Known' | 'Candidate' | 'Low Confidence';
  interpretation: string;
  status: 'pending' | 'validated' | 'rejected';
}

export interface PipelineDataset {
  id: string;
  name: string;
  timestamp: number;
  objectCount: number;
  status: 'processing' | 'completed' | 'failed';
}

export interface User {
  email: string;
  username: string;
  password?: string;
  discoveries: Discovery[];
  archive: ObservationEntry[];
}
