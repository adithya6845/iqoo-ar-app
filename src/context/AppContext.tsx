import React, { createContext, useContext, useState } from 'react';
import { ScreenType, DigitalTwinTab, VitalsData, RiskAnalysis, CprScore, BleedingScore } from '../types';

interface AppContextType {
  currentScreen: ScreenType;
  setCurrentScreen: (screen: ScreenType) => void;
  digitalTwinTab: DigitalTwinTab;
  setDigitalTwinTab: (tab: DigitalTwinTab) => void;
  vitals: VitalsData;
  setVitals: React.Dispatch<React.SetStateAction<VitalsData>>;
  risks: RiskAnalysis;
  setRisks: React.Dispatch<React.SetStateAction<RiskAnalysis>>;
  lastCprScore: CprScore;
  setLastCprScore: React.Dispatch<React.SetStateAction<CprScore>>;
  lastBleedingScore: BleedingScore;
  setLastBleedingScore: React.Dispatch<React.SetStateAction<BleedingScore>>;
  userSymptoms: string[];
  setUserSymptoms: React.Dispatch<React.SetStateAction<string[]>>;
  simulatorValues: { exercise: number; sleep: number; weight: number };
  setSimulatorValues: React.Dispatch<React.SetStateAction<{ exercise: number; sleep: number; weight: number }>>;
}

const defaultVitals: VitalsData = {
  heartRate: 72,
  bloodPressure: '120/80',
  spO2: 98,
  bloodSugar: 90,
  temperature: 98.4,
  respiration: 18,
};

const defaultRisks: RiskAnalysis = {
  cardiovascular: 18,
  diabetes: 27,
  hypertension: 41,
  stroke: 8,
  obesity: 22,
};

const defaultCprScore: CprScore = {
  overallScore: 92,
  compressionRate: 106,
  compressionDepth: 5.2,
  handPosition: 'Correct',
  fullCompressions: 28,
  targetCompressions: 30,
  rescueBreaths: 2,
  targetBreaths: 2,
};

const defaultBleedingScore: BleedingScore = {
  overallScore: 95,
  timeElapsedSeconds: 24,
  pressureApplied: 98,
  tourniquetPlaced: true,
  bloodLossPreventedPercent: 94,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [digitalTwinTab, setDigitalTwinTab] = useState<DigitalTwinTab>('overview');
  const [vitals, setVitals] = useState<VitalsData>(defaultVitals);
  const [risks, setRisks] = useState<RiskAnalysis>(defaultRisks);
  const [lastCprScore, setLastCprScore] = useState<CprScore>(defaultCprScore);
  const [lastBleedingScore, setLastBleedingScore] = useState<BleedingScore>(defaultBleedingScore);
  const [userSymptoms, setUserSymptoms] = useState<string[]>(['Headache and dizziness since morning']);
  const [simulatorValues, setSimulatorValues] = useState({ exercise: 30, sleep: 1, weight: -3 });

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        digitalTwinTab,
        setDigitalTwinTab,
        vitals,
        setVitals,
        risks,
        setRisks,
        lastCprScore,
        setLastCprScore,
        lastBleedingScore,
        setLastBleedingScore,
        userSymptoms,
        setUserSymptoms,
        simulatorValues,
        setSimulatorValues,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
