import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  ArrowLeft,
  X,
  Camera,
  Volume2,
  VolumeX,
  PhoneCall,
  UserCheck,
  ShieldCheck,
  Timer,
  Crosshair,
  Heart,
  ChevronRight,
  ChevronLeft,
  Eye,
  Minimize2,
} from 'lucide-react';
import { Cpr3DScene } from '../components/Cpr3DScene';
import { useApp } from '../context/AppContext';
import { soundManager } from '../utils/sound';

interface StepData {
  number: number;
  title: string;
  instruction: string;
  badge: string;
  bpm: number;
}

const CPR_STEPS: StepData[] = [
  {
    number: 1,
    title: 'Ensure the Area Is Safe',
    instruction:
      'Scan your surroundings to ensure the area is safe. Then tap the detected floor to place the virtual patient in your room.',
    badge: 'SAFE',
    bpm: 0,
  },
  {
    number: 2,
    title: 'Check for a Response',
    instruction:
      "Tap the patient's shoulder on the screen and shout, “Are you okay?” to check for any response.",
    badge: 'CHECK',
    bpm: 0,
  },
  {
    number: 3,
    title: 'Call for Emergency Help',
    instruction:
      'Shout for someone nearby to call 102 (Ambulance) or 112 (Emergency Response) immediately.',
    badge: 'EMERGENCY',
    bpm: 0,
  },
  {
    number: 4,
    title: 'Open the Airway',
    instruction:
      "Follow the on-screen prompts to tilt the virtual patient's head back and lift the chin to open the airway.",
    badge: 'AIRWAY',
    bpm: 0,
  },
  {
    number: 5,
    title: 'Check for Normal Breathing',
    instruction:
      "Look, listen, and feel for normal breathing by observing the virtual patient's chest for no more than 10 seconds.",
    badge: 'BREATHING',
    bpm: 0,
  },
  {
    number: 6,
    title: 'Locate the Correct Compression Area',
    instruction:
      "Align your phone camera with the target on the patient's chest for 2 seconds to reveal the 3D ribcage and beating heart, helping you identify the correct compression position.",
    badge: 'LOCATE',
    bpm: 110,
  },
  {
    number: 7,
    title: 'Perform Chest Compressions',
    instruction:
      'Perform 30 chest compressions, pushing hard and fast in the center of the chest.',
    badge: 'GOOD',
    bpm: 110,
  },
];

