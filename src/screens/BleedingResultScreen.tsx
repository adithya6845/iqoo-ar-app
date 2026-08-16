import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft, X, Award, Share2, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';

export const BleedingResultScreen: React.FC = () => {
  const { setCurrentScreen, lastBleedingScore } = useApp();

  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.4 },
        colors: ['#FF5252', '#00E676', '#00F0FF'],
      });
    } catch (e) {}
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')}>
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bleeding Control Result</Text>
        <TouchableOpacity onPress={() => setCurrentScreen('home')}>
          <X size={22} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.excellentText}>Severe Bleeding Controlled!</Text>
        <Text style={styles.completedSubText}>You successfully stabilized the patient</Text>

        <View style={styles.scoreCircle}>
          <Text style={styles.scoreNumber}>{lastBleedingScore.overallScore}</Text>
          <Text style={styles.scoreTotal}>/100</Text>
        </View>

        <View style={styles.overallTag}>
          <CheckCircle2 size={14} color="#00E676" />
          <Text style={styles.overallTagText}>Arterial Pressure Maintained</Text>
        </View>
      </View>

      <View style={styles.metricsContainer}>
        <Text style={styles.metricsTitle}>Emergency Control Metrics</Text>

        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Control Response Time</Text>
          <Text style={styles.metricValue}>{lastBleedingScore.timeElapsedSeconds} sec</Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Direct Pressure Quality</Text>
          <Text style={styles.metricValue}>{lastBleedingScore.pressureApplied}% (Optimal)</Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Tourniquet Placement</Text>
          <Text style={[styles.metricValue, { color: '#00E676' }]}>Correct & Sealed</Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Est. Blood Loss Prevented</Text>
          <Text style={styles.metricValue}>{lastBleedingScore.bloodLossPreventedPercent}%</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryReportBtn}
        onPress={() => setCurrentScreen('home')}
      >
        <Text style={styles.primaryReportText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C070D',
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
  heroCard: {
    backgroundColor: '#1E1018',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3B1825',
    gap: 12,
  },
  excellentText: {
    color: '#00E676',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  completedSubText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 3,
    borderColor: '#00E676',
    marginVertical: 6,
  },
  scoreNumber: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
  },
  scoreTotal: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 8,
  },
  overallTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  overallTagText: {
    color: '#00E676',
    fontSize: 12,
    fontWeight: '600',
  },
  metricsContainer: {
    backgroundColor: '#170E18',
    borderRadius: 20,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: '#3B1825',
  },
  metricsTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A1828',
  },
  metricLabel: {
    color: '#94A3B8',
    fontSize: 13,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  primaryReportBtn: {
    backgroundColor: '#FF5252',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  primaryReportText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
