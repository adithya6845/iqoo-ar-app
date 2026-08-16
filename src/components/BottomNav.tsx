import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Home, Award, Plus, BriefcaseMedical, User } from 'lucide-react';
import { ScreenType } from '../types';
import { useApp } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { currentScreen, setCurrentScreen } = useApp();

  return (
    <View style={styles.navBar}>
      {/* 1. Home Tab */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => setCurrentScreen('home')}
        activeOpacity={0.7}
      >
        <Home size={20} color={currentScreen === 'home' ? '#0284C7' : '#64748B'} />
        <Text style={[styles.navLabel, currentScreen === 'home' && styles.activeNavLabel]}>
          Home
        </Text>
        {currentScreen === 'home' && <View style={styles.activeIndicator} />}
      </TouchableOpacity>

      {/* 2. Training Tab */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => setCurrentScreen('cpr_training')}
        activeOpacity={0.7}
      >
        <Award
          size={20}
          color={
            currentScreen === 'cpr_training' ||
            currentScreen === 'cpr_result' ||
            currentScreen === 'bleeding_training' ||
            currentScreen === 'bleeding_result'
              ? '#0284C7'
              : '#64748B'
          }
        />
        <Text
          style={[
            styles.navLabel,
            (currentScreen === 'cpr_training' ||
              currentScreen === 'cpr_result' ||
              currentScreen === 'bleeding_training' ||
              currentScreen === 'bleeding_result') &&
              styles.activeNavLabel,
          ]}
        >
          Training
        </Text>
      </TouchableOpacity>

      {/* 3. Center Glowing Plus Button */}
      <TouchableOpacity
        style={styles.centerPlusBtn}
        onPress={() => setCurrentScreen('digital_twin')}
        activeOpacity={0.85}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* 4. AI Doctor Tab */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => setCurrentScreen('ai_doctor')}
        activeOpacity={0.7}
      >
        <BriefcaseMedical
          size={20}
          color={
            currentScreen === 'ai_doctor' ||
            currentScreen === 'consultation_summary' ||
            currentScreen === 'prescription'
              ? '#0284C7'
              : '#64748B'
          }
        />
        <Text
          style={[
            styles.navLabel,
            (currentScreen === 'ai_doctor' ||
              currentScreen === 'consultation_summary' ||
              currentScreen === 'prescription') &&
              styles.activeNavLabel,
          ]}
        >
          AI Doctor
        </Text>
      </TouchableOpacity>

      {/* 5. Profile Tab */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => setCurrentScreen('profile')}
        activeOpacity={0.7}
      >
        <User size={20} color={currentScreen === 'profile' ? '#0284C7' : '#64748B'} />
        <Text style={[styles.navLabel, currentScreen === 'profile' && styles.activeNavLabel]}>
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    position: 'relative',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    flex: 1,
    paddingVertical: 2,
  },
  centerPlusBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
    marginHorizontal: 4,
  },
  navLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '600',
  },
  activeNavLabel: {
    color: '#0284C7',
    fontWeight: '800',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 24,
    height: 3,
    backgroundColor: '#0284C7',
    borderRadius: 2,
  },
});
