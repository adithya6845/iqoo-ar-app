import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft, ShieldCheck, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ConsultationSummaryScreen: React.FC = () => {
  const { setCurrentScreen } = useApp();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('ai_doctor')}>
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Consultation Summary</Text>
        <TouchableOpacity onPress={() => setCurrentScreen('prescription')}>
          <FileText size={20} color="#00F0FF" />
        </TouchableOpacity>
      </View>

      {/* Possible Causes Card */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <AlertCircle size={18} color="#F59E0B" />
          <Text style={styles.cardTitle}>Possible Causes</Text>
        </View>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Dehydration</Text>
          <Text style={styles.bulletItem}>• Migraine</Text>
          <Text style={styles.bulletItem}>• Lack of sleep</Text>
        </View>
      </View>

      {/* Recommended Action Card */}
      <View style={styles.actionCard}>
        <Text style={styles.cardTitle}>Recommended Action</Text>
        
        <View style={styles.riskPill}>
          <ShieldCheck size={16} color="#00E676" />
          <Text style={styles.riskText}>Low Risk</Text>
        </View>

        <Text style={styles.actionDesc}>
          You can rest and hydrate. Monitor symptoms.
        </Text>
      </View>

      {/* Suggestions List */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Suggestions</Text>
        <View style={styles.suggestionList}>
          <View style={styles.suggestionRow}>
            <CheckCircle2 size={16} color="#00F0FF" />
            <Text style={styles.suggestionText}>Drink enough water</Text>
          </View>
          <View style={styles.suggestionRow}>
            <CheckCircle2 size={16} color="#00F0FF" />
            <Text style={styles.suggestionText}>Take rest</Text>
          </View>
          <View style={styles.suggestionRow}>
            <CheckCircle2 size={16} color="#00F0FF" />
            <Text style={styles.suggestionText}>Avoid screen for sometime</Text>
          </View>
        </View>
      </View>

      {/* Medical Disclaimer */}
      <View style={styles.disclaimerBox}>
        <Text style={styles.disclaimerText}>
          Note: This is AI guidance, not a substitute for professional medical advice.
        </Text>
      </View>

      {/* Bottom Action Button */}
      <TouchableOpacity
        style={styles.nextBtn}
        onPress={() => setCurrentScreen('prescription')}
      >
        <Text style={styles.nextBtnText}>View AI Prescription</Text>
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
  card: {
    backgroundColor: '#141C2B',
    borderRadius: 20,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  bulletList: {
    gap: 6,
    paddingLeft: 4,
  },
  bulletItem: {
    color: '#CBD5E1',
    fontSize: 13,
  },
  actionCard: {
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
    borderRadius: 20,
    padding: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: '#00E676',
  },
  riskPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 230, 118, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    alignSelf: 'flex-start',
  },
  riskText: {
    color: '#00E676',
    fontSize: 13,
    fontWeight: '800',
  },
  actionDesc: {
    color: '#E2E8F0',
    fontSize: 13,
  },
  suggestionList: {
    gap: 10,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  suggestionText: {
    color: '#E2E8F0',
    fontSize: 13,
  },
  disclaimerBox: {
    backgroundColor: '#161E2E',
    padding: 14,
    borderRadius: 14,
  },
  disclaimerText: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  nextBtn: {
    backgroundColor: '#00F0FF',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 6,
  },
  nextBtnText: {
    color: '#0C0F17',
    fontSize: 14,
    fontWeight: '800',
  },
});