export const CprTrainingScreen: React.FC = () => {
  const { setCurrentScreen, setLastCprScore } = useApp();
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [compressions, setCompressions] = useState<number>(18);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [arCameraEnabled, setArCameraEnabled] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(true);
  const [isArMode, setIsArMode] = useState<boolean>(false);

  // Step 5: 10s Breathing Timer state
  const [breathingTimer, setBreathingTimer] = useState<number>(10);
  const [breathingTimerActive, setBreathingTimerActive] = useState<boolean>(false);

  // Step 6: 2s Target Lock Alignment state
  const [targetLocked, setTargetLocked] = useState<boolean>(false);

  // Current Step Data
  const currentStep = CPR_STEPS[currentStepIndex];

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

  // Step 5 breathing countdown timer
  useEffect(() => {
    let interval: any = null;
    if (breathingTimerActive && breathingTimer > 0) {
      interval = setInterval(() => {
        setBreathingTimer((prev) => prev - 1);
      }, 1000);
    } else if (breathingTimer === 0) {
      soundManager.playSuccessChime();
      soundManager.speak('10 seconds complete. No normal breathing detected. Proceed to locate compression area.');
      setBreathingTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [breathingTimerActive, breathingTimer]);

  // Handle Next Step Navigation
  const handleNextStep = () => {
    if (currentStepIndex < CPR_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      if (currentStepIndex + 1 === 4) {
        setBreathingTimer(10);
        setBreathingTimerActive(true);
      }
    } else {
      soundManager.playSuccessChime();
      soundManager.speak('CPR Training Completed successfully!');
      setLastCprScore((prev) => ({
        ...prev,
        overallScore: 94,
        fullCompressions: compressions >= 30 ? 30 : compressions,
        compressionRate: 110,
        compressionDepth: 5.4,
      }));
      setTimeout(() => setCurrentScreen('cpr_result'), 400);
    }
  };

  // Handle Previous Step Navigation
  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  // Trigger Compression for Step 7
  const triggerCompress = () => {
    setIsCompressing(true);
    const newCount = compressions + 1;
    setCompressions(newCount);

    soundManager.playCompressTone();
    setTimeout(() => setIsCompressing(false), 120);

    if (newCount === 25) {
      soundManager.speak('Great rhythm! 5 more compressions.');
    }

    if (newCount >= 30) {
      soundManager.playSuccessChime();
      soundManager.speak('Excellent job! 30 compressions completed.');
      setLastCprScore((prev) => ({
        ...prev,
        overallScore: 94,
        fullCompressions: 30,
        compressionRate: 110,
        compressionDepth: 5.4,
      }));
      setTimeout(() => setCurrentScreen('cpr_result'), 500);
    }
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
      <Cpr3DScene
        currentStep={currentStep.number}
        isCompressing={isCompressing}
        compressionCount={compressions}
        arCameraEnabled={arCameraEnabled}
        isArFullscreen={isArMode}
        onToggleAr={() => setIsArMode(!isArMode)}
        onCompressPress={triggerCompress}
      />

      {/* Floating Interactive HUD Layer (Always 100% visible in both normal and AR mode!) */}
      <View style={[styles.hudOverlay, isArMode && styles.arHudOverlay]}>
        {/* Top Header Bar */}
        <View style={styles.topHeader}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setCurrentScreen('home')}>
            <ArrowLeft size={18} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>CPR Training</Text>
            <Text style={styles.stepText}>Step {currentStep.number} of 7</Text>
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

        {/* Step Progress Dots Indicator (1 to 7) */}
        <View style={styles.stepProgressRow}>
          {CPR_STEPS.map((step, idx) => (
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
                soundManager.speak('Virtual patient placed on the detected floor grid.');
                handleNextStep();
              }}
            >
              <ShieldCheck size={18} color="#FFFFFF" />
              <Text style={styles.stepActionBtnText}>Area Safe • Tap to Place Patient</Text>
            </TouchableOpacity>
          )}

          {currentStep.number === 2 && (
            <TouchableOpacity
              style={[styles.stepActionBtn, isArMode && styles.arStepActionBtn]}
              onPress={() => {
                soundManager.speak('No response detected from patient. Shout for emergency help!');
                handleNextStep();
              }}
            >
              <UserCheck size={18} color="#FFFFFF" />
              <Text style={styles.stepActionBtnText}>Tap Shoulder & Shout “Are you okay?”</Text>
            </TouchableOpacity>
          )}

          {currentStep.number === 3 && (
            <View style={styles.emergencyRow}>
              <TouchableOpacity
                style={[styles.emergencyBtn, { backgroundColor: '#DC2626' }]}
                onPress={() => {
                  soundManager.speak('Calling 102 Ambulance. Dispatch alerted.');
                  handleNextStep();
                }}
              >
                <PhoneCall size={16} color="#FFFFFF" />
                <Text style={styles.emergencyBtnText}>Call 102 (Ambulance)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.emergencyBtn, { backgroundColor: '#2563EB' }]}
                onPress={() => {
                  soundManager.speak('Calling 112 Emergency Response.');
                  handleNextStep();
                }}
              >
                <PhoneCall size={16} color="#FFFFFF" />
                <Text style={styles.emergencyBtnText}>Call 112 (Emergency)</Text>
              </TouchableOpacity>
            </View>
          )}

          {currentStep.number === 4 && (
            <TouchableOpacity
              style={[styles.stepActionBtn, isArMode && styles.arStepActionBtn]}
              onPress={() => {
                soundManager.speak('Head tilted back and chin lifted. Airway opened.');
                handleNextStep();
              }}
            >
              <Crosshair size={18} color="#FFFFFF" />
              <Text style={styles.stepActionBtnText}>Tilt Head Back & Lift Chin (Airway Open)</Text>
            </TouchableOpacity>
          )}

          {currentStep.number === 5 && (
            <View style={[styles.breathingCard, isArMode && styles.arBreathingCard]}>
              <View style={styles.breathingTimerCircle}>
                <Text style={styles.breathingTimerText}>{breathingTimer}</Text>
                <Text style={styles.breathingTimerSubText}>sec</Text>
              </View>
              <Text style={styles.breathingPrompt}>
                {breathingTimer > 0
                  ? 'Observing chest rise & listen for breath...'
                  : 'No normal breathing detected!'}
              </Text>
            </View>
          )}

          {currentStep.number === 6 && (
            <TouchableOpacity
              style={[
                styles.stepActionBtn,
                isArMode && styles.arStepActionBtn,
                targetLocked && { backgroundColor: '#16A34A' },
              ]}
              onPress={() => {
                setTargetLocked(true);
                soundManager.speak('Target aligned! 3D ribcage and heart located.');
                setTimeout(() => handleNextStep(), 800);
              }}
            >
              <Heart size={18} color="#FFFFFF" />
              <Text style={styles.stepActionBtnText}>
                {targetLocked ? 'Target Locked (Ribcage & Heart)' : 'Align Target on Chest (2s)'}
              </Text>
            </TouchableOpacity>
          )}

          {currentStep.number === 7 && (
            <View style={styles.counterSection}>
              <TouchableOpacity
                style={[styles.compressRingContainer, isArMode && styles.arCompressRingContainer]}
                onPress={triggerCompress}
                activeOpacity={0.8}
              >
                <View style={styles.compressRingInner}>
                  <Text style={styles.compressCountText}>{compressions}</Text>
                  <Text style={styles.compressSubText}>/30</Text>
                  <Text style={styles.compressLabelText}>Compressions</Text>
                </View>
              </TouchableOpacity>
              <Text style={[styles.tapInstruction, isArMode && { color: '#FFFFFF', textShadowColor: '#000', textShadowRadius: 4 }]}>
                Tap circle to compress hard & fast (110 BPM)
              </Text>
            </View>
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
              {currentStepIndex < CPR_STEPS.length - 1 ? 'Next Step' : 'Finish Training'}
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
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignItems: 'center',
  },
  bpmStatus: {
    color: '#16A34A',
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
    gap: 6,
    marginVertical: 2,
  },
  stepDot: {
    width: 28,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
  },
  stepDotActive: {
    backgroundColor: '#0284C7',
    width: 34,
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
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#16A34A',
  },
  liveArText: {
    color: '#16A34A',
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
    backgroundColor: '#0284C7',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 18,
    width: '100%',
    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
  },
  arStepActionBtn: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
    borderWidth: 1,
  },
  stepActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emergencyRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  emergencyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 16,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
  },
  emergencyBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  breathingCard: {
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%',
  },
  arBreathingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  breathingTimerCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0284C7',
  },
  breathingTimerText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
  breathingTimerSubText: {
    color: '#0284C7',
    fontSize: 7,
    fontWeight: '700',
  },
  breathingPrompt: {
    color: '#334155',
    fontSize: 10,
    fontWeight: '600',
  },
  counterSection: {
    alignItems: 'center',
    gap: 2,
  },
  compressRingContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#3B82F6',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  arCompressRingContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  compressRingInner: {
    alignItems: 'center',
  },
  compressCountText: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '800',
  },
  compressSubText: {
    color: '#64748B',
    fontSize: 8,
  },
  compressLabelText: {
    color: '#3B82F6',
    fontSize: 7,
    fontWeight: '700',
  },
  tapInstruction: {
    color: '#64748B',
    fontSize: 9,
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
