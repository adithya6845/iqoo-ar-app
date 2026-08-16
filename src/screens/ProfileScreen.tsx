import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ArrowLeft, User, ShieldCheck, Award, FileText, Settings, Camera, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProfileScreen: React.FC = () => {
  const { setCurrentScreen, lastCprScore, lastBleedingScore } = useApp();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')}>
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Health Hub & Profile</Text>
        <TouchableOpacity onPress={() => alert('Settings')}>
          <Settings size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarBg}>
          <User size={36} color="#00F0FF" />
        </View>
        <View>
          <Text style={styles.userName}>John Doe</Text>
          <Text style={styles.userEmail}>john.doe@medtwin.ar</Text>
          <View style={styles.badgeRow}>
            <ShieldCheck size={14} color="#00E676" />
            <Text style={styles.badgeText}>Digital Twin Synced</Text>
          </View>
        </View>
      </View>

      {/* AR Training Certifications Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>AR Emergency Training Certificates</Text>

        <View style={styles.certRow}>
          <View style={styles.certIconBg}>
            <Award size={20} color="#00E676" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.certTitle}>CPR Emergency AR Certified</Text>
            <Text style={styles.certDate}>Score: {lastCprScore.overallScore}/100 • Certified Today</Text>
          </View>
        </View>

        <View style={styles.certRow}>
          <View style={[styles.certIconBg, { backgroundColor: 'rgba(255, 82, 82, 0.12)' }]}>
            <Award size={20} color="#FF5252" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.certTitle}>Severe Bleeding Control Certified</Text>
            <Text style={styles.certDate}>Score: {lastBleedingScore.overallScore}/100 • Certified Today</Text>
          </View>
        </View>
      </View>

      {/* Medical Records & Consultation Logs */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Medical Records & Consultations</Text>

        <TouchableOpacity
          style={styles.recordItem}
          onPress={() => setCurrentScreen('consultation_summary')}
        >
          <FileText size={18} color="#00F0FF" />
          <View style={{ flex: 1 }}>
            <Text style={styles.recordTitle}>AI Doctor Consultation #402</Text>
            <Text style={styles.recordSub}>Headache & Dizziness Assessment • Paracetamol 500mg</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* WebAR Device Diagnostics */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>WebAR Platform Diagnostics</Text>

        <View style={styles.diagRow}>
          <Camera size={18} color="#00E676" />
          <Text style={styles.diagLabel}>WebGL 3D Hardware Acceleration</Text>
          <Text style={styles.diagVal}>Enabled</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={() => setCurrentScreen('home')}>
        <LogOut size={18} color="#FF5252" />
        <Text style={styles.logoutText}>Return to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0F17',
  },
  content: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#141C2B',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  avatarBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  userEmail: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  badgeText: {
    color: '#00E676',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: '#141C2B',
    padding: 20,
    borderRadius: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  certRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  certIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  certTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  certDate: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recordTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  recordSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  diagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  diagLabel: {
    flex: 1,
    color: '#94A3B8',
    fontSize: 12,
  },
  diagVal: {
    color: '#00E676',
    fontSize: 12,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 82, 0.3)',
    marginTop: 10,
  },
  logoutText: {
    color: '#FF5252',
    fontSize: 13,
    fontWeight: '700',
  },
});
