import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft, Cpu, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MediTwinSimulator } from '../components/MediTwinSimulator';

export const DigitalTwinScreen: React.FC = () => {
  const { setCurrentScreen } = useApp();

  return (
    <View style={styles.container}>
      {/* Top Mobile Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => setCurrentScreen('home')}>
          <ArrowLeft size={18} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Digital Twin</Text>
          <View style={styles.liveTag}>
            <View style={styles.greenDot} />
            <Text style={styles.liveText}>PK Simulation Engine Active</Text>
          </View>
        </View>
        <View style={styles.iconBtn}>
          <Cpu size={18} color="#0284C7" />
        </View>
      </View>

      {/* Embedded Mobile-Optimized MediTwin Simulator */}
      <MediTwinSimulator />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  greenDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  liveText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '600',
  },
});
