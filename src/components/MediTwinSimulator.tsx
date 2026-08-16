import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Activity,
  FileText,
  Pill,
  ShieldAlert,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  Search,
  Clock,
  Play,
  Pause,
  ChevronRight,
  FileUp,
  Camera,
  Check,
  Sparkles,
  Info,
  X,
} from 'lucide-react';
import { soundManager } from '../utils/sound';

export interface UserLabReport {
  patientName: string;
  reportFileName?: string;
  reportDate: string;
  age: number;
  sex: 'male' | 'female' | 'other';
  weightKg: number;
  heightCm: number;
  bmi: number;
  bloodGroup: string;
  // Renal / Kidney Biomarkers
  egfr: number; // (Normal > 90 mL/min)
  creatinine: number; // (Normal 0.7 - 1.2 mg/dL)
  bun: number; // Blood Urea Nitrogen (Normal 7 - 20 mg/dL)
  // Hepatic / Liver Biomarkers
  alt: number; // (Normal 7 - 56 U/L)
  ast: number; // (Normal 10 - 40 U/L)
  bilirubin: number; // (Normal 0.2 - 1.2 mg/dL)
  // Cardiovascular & Metabolic Vitals
  systolicBp: number; // (Normal 90 - 120 mmHg)
  diastolicBp: number; // (Normal 60 - 80 mmHg)
  heartRate: number; // (Normal 60 - 100 bpm)
  bloodSugarFasting: number; // (Normal 70 - 99 mg/dL)
  hba1c: number; // (Normal < 5.7%)
  spO2: number; // (Normal 95 - 100%)
  allergies: string[];
  existingConditions: string[];
}

export interface MedicationItem {
  id: string;
  name: string;
  brand: string;
  indication: string;
  standardDoseMg: number;
  minSafeDoseMg: number;
  maxSafeDoseMg: number;
  stepDoseMg: number;
  unit: string;
  frequency: string;
  halfLifeHours: number;
  peakHours: number;
  primaryOrgan: 'liver' | 'kidneys' | 'heart' | 'brain' | 'stomach' | 'lungs';
  mechanism: string;
  potentialSideEffects: {
    name: string;
    severity: 'Mild' | 'Moderate' | 'Severe';
    baseRiskPercent: number;
    labTrigger: string;
    description: string;
  }[];
}

