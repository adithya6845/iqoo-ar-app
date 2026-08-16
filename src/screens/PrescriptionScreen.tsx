import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft, Pill, FileCheck, Stethoscope, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PrescriptionScreen: React.FC = () => {
  const { setCurrentScreen } = useApp();

  const handleSave = () => {
    alert('Prescription and AI consultation saved to My Health Hub!');
    setCurrentScreen('profile');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('consultation_summary')}>
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prescription (AI Suggestion)</Text>
        <View style={{ width: 20 }} />
      </View>

      {/* Main Prescription Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Stethoscope size={20} color="#00F0FF" />
          <View>
            <Text style={styles.careTitle}>AI Suggested Care</Text>
            <Text style={styles.careSubtitle}>(For doctor review)</Text>
          </View>
        </View>

        {/* Med 1 */}
        <View style={styles.medItem}>
          <View style={styles.rxBadge}>
            <Text style={styles.rxText}>Rx</Text>
          </View>
          <View>
            <Text style={styles.medName}>Paracetamol 500mg</Text>
            <Text style={styles.medDosage}>1 tablet if headache</Text>
          </View>
        </View>

        {/* Med 2 */}
        <View style={styles.medItem}>
          <View style={styles.rxBadge}>
            <Text style={styles.rxText}>Rx</Text>
          </View>
          <View>
            <Text style={styles.medName}>ORS (Oral Rehydration Salts)</Text>
            <Text style={styles.medDosage}>1 packet after meal</Text>
          </View>
        </View>
      </View>

      {/* Medical Warning Note */}
      <View style={styles.noteBox}>
        <FileCheck size={18} color="#94A3B8" />
        <Text style={styles.noteText}>
          Please consult a doctor for appropriate diagnosis and prescription.
        </Text>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Save size={18} color="#FFFFFF" />
        <Text style={styles.saveBtnText}>Save to Records</Text>
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
    gap: 20,
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
  card: {
    backgroundColor: '#141C2B',
    borderRadius: 20,
    padding: 20,
    gap: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  careTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  careSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
  },
  medItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  rxBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  rxText: {
    color: '#00F0FF',
    fontSize: 14,
    fontWeight: '800',
  },
  medName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  medDosage: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#161F30',
    padding: 16,
    borderRadius: 16,
  },
  noteText: {
    flex: 1,
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 17,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 10,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
