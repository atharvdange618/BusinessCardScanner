import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { ScannedContact } from '../types/contact';
import { parseOcrText } from '../utils/parsingUtils';

type ProcessingScreenProps = {
  imagePath: string;
  onProcessingComplete: (contact: ScannedContact) => void;
  onProcessingError: (error: string) => void;
};

const ProcessingScreen: React.FC<ProcessingScreenProps> = ({
  imagePath,
  onProcessingComplete,
  onProcessingError,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState('Processing image...');

  const processImageForOCR = useCallback(async () => {
    setIsLoading(true);
    setStatus('Analyzing business card for text...');
    try {
      const imageUri = imagePath.startsWith('file://')
        ? imagePath
        : `file://${imagePath}`;
      console.log('Processing image with ML Kit:', imageUri);

      // Perform OCR
      const result = await TextRecognition.recognize(imageUri);
      console.log('ML Kit OCR Result:', result.text);

      setStatus('Extracting contact details...');
      // Perform parsing
      const parsedContact = parseOcrText(result.text);

      setStatus('Processing complete!');
      setIsLoading(false);
      onProcessingComplete(parsedContact);
    } catch (error: any) {
      console.error('OCR or parsing error:', error);
      setIsLoading(false);
      const errorMessage =
        error.message || 'An unknown error occurred during processing.';
      Alert.alert('Processing Error', errorMessage);
      onProcessingError(errorMessage);
    }
  }, [imagePath, onProcessingComplete, onProcessingError]);

  useEffect(() => {
    processImageForOCR();
  }, [processImageForOCR]);

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <Text style={styles.statusText}>{status}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  statusText: {
    marginTop: 20,
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
  },
});

export default ProcessingScreen;
