import React from 'react';
import { SafeAreaView } from 'react-native';
import VoiceConsultation from '../components/VoiceConsultation';

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <VoiceConsultation />
    </SafeAreaView>
  );
}