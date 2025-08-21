import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-audio';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

interface ConsultationState {
  isRecording: boolean;
  audioUri: string | null;
  imageUri: string | null;
  diagnosis: string;
  isProcessing: boolean;
  isSpeaking: boolean;
}

export default function VoiceConsultation() {
  const [state, setState] = useState<ConsultationState>({
    isRecording: false,
    audioUri: null,
    imageUri: null,
    diagnosis: '',
    isProcessing: false,
    isSpeaking: false,
  });
  
  const recording = useRef<Audio.Recording | null>(null);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recording.current = newRecording;
      setState(prev => ({ ...prev, isRecording: true }));
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording.current) return;

    setState(prev => ({ ...prev, isRecording: false, isProcessing: true }));
    await recording.current.stopAndUnloadAsync();
    const uri = recording.current.getURI();
    recording.current = null;
    
    // Here we would normally send the audio file to a speech-to-text service
    // For demo, we'll simulate a response
    setTimeout(() => {
      processConsultation();
    }, 1500);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setState(prev => ({ ...prev, imageUri: result.assets[0].uri }));
    }
  };

  const processConsultation = async () => {
    // Simulate AI processing
    setState(prev => ({ ...prev, isProcessing: true }));
    
    const mockDiagnosis = `Based on your symptoms and the provided image, here are my recommendations:

1. Apply over-the-counter hydrocortisone cream twice daily
2. Avoid scratching the affected area
3. Keep the area clean and dry
4. Take an oral antihistamine if experiencing itching
5. Consider using a gentle, fragrance-free moisturizer

Please note: This is an AI-generated recommendation. For accurate diagnosis and treatment, please consult with a healthcare professional.`;

    setState(prev => ({ 
      ...prev, 
      diagnosis: mockDiagnosis,
      isProcessing: false 
    }));

    // Automatically start speaking the diagnosis
    speakDiagnosis(mockDiagnosis);
  };

  const speakDiagnosis = async (text: string) => {
    setState(prev => ({ ...prev, isSpeaking: true }));
    try {
      await Speech.speak(text, {
        language: 'en',
        pitch: 1,
        rate: 0.9,
        onDone: () => setState(prev => ({ ...prev, isSpeaking: false })),
      });
    } catch (error) {
      console.error('Error speaking:', error);
      setState(prev => ({ ...prev, isSpeaking: false }));
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <FontAwesome5 name="user-md" size={40} color="#2c3e50" />
        <Text style={styles.title}>AI Medical Consultation</Text>
      </View>

      <View style={styles.inputSection}>
        <TouchableOpacity 
          style={[styles.recordButton, state.isRecording && styles.recording]}
          onPress={state.isRecording ? stopRecording : startRecording}
        >
          <MaterialIcons 
            name={state.isRecording ? "stop" : "mic"} 
            size={32} 
            color="white" 
          />
          <Text style={styles.buttonText}>
            {state.isRecording ? "Stop Recording" : "Start Recording"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <MaterialIcons name="add-photo-alternate" size={32} color="white" />
          <Text style={styles.buttonText}>Upload Image</Text>
        </TouchableOpacity>

        {state.imageUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: state.imageUri }} style={styles.image} />
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={processConsultation}
            >
              <Text style={styles.submitText}>Get Diagnosis</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {state.isProcessing && (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color="#2c3e50" />
          <Text style={styles.processingText}>Processing your consultation...</Text>
        </View>
      )}

      {state.diagnosis && (
        <View style={styles.diagnosisContainer}>
          <Text style={styles.diagnosisTitle}>AI Diagnosis & Recommendations</Text>
          <Text style={styles.diagnosisText}>{state.diagnosis}</Text>
          
          <TouchableOpacity 
            style={styles.speakButton}
            onPress={() => speakDiagnosis(state.diagnosis)}
            disabled={state.isSpeaking}
          >
            <MaterialIcons 
              name={state.isSpeaking ? "volume-up" : "volume-up"} 
              size={24} 
              color="white" 
            />
            <Text style={styles.buttonText}>
              {state.isSpeaking ? "Speaking..." : "Speak Diagnosis"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 8,
  },
  inputSection: {
    marginBottom: 24,
  },
  recordButton: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  recording: {
    backgroundColor: '#e74c3c',
  },
  imageButton: {
    backgroundColor: '#2ecc71',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  imageContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  image: {
    width: 300,
    height: 225,
    borderRadius: 12,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#9b59b6',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  processingContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  processingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#2c3e50',
  },
  diagnosisContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  diagnosisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  diagnosisText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#34495e',
    marginBottom: 16,
  },
  speakButton: {
    backgroundColor: '#f39c12',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});