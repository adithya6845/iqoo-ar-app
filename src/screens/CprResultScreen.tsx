import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft, X, Award, RotateCcw, Share2, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';

export const CprResultScreen: React.FC = () => {
  const { setCurrentScreen, lastCprScore } = useApp();

  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.4 },
        colors: ['#00F0FF', '#00E676', '#FF5252', '#F59E0B'],
      });
    } catch (e) {}
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => setCurrentScreen('home')}>
          <ArrowLeft size={18} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Training Result</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={() => setCurrentScreen('home')}>
          <X size={18} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Hero Score Card Matching Reference Image Screen 3 */}
      <View style={styles.heroCard}>
        <View style={styles.trophyBg}>
          <Trophy size={28} color="#F59E0B" />
        </View>
        <Text style={styles.excellentText}>Excellent!</Text>
        <Text style={styles.completedSubText}>You completed CPR Training</Text>

        <View style={styles.scoreCircle}>
          <Text style={styles.scoreNumber}>{lastCprScore.overallScore}</Text>
          <Text style={styles.scoreTotal}>/100</Text>
        </View>
        <Text style={styles.scoreLabel}>Overall Score</Text>
      </View>

      {/* Metrics Breakdown Table */}
      <View style={styles.metricsContainer}>
        {/* Compression Rate */}
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Compression Rate</Text>
          <View style={styles.metricValGroup}>
            <Text style={styles.metricValue}>{lastCprScore.compressionRate} /min</Text>
            <View style={styles.statusBadgeGood}>
              <Text style={styles.statusBadgeText}>Good</Text>
            </View>
          </View>
        </View>

        {/* Compression Depth */}
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Compression Depth</Text>
          <View style={styles.metricValGroup}>
            <Text style={styles.metricValue}>{lastCprScore.compressionDepth} cm</Text>
            <View style={styles.statusBadgeGood}>
              <Text style={styles.statusBadgeText}>Good</Text>
            </View>
          </View>
        </View>

        {/* Hand Position */}
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Hand Position</Text>
          <View style={styles.metricValGroup}>
            <Text style={styles.metricValue}>{lastCprScore.handPosition}</Text>
            <View style={styles.statusBadgeGood}>
              <Text style={styles.statusBadgeText}>Good</Text>
            </View>
          </View>
        </View>

        {/* Full Compressions */}
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Full Compressions</Text>
          <View style={styles.metricValGroup}>
            <Text style={styles.metricValue}>
              {lastCprScore.fullCompressions} /{lastCprScore.targetCompressions}
            </Text>
            <View style={styles.statusBadgeGood}>
              <Text style={styles.statusBadgeText}>Good</Text>
            </View>
          </View>
        </View>

        {/* Rescue Breaths */}
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Rescue Breaths</Text>
          <View style={styles.metricValGroup}>
            <Text style={styles.metricValue}>
              {lastCprScore.rescueBreaths} /{lastCprScore.targetBreaths}
            </Text>
            <View style={styles.statusBadgePerfect}>
              <Text style={styles.statusBadgeTextPerfect}>Perfect</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons Matching Reference Screenshot */}
      <View style={styles.actionSection}>
        <TouchableOpacity
          style={styles.primaryReportBtn}
          onPress={() => setCurrentScreen('home')}
        >
          <Text style={styles.primaryReportText}>View Detailed Report</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tryAgainBtn}
          onPress={() => setCurrentScreen('cpr_training')}
        >
          <RotateCcw size={16} color="#0284C7" />
          <Text style={styles.tryAgainText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 12,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  },
  trophyBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  excellentText: {
    color: '#16A34A',
    fontSize: 22,
    fontWeight: '800',
  },
  completedSubText: {
    color: '#64748B',
    fontSize: 12,
  },
  scoreCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 3,
    borderColor: '#16A34A',
    marginVertical: 4,
  },
  scoreNumber: {
    color: '#0F172A',
    fontSize: 32,
    fontWeight: '800',
  },
  scoreTotal: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 8,
  },
  scoreLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  metricsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  metricLabel: {
    color: '#64748B',
    fontSize: 11,
  },
  metricValGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricValue: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadgeGood: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: '#16A34A',
    fontSize: 9,
    fontWeight: '700',
  },
  statusBadgePerfect: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeTextPerfect: {
    color: '#0284C7',
    fontSize: 9,
    fontWeight: '700',
  },
  actionSection: {
    gap: 8,
  },
  primaryReportBtn: {
    backgroundColor: '#3B82F6',
    paddingVertical: 11,
    borderRadius: 20,
    alignItems: 'center',
  },
  primaryReportText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  tryAgainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tryAgainText: {
    color: '#0284C7',
    fontSize: 12,
    fontWeight: '700',
  },
});
