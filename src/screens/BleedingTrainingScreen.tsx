import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  ArrowLeft,
  X,
  Camera,
  Volume2,
  VolumeX,
  PhoneCall,
  ShieldCheck,
  HandMetal,
  Layers,
  HeartHandshake,
  ChevronRight,
  ChevronLeft,
  Activity,
  Flame,
} from 'lucide-react';
import { Bleeding3DScene } from '../components/Bleeding3DScene';
import { useApp } from '../context/AppContext';
import { soundManager } from '../utils/sound';

interface BleedingStepData {
  number: number;
  title: string;
  instruction: string;
  badge: string;
  bpm: number;
}

const BLEEDING_STEPS: BleedingStepData[] = [
  {
    number: 1,
    title: 'Check Scene Safety',
    instruction:
      'Make sure the area is safe before helping. Approach the injured person carefully and tap the floor or safe area to identify where the patient should be treated.',
    badge: 'SAFETY',
    bpm: 0,
  },
  {
    number: 2,
    title: 'Protect Yourself',
    instruction:
      'Put on disposable gloves if available. Avoid direct contact with blood and other bodily fluids to protect yourself from infection.',
    badge: 'PROTECT',
    bpm: 0,
  },
  {
    number: 3,
    title: 'Apply Firm Pressure',
    instruction:
      'Use a clean cloth, gauze, or bandage and press firmly and directly on the wound to control the bleeding.',
    badge: 'PRESSURE',
    bpm: 115,
  },
  {
    number: 4,
    title: 'Keep Applying Pressure',
    instruction:
      'Continue applying firm, steady pressure. Do not remove the original cloth or bandage, even if it becomes soaked with blood.',
    badge: 'STEADY',
    bpm: 110,
  },
  {
    number: 5,
    title: 'Add More Dressing if Needed',
    instruction:
      'If blood soaks through, place another clean cloth or bandage on top of the existing one. Keep continuous pressure on the wound.',
    badge: 'LAYER',
    bpm: 105,
  },
  {
    number: 6,
    title: 'Keep the Injured Area Supported',
    instruction:
      'If it is safe to do so and there is no suspected fracture, keep the injured limb raised and supported while maintaining pressure on the wound.',
    badge: 'ELEVATE',
    bpm: 98,
  },
  {
    number: 7,
    title: 'Call for Emergency Help',
    instruction:
      'If the bleeding is severe, does not stop, or the person shows signs of shock, call 112 (Emergency Response) immediately. Ask someone nearby to get professional medical help.',
    badge: 'EMERGENCY',
    bpm: 90,
  },
  {
    number: 8,
    title: 'Keep the Patient Calm and Warm',
    instruction:
      'Keep the patient lying or sitting safely, reassure them, and keep them warm. Continue monitoring them and maintain pressure on the wound until professional help arrives.',
    badge: 'REASSURE',
    bpm: 78,
  },
];

