import React from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar } from 'react-native';
import { AppProvider, useApp } from './src/context/AppContext';
import { Header } from './src/components/Header';
import { BottomNav } from './src/components/BottomNav';
import { HomeScreen } from './src/screens/HomeScreen';
import { CprTrainingScreen } from './src/screens/CprTrainingScreen';
import { CprResultScreen } from './src/screens/CprResultScreen';
import { BleedingTrainingScreen } from './src/screens/BleedingTrainingScreen';
import { BleedingResultScreen } from './src/screens/BleedingResultScreen';
import { AiDoctorScreen } from './src/screens/AiDoctorScreen';
import { ConsultationSummaryScreen } from './src/screens/ConsultationSummaryScreen';
import { PrescriptionScreen } from './src/screens/PrescriptionScreen';
import { DigitalTwinScreen } from './src/screens/DigitalTwinScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

const MainContent: React.FC = () => {
  const { currentScreen } = useApp();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen />;
      case 'cpr_training':
        return <CprTrainingScreen />;
      case 'cpr_result':
        return <CprResultScreen />;
      case 'bleeding_training':
        return <BleedingTrainingScreen />;
      case 'bleeding_result':
        return <BleedingResultScreen />;
      case 'ai_doctor':
        return <AiDoctorScreen />;
      case 'consultation_summary':
        return <ConsultationSummaryScreen />;
      case 'prescription':
        return <PrescriptionScreen />;
      case 'digital_twin':
        return <DigitalTwinScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  const showHeader =
    currentScreen === 'home' ||
    currentScreen === 'digital_twin' ||
    currentScreen === 'profile';

  return (
    <View style={styles.phoneWrapper}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0C0F17" />
        {showHeader && <Header />}
        <View style={styles.body}>{renderScreen()}</View>
        <BottomNav />
      </SafeAreaView>
    </View>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  phoneWrapper: {
    flex: 1,
    backgroundColor: '#05070B',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: '#0C0F17',
    maxWidth: 420,
    width: '100%',
    maxHeight: 840,
    height: '100%',
    alignSelf: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 24,
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 240, 255, 0.1)',
  },
  body: {
    flex: 1,
    overflow: 'hidden',
  },
});