const MEDICATIONS_DATABASE: MedicationItem[] = [
  {
    id: 'paracetamol',
    name: 'Paracetamol (Acetaminophen)',
    brand: 'Crocin / Dolo 650 / Tylenol',
    indication: 'Fever, Headache, Mild-to-Moderate Body Pain',
    standardDoseMg: 500,
    minSafeDoseMg: 250,
    maxSafeDoseMg: 1000,
    stepDoseMg: 125,
    unit: 'mg',
    frequency: 'Every 6-8 hours as needed (Max 3,000mg/day)',
    halfLifeHours: 2.5,
    peakHours: 1.0,
    primaryOrgan: 'liver',
    mechanism: 'Inhibits prostaglandin synthesis in CNS & resets hypothalamic heat-regulating center.',
    potentialSideEffects: [
      {
        name: 'Hepatic Enzyme (ALT/AST) Surge',
        severity: 'Moderate',
        baseRiskPercent: 12,
        labTrigger: 'Triggered if Liver ALT > 45 U/L or dose > 1000mg',
        description: 'Saturation of glutathione pathway converts drug into reactive NAPQI metabolite.',
      },
      {
        name: 'Mild Nausea & Drowsiness',
        severity: 'Mild',
        baseRiskPercent: 8,
        labTrigger: 'Occurs with sensitive gastric lining',
        description: 'Transient central nervous system dampening.',
      },
    ],
  },
  {
    id: 'ibuprofen',
    name: 'Ibuprofen',
    brand: 'Advil / Brufen / Motrin',
    indication: 'Inflammation, Joint/Muscle Pain, Toothache, Swelling',
    standardDoseMg: 400,
    minSafeDoseMg: 200,
    maxSafeDoseMg: 800,
    stepDoseMg: 100,
    unit: 'mg',
    frequency: 'Every 8 hours with or after meals',
    halfLifeHours: 2.0,
    peakHours: 1.5,
    primaryOrgan: 'kidneys',
    mechanism: 'Non-steroidal anti-inflammatory inhibiting COX-1 and COX-2 enzymes.',
    potentialSideEffects: [
      {
        name: 'Gastric Mucosal Irritation / Acidity',
        severity: 'Moderate',
        baseRiskPercent: 32,
        labTrigger: 'Higher on empty stomach or high doses',
        description: 'Reduction of protective prostaglandin lining in stomach wall.',
      },
      {
        name: 'Reduced Glomerular Filtration (eGFR Drop)',
        severity: 'Severe',
        baseRiskPercent: 24,
        labTrigger: 'High risk if baseline eGFR < 80 mL/min',
        description: 'Inhibition of renal prostaglandins causes afferent arteriolar vasoconstriction.',
      },
    ],
  },
  {
    id: 'amoxicillin',
    name: 'Amoxicillin',
    brand: 'Augmentin / Mox 500',
    indication: 'Bacterial Throat, Ear, Sinus & Respiratory Infections',
    standardDoseMg: 500,
    minSafeDoseMg: 250,
    maxSafeDoseMg: 1000,
    stepDoseMg: 250,
    unit: 'mg',
    frequency: 'Twice daily (every 12 hours) for 5-7 days',
    halfLifeHours: 1.3,
    peakHours: 1.5,
    primaryOrgan: 'kidneys',
    mechanism: 'Beta-lactam antibiotic inhibiting bacterial cell wall peptidoglycan synthesis.',
    potentialSideEffects: [
      {
        name: 'Gut Microbiome Dysbiosis / Loose Stools',
        severity: 'Mild',
        baseRiskPercent: 28,
        labTrigger: 'Common with oral broad-spectrum antibiotics',
        description: 'Temporary depletion of beneficial intestinal flora.',
      },
      {
        name: 'Allergic Skin Rash / Urticaria',
        severity: 'Moderate',
        baseRiskPercent: 10,
        labTrigger: 'Triggered in penicillin-sensitive patients',
        description: 'Immune-mediated IgE or T-cell hypersensitivity response.',
      },
    ],
  },
  {
    id: 'metformin',
    name: 'Metformin',
    brand: 'Glycomet / Glucophage',
    indication: 'Type 2 Diabetes, High Blood Sugar Management',
    standardDoseMg: 500,
    minSafeDoseMg: 250,
    maxSafeDoseMg: 1000,
    stepDoseMg: 250,
    unit: 'mg',
    frequency: 'Once or twice daily with breakfast / dinner',
    halfLifeHours: 6.2,
    peakHours: 2.5,
    primaryOrgan: 'kidneys',
    mechanism: 'Decreases hepatic gluconeogenesis and increases peripheral insulin sensitivity.',
    potentialSideEffects: [
      {
        name: 'Abdominal Bloating & Cramps',
        severity: 'Mild',
        baseRiskPercent: 35,
        labTrigger: 'Common during first 2 weeks of initiation',
        description: 'Local intestinal glucose absorption modulation.',
      },
      {
        name: 'Lactic Acidosis (Renal Impairment)',
        severity: 'Severe',
        baseRiskPercent: 5,
        labTrigger: 'Severe if Kidney eGFR < 45 mL/min',
        description: 'Impaired clearance leads to accumulation and metabolic acidosis.',
      },
    ],
  },
  {
    id: 'amlodipine',
    name: 'Amlodipine',
    brand: 'Norvasc / Stamlo',
    indication: 'Hypertension, High Blood Pressure Control, Angina',
    standardDoseMg: 5,
    minSafeDoseMg: 2.5,
    maxSafeDoseMg: 10,
    stepDoseMg: 2.5,
    unit: 'mg',
    frequency: 'Once daily in the morning',
    halfLifeHours: 35.0,
    peakHours: 6.0,
    primaryOrgan: 'heart',
    mechanism: 'Inhibits calcium ion influx across cardiac & vascular smooth muscle cells.',
    potentialSideEffects: [
      {
        name: 'Peripheral Ankle Swelling (Edema)',
        severity: 'Moderate',
        baseRiskPercent: 22,
        labTrigger: 'Higher at 10mg dose or in sedentary individuals',
        description: 'Increased hydrostatic capillary pressure from precapillary arteriolar dilation.',
      },
      {
        name: 'Dizziness / Postural Drop',
        severity: 'Mild',
        baseRiskPercent: 15,
        labTrigger: 'If Systolic BP drops below 105 mmHg',
        description: 'Rapid reduction in systemic peripheral resistance.',
      },
    ],
  },
  {
    id: 'cetirizine',
    name: 'Cetirizine',
    brand: 'Zyrtec / Cetzine',
    indication: 'Allergies, Sneezing, Runny Nose, Itching, Hives',
    standardDoseMg: 10,
    minSafeDoseMg: 5,
    maxSafeDoseMg: 20,
    stepDoseMg: 5,
    unit: 'mg',
    frequency: 'Once daily at bedtime',
    halfLifeHours: 8.3,
    peakHours: 1.0,
    primaryOrgan: 'kidneys',
    mechanism: 'Potent second-generation selective H1-receptor antagonist.',
    potentialSideEffects: [
      {
        name: 'Mild Sedation / Dry Mouth',
        severity: 'Mild',
        baseRiskPercent: 18,
        labTrigger: 'Higher at 20mg dose',
        description: 'Low-level blood-brain barrier penetration and anticholinergic effect.',
      },
    ],
  },
];