export const BleedingTrainingScreen: React.FC = () => {
  const { setCurrentScreen, setLastBleedingScore } = useApp();
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [pressure, setPressure] = useState<number>(65);
  const [arCameraEnabled, setArCameraEnabled] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(true);
  const [isArMode, setIsArMode] = useState<boolean>(false);
  const [isApplying, setIsApplying] = useState<boolean>(false);

  // Step 2 Gloves State
  const [glovesOn, setGlovesOn] = useState<boolean>(false);
  // Step 5 Layer Added State
  const [layerCount, setLayerCount] = useState<number>(1);
  // Step 6 Limb Elevated State
  const [limbElevated, setLimbElevated] = useState<boolean>(false);
  // Step 8 Thermal Blanket State
  const [blanketApplied, setBlanketApplied] = useState<boolean>(false);

  const currentStep = BLEEDING_STEPS[currentStepIndex];

  // Voice speech on step change
  useEffect(() => {
    if (isSpeaking) {
      soundManager.speak(
        `Step ${currentStep.number}: ${currentStep.title}. ${currentStep.instruction}`
      );
    }
    return () => {
      soundManager.stopSpeaking();
    };
  }, [currentStepIndex]);

  // Handle Next Step Navigation
  const handleNextStep = () => {
    if (currentStepIndex < BLEEDING_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Completed all 8 steps -> Bleeding Results
      soundManager.playSuccessChime();
      soundManager.speak('Severe Bleeding Control Training Completed successfully!');
      setLastBleedingScore((prev) => ({
        ...prev,
        overallScore: 96,
        timeElapsedSeconds: 45,
        pressureApplied: 98,
        bloodLossPreventedPercent: 95,
      }));
      setTimeout(() => setCurrentScreen('bleeding_result'), 400);
    }
  };

  // Handle Previous Step Navigation
  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleApplyPressure = () => {
    setIsApplying(true);
    soundManager.playWarningTone();
    setPressure((prev) => Math.min(100, prev + 15));
    setTimeout(() => setIsApplying(false), 200);
  };

  const toggleVoice = () => {
    if (isSpeaking) {
      soundManager.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      soundManager.speak(
        `Step ${currentStep.number}: ${currentStep.title}. ${currentStep.instruction}`
      );
    }
  };

  return (
    <View style={[styles.container, isArMode && styles.arContainer]}>
      {/* 3D Scene (Background when in AR Mode, or Embedded Container) */}
      <Bleeding3DScene
        currentStep={currentStep.number}
        isApplyingPressure={isApplying}
        pressureLevel={pressure}
        arCameraEnabled={arCameraEnabled}
        isArFullscreen={isArMode}
        onToggleAr={() => setIsArMode(!isArMode)}
      />

      {/* Floating Interactive HUD Layer */}
      <View style={[styles.hudOverlay, isArMode && styles.arHudOverlay]}>
        {/* Top Header Bar */}
        <View style={styles.topHeader}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setCurrentScreen('home')}>
            <ArrowLeft size={18} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Bleeding Training</Text>
            <Text style={styles.stepText}>Step {currentStep.number} of 8</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.bpmBadge}>
              <Text style={styles.bpmStatus}>{currentStep.badge}</Text>
              {currentStep.bpm > 0 && <Text style={styles.bpmValue}>{currentStep.bpm} bpm</Text>}
            </View>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setCurrentScreen('home')}>
              <X size={18} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Step Progress Dots Indicator (1 to 8) */}
        <View style={styles.stepProgressRow}>
          {BLEEDING_STEPS.map((step, idx) => (
            <TouchableOpacity
              key={step.number}
              style={[
                styles.stepDot,
                idx === currentStepIndex && styles.stepDotActive,
                idx < currentStepIndex && styles.stepDotCompleted,
              ]}
              onPress={() => setCurrentStepIndex(idx)}
            />
          ))}
        </View>

        {/* Step Title Header Pill */}
        <View style={styles.stepTitlePill}>
          <Text style={styles.stepTitleText}>
            Step {currentStep.number}: {currentStep.title}
          </Text>
          {isArMode && (
            <View style={styles.liveArTag}>
              <View style={styles.liveDot} />
              <Text style={styles.liveArText}>AR LIVE</Text>
            </View>
          )}
        </View>

        {/* Spacer in non-AR mode so 3D scene sits in middle */}
        {!isArMode && <View style={{ flex: 1 }} />}

        {/* Step Instruction Card */}
        <View style={[styles.instructionCard, isArMode && styles.arInstructionCard]}>
          <Text style={styles.instructionText}>{currentStep.instruction}</Text>
        </View>

        {/* Step-Specific Interactive Action Area */}
        <View style={styles.interactiveSection}>
          {currentStep.number === 1 && (
            <TouchableOpacity
              style={[styles.stepActionBtn, isArMode && styles.arStepActionBtn]}
              onPress={() => {
                soundManager.speak('Area confirmed safe. Treating patient on safe floor.');
                handleNextStep();
              }}
            >
              <ShieldCheck size={18} color="#FFFFFF" />
              <Text style={styles.stepActionBtnText}>Area Safe • Tap to Locate Patient</Text>
            </TouchableOpacity>
          )}

          {currentStep.number === 2 && (
            <TouchableOpacity
              style={[
                styles.stepActionBtn,
                glovesOn && { backgroundColor: '#16A34A' },
                isArMode && styles.arStepActionBtn,
              ]}
              onPress={() => {
                setGlovesOn(true);
                soundManager.speak('Gloves on. Blood pathogen protection active.');
                setTimeout(() => handleNextStep(), 600);
              }}
            >
              <HandMetal size={18} color="#FFFFFF" />
              <Text style={styles.stepActionBtnText}>
                {glovesOn ? 'Gloves Equipped (Protected)' : 'Put on Disposable Gloves'}
              </Text>
            </TouchableOpacity>
          )}

          {currentStep.number === 3 && (
            <TouchableOpacity
              style={[styles.stepActionBtn, { backgroundColor: '#EF4444' }]}
              onPress={() => {
                handleApplyPressure();
                soundManager.speak('Clean gauze applied with firm direct pressure.');
                setTimeout(() => handleNextStep(), 700);
              }}
            >
              <Activity size={18} color="#FFFFFF" />
              <Text style={styles.stepActionBtnText}>Apply Clean Gauze & Firm Direct Pressure</Text>
            </TouchableOpacity>
          )}

          {currentStep.number === 4 && (
            <View style={[styles.pressureControlCard, isArMode && styles.arPressureControlCard]}>
              <View style={styles.pressureRow}>
                <Text style={styles.pressureLabel}>Applied Pressure</Text>
                <Text style={styles.pressureValText}>{pressure}%</Text>
              </View>
              <View style={styles.pressureTrack}>
                <View style={[styles.pressureFill, { width: `${pressure}%` }]} />
              </View>
              <TouchableOpacity style={styles.holdPressureBtn} onPress={handleApplyPressure}>
                <Text style={styles.holdPressureBtnText}>Hold Steady Pressure (Do Not Remove Cloth)</Text>
              </TouchableOpacity>
            </View>
          )}

          {currentStep.number === 5 && (
            <TouchableOpacity
              style={[styles.stepActionBtn, { backgroundColor: '#0284C7' }]}
              onPress={() => {
                setLayerCount((prev) => prev + 1);
                soundManager.speak('Second clean dressing added on top without removing initial layer.');
                setTimeout(() => handleNextStep(), 700);
              }}
            >
              <Layers size={18} color="#FFFFFF" />
              <Text style={styles.stepActionBtnText}>
                Add More Dressing on Top (Layer {layerCount})
              </Text>
            </TouchableOpacity>
          )}

          {currentStep.number === 6 && (
            <TouchableOpacity
              style={[
                styles.stepActionBtn,
                limbElevated && { backgroundColor: '#16A34A' },
                isArMode && styles.arStepActionBtn,
              ]}
              onPress={() => {
                setLimbElevated(true);
                soundManager.speak('Injured limb elevated above heart level while keeping pressure.');
                setTimeout(() => handleNextStep(), 700);
              }}
            >
              <Activity size={18} color="#FFFFFF" />
              <Text style={styles.stepActionBtnText}>
                {limbElevated ? 'Limb Elevated & Supported' : 'Elevate & Support Injured Limb'}
              </Text>
            </TouchableOpacity>
          )}

          {currentStep.number === 7 && (
            <TouchableOpacity
              style={[styles.stepActionBtn, { backgroundColor: '#DC2626' }]}
              onPress={() => {
                soundManager.speak('Calling 112 Emergency Response for severe blood loss.');
                setTimeout(() => handleNextStep(), 700);
              }}
            >
              <PhoneCall size={18} color="#FFFFFF" />
              <Text style={styles.stepActionBtnText}>Call 112 (Emergency Response)</Text>
            </TouchableOpacity>
          )}

          {currentStep.number === 8 && (
            <TouchableOpacity
              style={[
                styles.stepActionBtn,
                blanketApplied && { backgroundColor: '#16A34A' },
                isArMode && styles.arStepActionBtn,
              ]}
              onPress={() => {
                setBlanketApplied(true);
                soundManager.speak('Patient comforted, wrapped in warm blanket, pressure maintained.');
                setTimeout(() => handleNextStep(), 800);
              }}
            >
              <Flame size={18} color="#FFFFFF" />
              <Text style={styles.stepActionBtnText}>
                {blanketApplied ? 'Patient Reassured & Kept Warm' : 'Apply Thermal Blanket & Reassure'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Bottom Step Navigation & Controls */}
        <View style={[styles.bottomControls, isArMode && styles.arBottomControls]}>
          {currentStepIndex > 0 ? (
            <TouchableOpacity style={styles.prevStepBtn} onPress={handlePrevStep}>
              <ChevronLeft size={16} color="#64748B" />
              <Text style={styles.prevStepBtnText}>Prev</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 60 }} />
          )}

          <TouchableOpacity style={styles.nextStepBtn} onPress={handleNextStep}>
            <Text style={styles.nextStepBtnText}>
              {currentStepIndex < BLEEDING_STEPS.length - 1 ? 'Next Step' : 'Finish Training'}
            </Text>
            <ChevronRight size={16} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.speakerBtn} onPress={toggleVoice}>
            {isSpeaking ? <Volume2 size={18} color="#0284C7" /> : <VolumeX size={18} color="#64748B" />}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  arContainer: {
    backgroundColor: '#000000',
  },
  hudOverlay: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'space-between',
    zIndex: 10,
  },
  arHudOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
  stepText: {
    color: '#64748B',
    fontSize: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bpmBadge: {
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignItems: 'center',
  },
  bpmStatus: {
    color: '#EA580C',
    fontSize: 8,
    fontWeight: '800',
  },
  bpmValue: {
    color: '#0F172A',
    fontSize: 10,
    fontWeight: '700',
  },
  stepProgressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    marginVertical: 2,
  },
  stepDot: {
    width: 24,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
  },
  stepDotActive: {
    backgroundColor: '#EA580C',
    width: 30,
  },
  stepDotCompleted: {
    backgroundColor: '#16A34A',
  },
  stepTitlePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignSelf: 'center',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
  },
  stepTitleText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '700',
  },
  liveArTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(234, 88, 12, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#EA580C',
  },
  liveArText: {
    color: '#EA580C',
    fontSize: 8,
    fontWeight: '800',
  },
  instructionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    marginVertical: 4,
  },
  arInstructionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    backdropFilter: 'blur(10px)',
  },
  instructionText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 15,
  },
  interactiveSection: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 76,
    marginVertical: 2,
  },
  stepActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EA580C',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 18,
    width: '100%',
    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)',
  },
  arStepActionBtn: {
    backgroundColor: '#EA580C',
    borderColor: '#FB923C',
    borderWidth: 1,
  },
  stepActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  pressureControlCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%',
    gap: 6,
  },
  arPressureControlCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  pressureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pressureLabel: {
    color: '#64748B',
    fontSize: 11,
  },
  pressureValText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '700',
  },
  pressureTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  pressureFill: {
    height: '100%',
    backgroundColor: '#EF4444',
  },
  holdPressureBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  holdPressureBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  arBottomControls: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    padding: 8,
    borderRadius: 20,
    backdropFilter: 'blur(10px)',
  },
  prevStepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 2,
  },
  prevStepBtnText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  nextStepBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#16A34A',
    paddingVertical: 10,
    borderRadius: 18,
    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
  },
  nextStepBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  speakerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});
