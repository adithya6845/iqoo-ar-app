import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import {
  Heart,
  Activity,
  ArrowRight,
  Shield,
  MessageSquare,
  Box,
  Cpu,
  BarChart3,
  Droplet,
  ShieldCheck,
  User,
  Plus,
  ChevronRight,
  Bot,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const HomeScreen: React.FC = () => {
  const { setCurrentScreen, setDigitalTwinTab, vitals } = useApp();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. GREETING & HEALTH STATUS HEADER */}
      <View style={styles.topGreetingRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.helloTitle}>Hello, John 👋</Text>
          <Text style={styles.helloSubtitle}>Your health. Your safety. Our priority.</Text>
        </View>

        {/* Health Status Pill */}
        <View style={styles.healthStatusPill}>
          <View style={styles.statusIconCircle}>
            <ShieldCheck size={18} color="#16A34A" />
          </View>
          <View>
            <Text style={styles.statusLabel}>Health Status</Text>
            <Text style={styles.statusValue}>Good</Text>
          </View>
        </View>
      </View>

      {/* 2. CATEGORY PILLS ROW */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryPillsScroll}
      >
        <TouchableOpacity
          style={styles.categoryPill}
          onPress={() => setCurrentScreen('cpr_training')}
        >
          <View style={[styles.pillIconCircle, { backgroundColor: '#EFF6FF' }]}>
            <Box size={14} color="#0284C7" />
          </View>
          <Text style={styles.categoryPillText}>AR Training</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.categoryPill}
          onPress={() => setCurrentScreen('ai_doctor')}
        >
          <View style={[styles.pillIconCircle, { backgroundColor: '#FAF5FF' }]}>
            <Plus size={14} color="#A855F7" />
          </View>
          <Text style={styles.categoryPillText}>AI Doctor</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.categoryPill}
          onPress={() => setCurrentScreen('digital_twin')}
        >
          <View style={[styles.pillIconCircle, { backgroundColor: '#F0FDF4' }]}>
            <User size={14} color="#0284C7" />
          </View>
          <Text style={styles.categoryPillText}>Digital Twin</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.categoryPill}
          onPress={() => setCurrentScreen('digital_twin')}
        >
          <View style={[styles.pillIconCircle, { backgroundColor: '#FFFBEB' }]}>
            <BarChart3 size={14} color="#F59E0B" />
          </View>
          <Text style={styles.categoryPillText}>Smart Insights</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 3. HERO "MY DIGITAL TWIN" CARD WITH 3D HOLOGRAM & FLOATING VITALS */}
      <TouchableOpacity
        style={styles.heroDigitalTwinCard}
        onPress={() => {
          setDigitalTwinTab('overview');
          setCurrentScreen('digital_twin');
        }}
        activeOpacity={0.92}
      >
        {/* Top Right 3D Cube Icon */}
        <View style={styles.cubeBadge}>
          <Box size={16} color="#BAE6FD" />
        </View>

        <View style={styles.twinLeftColumn}>
          <Text style={styles.twinCardTitle}>My Digital Twin</Text>
          <View style={styles.twinSyncRow}>
            <View style={styles.greenSyncDot} />
            <Text style={styles.twinSyncText}>Active • Synced 2 min ago</Text>
          </View>

          <Text style={styles.twinDescText}>
            Your digital health companion powered by AI.
          </Text>

          <TouchableOpacity
            style={styles.viewDashboardBtn}
            onPress={() => {
              setDigitalTwinTab('overview');
              setCurrentScreen('digital_twin');
            }}
          >
            <Text style={styles.viewDashboardBtnText}>View Dashboard</Text>
            <ArrowRight size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Center / Right 3D Holographic Human Figure & Floating Vitals */}
        <View style={styles.twinHologramContainer}>
          {/* Floating Vitals Badge 1: Heart Rate (Top Left) */}
          <View style={[styles.floatingVitalBadge, { top: 12, left: -8 }]}>
            <Activity size={12} color="#EF4444" />
            <Text style={styles.floatingVitalVal}>72 <Text style={{ fontSize: 7 }}>bpm</Text></Text>
            <Text style={styles.floatingVitalLabel}>Heart Rate</Text>
          </View>

          {/* Floating Vitals Badge 2: Blood Pressure (Bottom Left) */}
          <View style={[styles.floatingVitalBadge, { bottom: 12, left: -6 }]}>
            <ShieldCheck size={12} color="#10B981" />
            <Text style={styles.floatingVitalVal}>120/80</Text>
            <Text style={styles.floatingVitalLabel}>BP</Text>
          </View>

          {/* Hologram Human Silhouette Graphic */}
          <View style={styles.humanHoloGraphic}>
            <svg width="85" height="150" viewBox="0 0 85 150" fill="none">
              {/* Pedestal Ellipse */}
              <ellipse cx="42.5" cy="142" rx="36" ry="6" stroke="#00E5FF" strokeWidth="1.5" strokeDasharray="3 3" />
              <ellipse cx="42.5" cy="142" rx="26" ry="4" fill="rgba(0, 229, 255, 0.25)" />
              {/* Head */}
              <circle cx="42.5" cy="18" r="9" stroke="#38BDF8" strokeWidth="1.5" fill="rgba(56, 189, 248, 0.15)" />
              {/* Torso & Core */}
              <path d="M32 30 L53 30 L48 70 L37 70 Z" stroke="#38BDF8" strokeWidth="1.5" fill="rgba(56, 189, 248, 0.2)" />
              {/* Arms */}
              <path d="M31 32 L18 65 L14 90" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M54 32 L67 65 L71 90" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
              {/* Legs */}
              <path d="M38 70 L34 105 L30 138" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M47 70 L51 105 L55 138" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
              {/* Glowing Heart Core */}
              <circle cx="40" cy="42" r="3.5" fill="#00E5FF" />
            </svg>
          </View>

          {/* Floating Vitals Badge 3: SpO2 (Top Right) */}
          <View style={[styles.floatingVitalBadge, { top: 12, right: -6 }]}>
            <Droplet size={12} color="#0284C7" />
            <Text style={styles.floatingVitalVal}>98%</Text>
            <Text style={styles.floatingVitalLabel}>SpO2</Text>
          </View>

          {/* Floating Vitals Badge 4: Blood Sugar (Bottom Right) */}
          <View style={[styles.floatingVitalBadge, { bottom: 12, right: -6 }]}>
            <Heart size={12} color="#38BDF8" />
            <Text style={styles.floatingVitalVal}>90 <Text style={{ fontSize: 7 }}>mg/dL</Text></Text>
            <Text style={styles.floatingVitalLabel}>Blood Sugar</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* 4. MAIN 2X2 FEATURE GRID */}
      <View style={styles.feature2x2Grid}>
        {/* Card 1: CPR Training */}
        <TouchableOpacity
          style={styles.gridCard}
          onPress={() => setCurrentScreen('cpr_training')}
          activeOpacity={0.85}
        >
          <View style={[styles.gridCardIconBox, { backgroundColor: '#FEE2E2' }]}>
            <Heart size={20} color="#EF4444" />
          </View>
          <View style={{ gap: 2 }}>
            <Text style={styles.gridCardTitle}>CPR Training</Text>
            <Text style={styles.gridCardDesc}>Learn life-saving CPR with AR.</Text>
          </View>
          <View style={styles.gridArrowRow}>
            <ArrowRight size={14} color="#EF4444" />
          </View>
        </TouchableOpacity>

        {/* Card 2: Bleeding Training */}
        <TouchableOpacity
          style={styles.gridCard}
          onPress={() => setCurrentScreen('bleeding_training')}
          activeOpacity={0.85}
        >
          <View style={[styles.gridCardIconBox, { backgroundColor: '#FFEDD5' }]}>
            <Droplet size={20} color="#F97316" />
          </View>
          <View style={{ gap: 2 }}>
            <Text style={styles.gridCardTitle}>Bleeding Training</Text>
            <Text style={styles.gridCardDesc}>Learn to control severe bleeding.</Text>
          </View>
          <View style={styles.gridArrowRow}>
            <ArrowRight size={14} color="#F97316" />
          </View>
        </TouchableOpacity>

        {/* Card 3: AI Health Assistant */}
        <TouchableOpacity
          style={styles.gridCard}
          onPress={() => setCurrentScreen('ai_doctor')}
          activeOpacity={0.85}
        >
          <View style={[styles.gridCardIconBox, { backgroundColor: '#F3E8FF' }]}>
            <MessageSquare size={20} color="#A855F7" />
          </View>
          <View style={{ gap: 2 }}>
            <Text style={styles.gridCardTitle}>AI Health Assistant</Text>
            <Text style={styles.gridCardDesc}>Talk to AI doctor, get guidance.</Text>
          </View>
          <View style={styles.gridArrowRow}>
            <ArrowRight size={14} color="#A855F7" />
          </View>
        </TouchableOpacity>

        {/* Card 4: My Health Hub */}
        <TouchableOpacity
          style={styles.gridCard}
          onPress={() => setCurrentScreen('profile')}
          activeOpacity={0.85}
        >
          <View style={[styles.gridCardIconBox, { backgroundColor: '#DCFCE7' }]}>
            <ShieldCheck size={20} color="#16A34A" />
          </View>
          <View style={{ gap: 2 }}>
            <Text style={styles.gridCardTitle}>My Health Hub</Text>
            <Text style={styles.gridCardDesc}>Reports, history & medical records.</Text>
          </View>
          <View style={styles.gridArrowRow}>
            <ArrowRight size={14} color="#16A34A" />
          </View>
        </TouchableOpacity>
      </View>

      {/* 5. QUICK HEALTH OVERVIEW SECTION WITH WAVEFORMS */}
      <View style={styles.overviewSection}>
        <View style={styles.overviewHeader}>
          <Text style={styles.overviewTitle}>Quick Health Overview</Text>
          <TouchableOpacity onPress={() => setCurrentScreen('digital_twin')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.overviewCardsRow}>
          {/* Card 1: Heart Rate */}
          <View style={styles.waveformCard}>
            <Heart size={14} color="#EF4444" />
            <Text style={styles.waveValText}>
              72 <Text style={styles.waveUnitText}>bpm</Text>
            </Text>
            <Text style={styles.waveLabelText}>Heart Rate</Text>
            {/* Red Sparkline Curve */}
            <svg width="100%" height="22" viewBox="0 0 70 22" fill="none" style={{ marginTop: 4 }}>
              <path d="M0 16 Q10 12 18 17 T35 11 T52 16 T70 14" stroke="#EF4444" strokeWidth="1.8" fill="none" />
              <path d="M0 16 Q10 12 18 17 T35 11 T52 16 T70 14 L70 22 L0 22 Z" fill="rgba(239, 68, 68, 0.12)" />
            </svg>
          </View>

          {/* Card 2: SpO2 */}
          <View style={styles.waveformCard}>
            <Droplet size={14} color="#0284C7" />
            <Text style={styles.waveValText}>98%</Text>
            <Text style={styles.waveLabelText}>SpO2</Text>
            {/* Blue Sparkline Curve */}
            <svg width="100%" height="22" viewBox="0 0 70 22" fill="none" style={{ marginTop: 4 }}>
              <path d="M0 17 Q12 11 22 16 T42 9 T58 14 T70 12" stroke="#0284C7" strokeWidth="1.8" fill="none" />
              <path d="M0 17 Q12 11 22 16 T42 9 T58 14 T70 12 L70 22 L0 22 Z" fill="rgba(2, 132, 199, 0.12)" />
            </svg>
          </View>

          {/* Card 3: Blood Pressure */}
          <View style={styles.waveformCard}>
            <Activity size={14} color="#16A34A" />
            <Text style={styles.waveValText}>
              120/80 <Text style={styles.waveUnitText}>mmHg</Text>
            </Text>
            <Text style={styles.waveLabelText}>BP</Text>
            {/* Green Sparkline Curve */}
            <svg width="100%" height="22" viewBox="0 0 70 22" fill="none" style={{ marginTop: 4 }}>
              <path d="M0 18 Q14 13 26 18 T48 10 T60 15 T70 11" stroke="#16A34A" strokeWidth="1.8" fill="none" />
              <path d="M0 18 Q14 13 26 18 T48 10 T60 15 T70 11 L70 22 L0 22 Z" fill="rgba(22, 163, 74, 0.12)" />
            </svg>
          </View>

          {/* Card 4: Blood Sugar */}
          <View style={styles.waveformCard}>
            <Droplet size={14} color="#F59E0B" />
            <Text style={styles.waveValText}>
              90 <Text style={styles.waveUnitText}>mg/dL</Text>
            </Text>
            <Text style={styles.waveLabelText}>Blood Sugar</Text>
            {/* Orange Sparkline Curve */}
            <svg width="100%" height="22" viewBox="0 0 70 22" fill="none" style={{ marginTop: 4 }}>
              <path d="M0 15 Q10 18 22 13 T45 17 T58 11 T70 15" stroke="#F59E0B" strokeWidth="1.8" fill="none" />
              <path d="M0 15 Q10 18 22 13 T45 17 T58 11 T70 15 L70 22 L0 22 Z" fill="rgba(245, 158, 11, 0.12)" />
            </svg>
          </View>
        </View>
      </View>

      {/* 6. AI TIP OF THE DAY BANNER */}
      <TouchableOpacity
        style={styles.aiTipCard}
        onPress={() => setCurrentScreen('ai_doctor')}
        activeOpacity={0.9}
      >
        <View style={styles.aiTipAvatarCircle}>
          <Bot size={22} color="#0284C7" />
        </View>
        <View style={{ flex: 1, gap: 1 }}>
          <Text style={styles.aiTipTitle}>AI Tip of the Day</Text>
          <Text style={styles.aiTipDesc}>
            Stay hydrated and take short walks daily to keep your body and mind healthy.
          </Text>
        </View>
        <ChevronRight size={18} color="#94A3B8" />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 12,
    paddingBottom: 24,
  },
  topGreetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  helloTitle: {
    color: '#0F172A',
    fontSize: 19,
    fontWeight: '800',
  },
  helloSubtitle: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 1,
  },
  healthStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
  },
  statusIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusLabel: {
    color: '#64748B',
    fontSize: 8,
    fontWeight: '600',
  },
  statusValue: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '800',
  },
  categoryPillsScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryPillText: {
    color: '#0F172A',
    fontSize: 10,
    fontWeight: '700',
  },
  heroDigitalTwinCard: {
    backgroundColor: '#0043C6',
    backgroundImage: 'linear-gradient(135deg, #0B4BB8 0%, #002D7A 100%)',
    borderRadius: 20,
    padding: 14,
    position: 'relative',
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 175,
    boxShadow: '0 8px 24px rgba(11, 75, 184, 0.35)',
  },
  cubeBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
    zIndex: 10,
  },
  twinLeftColumn: {
    flex: 1,
    justifyContent: 'space-between',
    maxWidth: '52%',
    zIndex: 5,
  },
  twinCardTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  twinSyncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    marginBottom: 6,
  },
  greenSyncDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#00E676',
  },
  twinSyncText: {
    color: '#93C5FD',
    fontSize: 9,
    fontWeight: '600',
  },
  twinDescText: {
    color: '#E0E7FF',
    fontSize: 10,
    lineHeight: 14,
    marginBottom: 10,
  },
  viewDashboardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    alignSelf: 'flex-start',
    boxShadow: '0 2px 8px rgba(2, 132, 199, 0.4)',
  },
  viewDashboardBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  twinHologramContainer: {
    width: '46%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  humanHoloGraphic: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingVitalBadge: {
    position: 'absolute',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 3,
    alignItems: 'center',
    backdropFilter: 'blur(4px)',
    minWidth: 52,
    zIndex: 5,
  },
  floatingVitalVal: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  floatingVitalLabel: {
    color: '#94A3B8',
    fontSize: 7,
    fontWeight: '600',
  },
  feature2x2Grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'space-between',
    minHeight: 110,
    gap: 6,
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
  },
  gridCardIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCardTitle: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
  },
  gridCardDesc: {
    color: '#64748B',
    fontSize: 9,
    lineHeight: 12,
  },
  gridArrowRow: {
    alignSelf: 'flex-end',
  },
  overviewSection: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overviewTitle: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
  },
  viewAllText: {
    color: '#0284C7',
    fontSize: 10,
    fontWeight: '700',
  },
  overviewCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  waveformCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    gap: 1,
  },
  waveValText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
  },
  waveUnitText: {
    fontSize: 8,
    color: '#64748B',
  },
  waveLabelText: {
    color: '#64748B',
    fontSize: 8,
    fontWeight: '600',
  },
  aiTipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  aiTipAvatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  aiTipTitle: {
    color: '#0284C7',
    fontSize: 11,
    fontWeight: '800',
  },
  aiTipDesc: {
    color: '#334155',
    fontSize: 9,
    lineHeight: 13,
  },
});
