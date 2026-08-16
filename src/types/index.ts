export type ScreenType = 
  | 'home'
  | 'cpr_training'
  | 'cpr_result'
  | 'bleeding_training'
  | 'bleeding_result'
  | 'ai_doctor'
  | 'consultation_summary'
  | 'prescription'
  | 'digital_twin'
  | 'profile';

export type DigitalTwinTab = 'overview' | 'vitals' | 'risks' | 'simulator' | 'insights';

export interface VitalsData {
  heartRate: number;
  bloodPressure: string;
  spO2: number;
  bloodSugar: number;
  temperature: number;
  respiration: number;
}

export interface RiskAnalysis {
  cardiovascular: number;
  diabetes: number;
  hypertension: number;
  stroke: number;
  obesity: number;
}

export interface CprScore {
  overallScore: number;
  compressionRate: number;
  compressionDepth: number;
  handPosition: 'Correct' | 'Needs Adjustment';
  fullCompressions: number;
  targetCompressions: number;
  rescueBreaths: number;
  targetBreaths: number;
}

export interface BleedingScore {
  overallScore: number;
  timeElapsedSeconds: number;
  pressureApplied: number;
  tourniquetPlaced: boolean;
  bloodLossPreventedPercent: number;
}

export interface DoctorQuestion {
  id: string;
  text: string;
  answered: boolean;
  value?: string;
}