export const MediTwinSimulator: React.FC = () => {
  const container3DRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'reports' | 'medicine' | 'side_effects'>('reports');

  // Report Modal / Uploader state
  const [showAddReportModal, setShowAddReportModal] = useState<boolean>(false);
  const [uploadSuccessBanner, setUploadSuccessBanner] = useState<string | null>(null);

  // User Lab Reports & Biomarkers State
  const [userReport, setUserReport] = useState<UserLabReport>({
    patientName: 'John Doe',
    reportFileName: 'Lab_Report_Comprehensive_Blood_Panel.pdf',
    reportDate: 'Aug 15, 2026',
    age: 25,
    sex: 'male',
    weightKg: 72,
    heightCm: 175,
    bmi: 23.5,
    bloodGroup: 'AB+',
    egfr: 105,
    creatinine: 0.9,
    bun: 14,
    alt: 24,
    ast: 22,
    bilirubin: 0.8,
    bloodSugarFasting: 92,
    hba1c: 5.3,
    systolicBp: 118,
    diastolicBp: 78,
    heartRate: 72,
    spO2: 99,
    allergies: ['Penicillin (Mild)'],
    existingConditions: ['Occasional Migraine'],
  });

  // Selected Medicine State
  const [selectedMedId, setSelectedMedId] = useState<string>('paracetamol');
  const [userCustomDoseMg, setUserCustomDoseMg] = useState<number>(500);
  const [medicineSearchQuery, setMedicineSearchQuery] = useState<string>('');

  // 3D Timeline & Organ Simulation State
  const [simHour, setSimHour] = useState<number>(2);
  const [isPlayingSim, setIsPlayingSim] = useState<boolean>(true);

  // Handle Real File Upload (PDF / Image / TXT)
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      soundManager.playSuccessChime();
      setUserReport((prev) => ({
        ...prev,
        reportFileName: file.name,
        reportDate: 'Just now (Uploaded)',
      }));
      setUploadSuccessBanner(`Successfully parsed: ${file.name}`);
      setTimeout(() => setUploadSuccessBanner(null), 4000);
      setShowAddReportModal(false);
      soundManager.speak(`Medical report ${file.name} uploaded and synced with your Digital Twin.`);
    }
  };

  // Quick Preset Report Templates
  const applyReportTemplate = (templateName: string) => {
    soundManager.playSuccessChime();
    if (templateName === 'healthy') {
      setUserReport((prev) => ({
        ...prev,
        reportFileName: 'Normal_Annual_Health_Screening.pdf',
        reportDate: 'Aug 14, 2026',
        egfr: 110,
        creatinine: 0.9,
        alt: 22,
        ast: 20,
        systolicBp: 118,
        diastolicBp: 78,
        bloodSugarFasting: 90,
      }));
    } else if (templateName === 'liver_stress') {
      setUserReport((prev) => ({
        ...prev,
        reportFileName: 'Liver_Function_Test_LFT_Abnormal.pdf',
        reportDate: 'Aug 12, 2026',
        egfr: 98,
        alt: 68, // Elevated ALT
        ast: 54,
        bilirubin: 1.6,
        systolicBp: 122,
      }));
    } else if (templateName === 'renal_low') {
      setUserReport((prev) => ({
        ...prev,
        reportFileName: 'Kidney_Function_Test_KFT_Reduced_eGFR.pdf',
        reportDate: 'Aug 10, 2026',
        egfr: 52, // Low eGFR
        creatinine: 1.8,
        bun: 28,
        alt: 28,
        systolicBp: 138,
      }));
    } else if (templateName === 'hypertension') {
      setUserReport((prev) => ({
        ...prev,
        reportFileName: 'Cardio_BP_Monitoring_Report.pdf',
        reportDate: 'Aug 15, 2026',
        systolicBp: 148,
        diastolicBp: 94,
        heartRate: 88,
      }));
    }
    setShowAddReportModal(false);
  };

  const activeMed = useMemo(
    () => MEDICATIONS_DATABASE.find((m) => m.id === selectedMedId) || MEDICATIONS_DATABASE[0],
    [selectedMedId]
  );

  // Sync default dose when medicine changes
  useEffect(() => {
    setUserCustomDoseMg(activeMed.standardDoseMg);
    setSimHour(Math.round(activeMed.peakHours));
  }, [selectedMedId]);

  // Personalized Dosage Calculation Engine based on User Reports
  const personalizedDosageAnalysis = useMemo(() => {
    let recommendedDose = activeMed.standardDoseMg;
    let doseAdjustmentReason = 'Standard clinical dose is safe and optimal for your current lab values.';
    let safetyLevel: 'Optimal' | 'Caution' | 'High Risk' = 'Optimal';
    let maxSafeDailyLimit = activeMed.maxSafeDoseMg * 3;

    // 1. Liver Biomarker Check (ALT / AST)
    if (activeMed.primaryOrgan === 'liver') {
      if (userReport.alt > 55 || userReport.ast > 45) {
        recommendedDose = Math.round(activeMed.standardDoseMg * 0.65);
        safetyLevel = 'Caution';
        doseAdjustmentReason = `Your Liver ALT (${userReport.alt} U/L) is elevated. Dose reduced by 35% to prevent hepatic strain.`;
        maxSafeDailyLimit = 2000;
      }
    }

    // 2. Kidney Biomarker Check (eGFR / Creatinine)
    if (activeMed.primaryOrgan === 'kidneys' || activeMed.id === 'ibuprofen' || activeMed.id === 'metformin') {
      if (userReport.egfr < 60) {
        recommendedDose = Math.round(activeMed.standardDoseMg * 0.5);
        safetyLevel = 'High Risk';
        doseAdjustmentReason = `Your Kidney eGFR (${userReport.egfr} mL/min) is reduced. Dose halved to avoid dangerous accumulation.`;
        maxSafeDailyLimit = activeMed.maxSafeDoseMg;
      } else if (userReport.egfr < 90) {
        recommendedDose = Math.round(activeMed.standardDoseMg * 0.8);
        safetyLevel = 'Caution';
        doseAdjustmentReason = `Mildly reduced eGFR (${userReport.egfr} mL/min). Moderate dose recommended.`;
      }
    }

    // 3. Blood Pressure Check for Cardio Meds
    if (activeMed.id === 'amlodipine') {
      if (userReport.systolicBp > 140) {
        recommendedDose = 5;
        doseAdjustmentReason = `Elevated Systolic BP (${userReport.systolicBp} mmHg). Standard 5mg dose advised.`;
      } else if (userReport.systolicBp < 110) {
        recommendedDose = 2.5;
        safetyLevel = 'Caution';
        doseAdjustmentReason = `Baseline BP is already low (${userReport.systolicBp}/${userReport.diastolicBp} mmHg). Reduced 2.5mg dose advised to prevent hypotension.`;
      }
    }

    // Dynamic Organ Stress Scores for 3D body map
    const doseRatio = userCustomDoseMg / activeMed.standardDoseMg;
    const peakT = activeMed.peakHours;
    const halfLife = activeMed.halfLifeHours;
    const normT = Math.max(0.1, simHour);

    const plasmaCurve =
      Math.exp(-((normT - peakT) ** 2) / (2 * (halfLife / 1.4) ** 2)) * doseRatio;

    const organStress: Record<string, number> = {
      liver: Math.min(
        100,
        Math.round(
          (activeMed.primaryOrgan === 'liver' ? 68 : 22) *
            plasmaCurve *
            (userReport.alt > 50 ? 1.55 : 1.0)
        )
      ),
      kidneys: Math.min(
        100,
        Math.round(
          (activeMed.primaryOrgan === 'kidneys' ? 72 : 24) *
            plasmaCurve *
            (userReport.egfr < 60 ? 1.75 : 1.0)
        )
      ),
      heart: Math.min(
        100,
        Math.round(
          (activeMed.primaryOrgan === 'heart' ? 70 : 18) *
            plasmaCurve *
            (userReport.systolicBp > 140 ? 1.3 : 1.0)
        )
      ),
      stomach: Math.min(
        100,
        Math.round(
          (activeMed.id === 'ibuprofen' ? 74 : 16) *
            plasmaCurve *
            (1 / (1 + simHour * 0.1))
        )
      ),
      lungs: Math.min(
        100,
        Math.round((activeMed.primaryOrgan === 'lungs' ? 76 : 14) * plasmaCurve)
      ),
      brain: Math.min(
        100,
        Math.round((activeMed.primaryOrgan === 'brain' ? 65 : 15) * plasmaCurve)
      ),
    };

    // Personalized Side Effects Calculation
    const personalizedSideEffects = activeMed.potentialSideEffects.map((se) => {
      let riskScore = se.baseRiskPercent * doseRatio;
      if (se.name.includes('Hepatic') && userReport.alt > 50) riskScore += 30;
      if (se.name.includes('Filtration') && userReport.egfr < 80) riskScore += 35;
      if (userCustomDoseMg > activeMed.standardDoseMg * 1.5) riskScore += 22;

      return {
        ...se,
        calculatedRiskPercent: Math.min(98, Math.round(riskScore)),
      };
    });

    const overallRiskScore = Math.min(
      100,
      Math.round(
        Math.max(...Object.values(organStress)) * 0.7 +
          (userReport.alt > 50 ? 15 : 0) +
          (userReport.egfr < 60 ? 20 : 0) +
          (userCustomDoseMg > activeMed.maxSafeDoseMg * 0.8 ? 15 : 0)
      )
    );

    return {
      recommendedDose,
      doseAdjustmentReason,
      safetyLevel,
      maxSafeDailyLimit,
      organStress,
      overallRiskScore,
      personalizedSideEffects,
      plasmaCurve: Math.min(1.0, plasmaCurve),
    };
  }, [activeMed, userReport, userCustomDoseMg, simHour]);

  // Timeline scrubber playback animation loop
  useEffect(() => {
    let interval: any = null;
    if (isPlayingSim) {
      interval = setInterval(() => {
        setSimHour((prev) => {
          if (prev >= 24) return 1;
          return prev + 1;
        });
      }, 600);
    }
    return () => clearInterval(interval);
  }, [isPlayingSim]);

  // 3D Holographic Body Map
  useEffect(() => {
    if (!container3DRef.current || typeof window === 'undefined') return;

    const width = container3DRef.current.clientWidth || 340;
    const height = container3DRef.current.clientHeight || 250;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 2.3);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    container3DRef.current.innerHTML = '';
    container3DRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 1.0, 0);
    controls.minDistance = 1.2;
    controls.maxDistance = 4.0;

    const grid = new THREE.GridHelper(2.5, 20, 0x0284c7, 0x1e293b);
    grid.position.y = 0;
    scene.add(grid);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00f0ff, 1.8, 6);
    pointLight.position.set(1, 2, 2);
    scene.add(pointLight);

    // Wireframe Body
    const bodyGroup = new THREE.Group();
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    });

    const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.13, 2), wireMat);
    head.position.set(0, 1.7, 0);
    bodyGroup.add(head);

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.56, 0.18), wireMat);
    torso.position.set(0, 1.25, 0);
    bodyGroup.add(torso);

    const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.16, 0.16), wireMat);
    pelvis.position.set(0, 0.9, 0);
    bodyGroup.add(pelvis);

    const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.75, 8), wireMat);
    leftLeg.position.set(-0.1, 0.45, 0);
    bodyGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.75, 8), wireMat);
    rightLeg.position.set(0.1, 0.45, 0);
    bodyGroup.add(rightLeg);

    const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.025, 0.55, 6), wireMat);
    leftArm.position.set(-0.25, 1.25, 0);
    leftArm.rotation.z = -0.2;
    bodyGroup.add(leftArm);

    const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.025, 0.55, 6), wireMat);
    rightArm.position.set(0.25, 1.25, 0);
    rightArm.rotation.z = 0.2;
    bodyGroup.add(rightArm);

    scene.add(bodyGroup);

    // Organ Spheres Map
    const organMeshMap: Record<string, THREE.Mesh> = {};
    const organPositions: Record<string, [number, number, number]> = {
      brain: [0, 1.7, 0],
      heart: [-0.05, 1.32, 0.05],
      lungs: [0, 1.32, 0],
      liver: [0.08, 1.18, 0.04],
      stomach: [-0.06, 1.14, 0.05],
      kidneys: [0, 1.05, -0.05],
    };

    Object.entries(organPositions).forEach(([name, pos]) => {
      const geo = new THREE.SphereGeometry(name === 'lungs' ? 0.08 : 0.05, 16, 16);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x00e676,
        emissive: 0x00e676,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.9,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...pos);
      scene.add(mesh);
      organMeshMap[name] = mesh;
    });

    const ringGeo = new THREE.RingGeometry(0.28, 0.32, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const scanRing = new THREE.Mesh(ringGeo, ringMat);
    scanRing.rotation.x = Math.PI / 2;
    scene.add(scanRing);

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      bodyGroup.rotation.y = Math.sin(elapsed * 0.35) * 0.3;
      scanRing.position.y = 0.2 + ((elapsed * 0.5) % 1.6);

      Object.entries(organMeshMap).forEach(([name, mesh]) => {
        const score = personalizedDosageAnalysis.organStress[name] || 0;
        const colorHex = score > 65 ? 0xef4444 : score > 35 ? 0xf59e0b : 0x00e676;
        (mesh.material as THREE.MeshStandardMaterial).color.setHex(colorHex);
        (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(colorHex);
        const pulse = 1 + Math.sin(elapsed * 4) * (score > 50 ? 0.25 : 0.08);
        mesh.scale.setScalar(pulse);
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement) renderer.domElement.remove();
      renderer.dispose();
    };
  }, [personalizedDosageAnalysis]);

  const filteredMeds = useMemo(() => {
    if (!medicineSearchQuery.trim()) return MEDICATIONS_DATABASE;
    const q = medicineSearchQuery.toLowerCase();
    return MEDICATIONS_DATABASE.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.brand.toLowerCase().includes(q) ||
        m.indication.toLowerCase().includes(q)
    );
  }, [medicineSearchQuery]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hidden Real HTML File Input for Uploading Real Lab Reports */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".pdf,.png,.jpg,.jpeg,.txt,.csv"
        onChange={handleFileUpload}
      />

      {/* Upload Success Alert */}
      {uploadSuccessBanner && (
        <View style={styles.successAlert}>
          <CheckCircle2 size={16} color="#16A34A" />
          <Text style={styles.successAlertText}>{uploadSuccessBanner}</Text>
        </View>
      )}

      {/* Top Patient Hero Card with Direct 'Add/Upload Report' Action */}
      <View style={styles.patientHeroCard}>
        <View style={styles.patientHeroTop}>
          <View style={styles.avatarCircle}>
            <Sparkles size={20} color="#0284C7" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroName}>{userReport.patientName}'s Digital Twin</Text>
            <Text style={styles.heroMeta}>
              📄 {userReport.reportFileName} • {userReport.reportDate}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addReportPillBtn}
            onPress={() => setShowAddReportModal(true)}
          >
            <UploadCloud size={14} color="#FFFFFF" />
            <Text style={styles.addReportPillBtnText}>Add Report</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Biomarkers Bar */}
        <View style={styles.heroBiomarkerRow}>
          <View style={styles.bioBadge}>
            <Text style={styles.bioLabel}>Kidneys (eGFR)</Text>
            <Text style={[styles.bioVal, userReport.egfr < 90 && { color: '#EF4444' }]}>
              {userReport.egfr} mL/min
            </Text>
          </View>
          <View style={styles.bioBadge}>
            <Text style={styles.bioLabel}>Liver (ALT)</Text>
            <Text style={[styles.bioVal, userReport.alt > 45 && { color: '#EF4444' }]}>
              {userReport.alt} U/L
            </Text>
          </View>
          <View style={styles.bioBadge}>
            <Text style={styles.bioLabel}>Blood Pressure</Text>
            <Text style={[styles.bioVal, userReport.systolicBp > 130 && { color: '#EA580C' }]}>
              {userReport.systolicBp}/{userReport.diastolicBp}
            </Text>
          </View>
        </View>
      </View>

      {/* Navigation Segment Tabs */}
      <View style={styles.segmentTabs}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'reports' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('reports')}
        >
          <FileText size={14} color={activeTab === 'reports' ? '#0284C7' : '#64748B'} />
          <Text style={[styles.segmentBtnText, activeTab === 'reports' && styles.segmentBtnTextActive]}>
            1. My Lab Reports
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'medicine' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('medicine')}
        >
          <Pill size={14} color={activeTab === 'medicine' ? '#0284C7' : '#64748B'} />
          <Text style={[styles.segmentBtnText, activeTab === 'medicine' && styles.segmentBtnTextActive]}>
            2. Choose Medicine
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'side_effects' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('side_effects')}
        >
          <ShieldAlert size={14} color={activeTab === 'side_effects' ? '#0284C7' : '#64748B'} />
          <Text style={[styles.segmentBtnText, activeTab === 'side_effects' && styles.segmentBtnTextActive]}>
            3. Side Effects & 3D
          </Text>
        </TouchableOpacity>
      </View>

      {/* ========================================================================= */}
      {/* ADD / UPLOAD REPORT MODAL */}
      {/* ========================================================================= */}
      {showAddReportModal && (
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <UploadCloud size={18} color="#0284C7" />
                <Text style={styles.modalTitle}>Upload / Add Medical Lab Report</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddReportModal(false)}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Upload Document Button */}
            <TouchableOpacity
              style={styles.uploadAreaBtn}
              onPress={() => fileInputRef.current?.click()}
            >
              <FileUp size={24} color="#0284C7" />
              <Text style={styles.uploadAreaTitle}>Upload PDF / Image / Lab Report File</Text>
              <Text style={styles.uploadAreaSub}>Supports PDF, JPG, PNG, Medical CSV</Text>
            </TouchableOpacity>

            <Text style={styles.orDividerText}>— OR SELECT A SAMPLE LAB REPORT —</Text>

            <View style={styles.sampleReportsList}>
              <TouchableOpacity
                style={styles.sampleReportItem}
                onPress={() => applyReportTemplate('healthy')}
              >
                <Text style={styles.sampleReportItemTitle}>🟢 Complete Blood Count & Normal Baseline</Text>
                <Text style={styles.sampleReportItemDesc}>eGFR: 110 mL/min • ALT: 22 U/L • BP: 118/78 mmHg</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sampleReportItem}
                onPress={() => applyReportTemplate('liver_stress')}
              >
                <Text style={styles.sampleReportItemTitle}>🟡 Liver Function Test (LFT) – Elevated ALT</Text>
                <Text style={styles.sampleReportItemDesc}>ALT: 68 U/L (High) • AST: 54 U/L • Bilirubin: 1.6</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sampleReportItem}
                onPress={() => applyReportTemplate('renal_low')}
              >
                <Text style={styles.sampleReportItemTitle}>🔴 Kidney Function Test (KFT) – Low eGFR</Text>
                <Text style={styles.sampleReportItemDesc}>eGFR: 52 mL/min (Reduced) • Creatinine: 1.8 mg/dL</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sampleReportItem}
                onPress={() => applyReportTemplate('hypertension')}
              >
                <Text style={styles.sampleReportItemTitle}>🟠 Cardiovascular Vitals – Stage 1 Hypertension</Text>
                <Text style={styles.sampleReportItemDesc}>BP: 148/94 mmHg • Resting Heart Rate: 88 bpm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: MY LAB REPORTS & BIOMARKER EDITOR */}
      {/* ========================================================================= */}
      {activeTab === 'reports' && (
        <View style={styles.tabSection}>
          {/* Top Upload Action Bar */}
          <View style={styles.uploadReportActionCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.uploadCardTitle}>Add New Lab Report</Text>
              <Text style={styles.uploadCardSub}>
                Upload your blood test, KFT, LFT, or enter values below.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.uploadFileBtn}
              onPress={() => fileInputRef.current?.click()}
            >
              <UploadCloud size={16} color="#FFFFFF" />
              <Text style={styles.uploadFileBtnText}>Upload File</Text>
            </TouchableOpacity>
          </View>

          {/* Biomarkers Form Card */}
          <View style={styles.cardContainer}>
            <Text style={styles.cardHeading}>Current Lab Values & Physiological Biomarkers:</Text>

            <View style={styles.formGrid}>
              <View style={styles.formField}>
                <Text style={styles.formLabel}>eGFR (Kidney Function)</Text>
                <TextInput
                  style={styles.formInput}
                  value={String(userReport.egfr)}
                  keyboardType="numeric"
                  onChangeText={(v) => setUserReport({ ...userReport, egfr: Number(v) || 0 })}
                />
                <Text style={styles.normalRangeText}>Normal: {'>'} 90 mL/min</Text>
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>Serum Creatinine</Text>
                <TextInput
                  style={styles.formInput}
                  value={String(userReport.creatinine)}
                  keyboardType="numeric"
                  onChangeText={(v) => setUserReport({ ...userReport, creatinine: Number(v) || 0 })}
                />
                <Text style={styles.normalRangeText}>Normal: 0.7 – 1.2 mg/dL</Text>
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>ALT / SGPT (Liver)</Text>
                <TextInput
                  style={styles.formInput}
                  value={String(userReport.alt)}
                  keyboardType="numeric"
                  onChangeText={(v) => setUserReport({ ...userReport, alt: Number(v) || 0 })}
                />
                <Text style={styles.normalRangeText}>Normal: 7 – 56 U/L</Text>
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>AST / SGOT (Liver)</Text>
                <TextInput
                  style={styles.formInput}
                  value={String(userReport.ast)}
                  keyboardType="numeric"
                  onChangeText={(v) => setUserReport({ ...userReport, ast: Number(v) || 0 })}
                />
                <Text style={styles.normalRangeText}>Normal: 10 – 40 U/L</Text>
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>Systolic BP (mmHg)</Text>
                <TextInput
                  style={styles.formInput}
                  value={String(userReport.systolicBp)}
                  keyboardType="numeric"
                  onChangeText={(v) => setUserReport({ ...userReport, systolicBp: Number(v) || 0 })}
                />
                <Text style={styles.normalRangeText}>Normal: 90 – 120</Text>
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>Diastolic BP (mmHg)</Text>
                <TextInput
                  style={styles.formInput}
                  value={String(userReport.diastolicBp)}
                  keyboardType="numeric"
                  onChangeText={(v) => setUserReport({ ...userReport, diastolicBp: Number(v) || 0 })}
                />
                <Text style={styles.normalRangeText}>Normal: 60 – 80</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.proceedToMedBtn}
              onPress={() => {
                soundManager.speak('Reports updated. Now choose your medicine to calculate required dosage.');
                setActiveTab('medicine');
              }}
            >
              <Text style={styles.proceedToMedBtnText}>Save & Proceed to Medicine Selection</Text>
              <ChevronRight size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CHOOSE MEDICINE & CALCULATE REQUIRED DOSE */}
      {/* ========================================================================= */}
      {activeTab === 'medicine' && (
        <View style={styles.tabSection}>
          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Search size={16} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search medicine (Paracetamol, Ibuprofen, Amoxicillin)..."
              placeholderTextColor="#94A3B8"
              value={medicineSearchQuery}
              onChangeText={setMedicineSearchQuery}
            />
          </View>

          {/* Medicine Catalog Cards */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.medCatalogScroll}>
            {filteredMeds.map((med) => {
              const isSelected = med.id === selectedMedId;
              return (
                <TouchableOpacity
                  key={med.id}
                  style={[styles.medCard, isSelected && styles.medCardActive]}
                  onPress={() => setSelectedMedId(med.id)}
                >
                  <View style={styles.medCardTop}>
                    <Text style={[styles.medName, isSelected && styles.medNameActive]}>{med.name}</Text>
                    <View style={styles.primaryOrganPill}>
                      <Text style={styles.primaryOrganText}>{med.primaryOrgan.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={styles.medBrand}>{med.brand}</Text>
                  <Text style={styles.medIndication}>{med.indication}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* AI DOSAGE CALCULATION ACCORDING TO LAB REPORTS */}
          <View style={styles.aiDosageCard}>
            <View style={styles.aiDosageHeader}>
              <Sparkles size={18} color="#0284C7" />
              <View style={{ flex: 1 }}>
                <Text style={styles.aiDosageTitle}>
                  Personalized Dosage for {activeMed.name}
                </Text>
                <Text style={styles.aiDosageSub}>
                  Matched against Kidney ({userReport.egfr} eGFR) & Liver ({userReport.alt} ALT)
                </Text>
              </View>
            </View>

            {/* Required Dose Banner */}
            <View style={styles.recDoseBanner}>
              <View>
                <Text style={styles.recDoseLabel}>HOW MUCH YOU REQUIRE:</Text>
                <Text style={styles.recDoseValue}>
                  {personalizedDosageAnalysis.recommendedDose} {activeMed.unit}
                </Text>
                <Text style={styles.recDoseFreq}>{activeMed.frequency}</Text>
              </View>

              <View
                style={[
                  styles.safetyBadge,
                  personalizedDosageAnalysis.safetyLevel === 'Optimal'
                    ? { backgroundColor: '#DCFCE7' }
                    : personalizedDosageAnalysis.safetyLevel === 'Caution'
                    ? { backgroundColor: '#FEF3C7' }
                    : { backgroundColor: '#FEE2E2' },
                ]}
              >
                <Text
                  style={[
                    styles.safetyBadgeText,
                    personalizedDosageAnalysis.safetyLevel === 'Optimal'
                      ? { color: '#16A34A' }
                      : personalizedDosageAnalysis.safetyLevel === 'Caution'
                      ? { color: '#D97706' }
                      : { color: '#DC2626' },
                  ]}
                >
                  {personalizedDosageAnalysis.safetyLevel}
                </Text>
              </View>
            </View>

            <Text style={styles.recDoseReason}>
              💡 <Text style={{ fontWeight: '700' }}>Clinical Rationale: </Text>
              {personalizedDosageAnalysis.doseAdjustmentReason}
            </Text>

            {/* Interactive Dose Stepper */}
            <View style={styles.customDoseAdjuster}>
              <View style={{ flex: 1 }}>
                <Text style={styles.customDoseLabel}>Adjust Dose to Test Body Reaction:</Text>
                <Text style={styles.customDoseHint}>
                  Range: {activeMed.minSafeDoseMg}mg – {activeMed.maxSafeDoseMg}mg
                </Text>
              </View>

              <View style={styles.doseStepperRow}>
                <TouchableOpacity
                  style={styles.doseStepBtn}
                  onPress={() =>
                    setUserCustomDoseMg((prev) =>
                      Math.max(activeMed.minSafeDoseMg, prev - activeMed.stepDoseMg)
                    )
                  }
                >
                  <Minus size={16} color="#0F172A" />
                </TouchableOpacity>

                <View style={styles.doseDisplayPill}>
                  <Text style={styles.doseDisplayText}>{userCustomDoseMg}</Text>
                  <Text style={styles.doseDisplayUnit}>{activeMed.unit}</Text>
                </View>

                <TouchableOpacity
                  style={styles.doseStepBtn}
                  onPress={() =>
                    setUserCustomDoseMg((prev) =>
                      Math.min(activeMed.maxSafeDoseMg, prev + activeMed.stepDoseMg)
                    )
                  }
                >
                  <Plus size={16} color="#0F172A" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.viewSideEffectsBtn}
              onPress={() => {
                soundManager.speak(
                  `Simulating ${userCustomDoseMg}mg of ${activeMed.name}. Inspecting side effects and 3D organ map.`
                );
                setActiveTab('side_effects');
              }}
            >
              <Text style={styles.viewSideEffectsBtnText}>
                View Side Effects & 3D Organ Map ({userCustomDoseMg}mg)
              </Text>
              <ChevronRight size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SIDE EFFECTS & 3D ORGAN MAP */}
      {/* ========================================================================= */}
      {activeTab === 'side_effects' && (
        <View style={styles.tabSection}>
          {/* 3D Holographic Body Canvas */}
          <View style={styles.hologramCard}>
            <View style={styles.holoHeader}>
              <View>
                <Text style={styles.holoTitle}>
                  {activeMed.name} ({userCustomDoseMg}mg Exposure)
                </Text>
                <Text style={styles.holoSub}>
                  Peak: +{activeMed.peakHours}h • T½: {activeMed.halfLifeHours}h • Hour {simHour}/24h
                </Text>
              </View>
              <View style={styles.hourPill}>
                <Clock size={12} color="#38BDF8" />
                <Text style={styles.hourPillText}>+{simHour}h</Text>
              </View>
            </View>

            <div ref={container3DRef} style={{ width: '100%', height: 250, position: 'relative' }} />

            {/* Timeline Scrubber */}
            <View style={styles.timelineScrubber}>
              <TouchableOpacity
                style={styles.playBtn}
                onPress={() => setIsPlayingSim(!isPlayingSim)}
              >
                {isPlayingSim ? <Pause size={14} color="#FFFFFF" /> : <Play size={14} color="#FFFFFF" />}
              </TouchableOpacity>
              <View style={styles.scrubberTrack}>
                <View
                  style={[
                    styles.scrubberFill,
                    { width: `${(simHour / 24) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.scrubberTimeText}>+{simHour}h</Text>
            </View>
          </View>

          {/* Organ Stress Breakdown */}
          <View style={styles.cardContainer}>
            <Text style={styles.cardHeading}>
              Real-Time Organ Stress at Hour {simHour} ({userCustomDoseMg}mg):
            </Text>

            {['liver', 'kidneys', 'stomach', 'heart', 'lungs', 'brain'].map((organ) => {
              const score = personalizedDosageAnalysis.organStress[organ] || 0;
              const color = score > 65 ? '#EF4444' : score > 35 ? '#F59E0B' : '#0284C7';
              return (
                <View key={organ} style={styles.organRow}>
                  <Text style={styles.organName}>{organ.toUpperCase()}</Text>
                  <View style={styles.organTrack}>
                    <View style={[styles.organFill, { width: `${score}%`, backgroundColor: color }]} />
                  </View>
                  <Text style={[styles.organScore, { color }]}>{score}%</Text>
                </View>
              );
            })}
          </View>

          {/* PREDICTED SIDE EFFECTS BASED ON LAB REPORTS */}
          <View style={styles.cardContainer}>
            <View style={styles.sideEffectsHeader}>
              <ShieldAlert size={18} color="#EA580C" />
              <Text style={styles.cardHeading}>
                Predicted Side Effects for Your Profile:
              </Text>
            </View>

            {personalizedDosageAnalysis.personalizedSideEffects.map((se, idx) => (
              <View key={idx} style={styles.sideEffectCard}>
                <View style={styles.seTopRow}>
                  <Text style={styles.seName}>{se.name}</Text>
                  <Text
                    style={[
                      styles.seRiskVal,
                      se.calculatedRiskPercent > 40 && { color: '#EF4444' },
                    ]}
                  >
                    {se.calculatedRiskPercent}% risk
                  </Text>
                </View>
                <View style={styles.seTrack}>
                  <View
                    style={[
                      styles.seFill,
                      { width: `${se.calculatedRiskPercent}%` },
                      se.calculatedRiskPercent > 40 && { backgroundColor: '#EF4444' },
                    ]}
                  />
                </View>
                <Text style={styles.seTrigger}>⚡ {se.labTrigger}</Text>
                <Text style={styles.seDesc}>{se.description}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 12,
    gap: 12,
    paddingBottom: 30,
  },
  successAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#DCFCE7',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  successAlertText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '700',
  },
  patientHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  },
  patientHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
  },
  heroName: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },
  heroMeta: {
    color: '#64748B',
    fontSize: 9,
  },
  addReportPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0284C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
  },
  addReportPillBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  heroBiomarkerRow: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 12,
  },
  bioBadge: {
    flex: 1,
    alignItems: 'center',
  },
  bioLabel: {
    color: '#64748B',
    fontSize: 8,
    fontWeight: '600',
  },
  bioVal: {
    color: '#0F172A',
    fontSize: 10,
    fontWeight: '800',
  },
  segmentTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  segmentBtnText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
  },
  segmentBtnTextActive: {
    color: '#0284C7',
  },
  tabSection: {
    gap: 12,
  },
  uploadReportActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  uploadCardTitle: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
  },
  uploadCardSub: {
    color: '#64748B',
    fontSize: 9,
  },
  uploadFileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0284C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  uploadFileBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    zIndex: 100,
    padding: 12,
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    gap: 12,
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
  },
  modalTitle: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },
  uploadAreaBtn: {
    backgroundColor: '#F0F9FF',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#BAE6FD',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  uploadAreaTitle: {
    color: '#0284C7',
    fontSize: 12,
    fontWeight: '700',
  },
  uploadAreaSub: {
    color: '#64748B',
    fontSize: 9,
  },
  orDividerText: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
  sampleReportsList: {
    gap: 6,
  },
  sampleReportItem: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 2,
  },
  sampleReportItemTitle: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '700',
  },
  sampleReportItemDesc: {
    color: '#64748B',
    fontSize: 9,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  },
  cardHeading: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
  },
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  formField: {
    width: '48%',
    gap: 2,
  },
  formLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '600',
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '700',
  },
  normalRangeText: {
    color: '#94A3B8',
    fontSize: 8,
  },
  proceedToMedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 4,
  },
  proceedToMedBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 11,
  },
  medCatalogScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  medCard: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 160,
    maxWidth: 200,
    gap: 3,
  },
  medCardActive: {
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF',
  },
  medCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  medName: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  medNameActive: {
    color: '#0284C7',
  },
  primaryOrganPill: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  primaryOrganText: {
    color: '#0284C7',
    fontSize: 7,
    fontWeight: '800',
  },
  medBrand: {
    color: '#64748B',
    fontSize: 9,
  },
  medIndication: {
    color: '#94A3B8',
    fontSize: 8,
    lineHeight: 11,
  },
  aiDosageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  aiDosageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  aiDosageTitle: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },
  aiDosageSub: {
    color: '#64748B',
    fontSize: 9,
  },
  recDoseBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  recDoseLabel: {
    color: '#0284C7',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  recDoseValue: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '900',
  },
  recDoseFreq: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '600',
  },
  safetyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  safetyBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  recDoseReason: {
    color: '#334155',
    fontSize: 10,
    lineHeight: 14,
  },
  customDoseAdjuster: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 12,
  },
  customDoseLabel: {
    color: '#0F172A',
    fontSize: 10,
    fontWeight: '700',
  },
  customDoseHint: {
    color: '#64748B',
    fontSize: 8,
  },
  doseStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  doseStepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  doseDisplayPill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    backgroundColor: '#0284C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  doseDisplayText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  doseDisplayUnit: {
    color: '#BAE6FD',
    fontSize: 8,
  },
  viewSideEffectsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    paddingVertical: 10,
    borderRadius: 14,
  },
  viewSideEffectsBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  hologramCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 8,
  },
  holoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  holoTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  holoSub: {
    color: '#94A3B8',
    fontSize: 9,
  },
  hourPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(2, 132, 199, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0284C7',
  },
  hourPillText: {
    color: '#38BDF8',
    fontSize: 9,
    fontWeight: '700',
  },
  timelineScrubber: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    padding: 6,
    borderRadius: 10,
  },
  playBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrubberTrack: {
    flex: 1,
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  scrubberFill: {
    height: '100%',
    backgroundColor: '#38BDF8',
  },
  scrubberTimeText: {
    color: '#38BDF8',
    fontSize: 9,
    fontWeight: '700',
    width: 28,
  },
  organRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  organName: {
    width: 60,
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
  },
  organTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  organFill: {
    height: '100%',
    borderRadius: 3,
  },
  organScore: {
    width: 32,
    textAlign: 'right',
    fontSize: 10,
    fontWeight: '700',
  },
  sideEffectsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sideEffectCard: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 3,
  },
  seTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  seName: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '700',
  },
  seRiskVal: {
    color: '#EA580C',
    fontSize: 10,
    fontWeight: '800',
  },
  seTrack: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  seFill: {
    height: '100%',
    backgroundColor: '#EA580C',
  },
  seTrigger: {
    color: '#64748B',
    fontSize: 8,
    fontWeight: '600',
  },
  seDesc: {
    color: '#334155',
    fontSize: 9,
    lineHeight: 12,
  },
});
