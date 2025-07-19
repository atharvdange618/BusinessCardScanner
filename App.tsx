import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet } from 'react-native';
import { initialScannedContact, ScannedContact } from './types/contact';
import ProcessingScreen from './screens/ProcessingScreen';
import CameraScreen from './components/CameraScreen';
import ReviewScreen from './screens/ReviewScreen';

type AppState = 'camera' | 'processing' | 'review';

function App() {
  const [appState, setAppState] = useState<AppState>('camera');
  const [capturedImagePath, setCapturedImagePath] = useState<string | null>(
    null,
  );
  const [scannedContactData, setScannedContactData] = useState<ScannedContact>(
    initialScannedContact,
  );

  const handlePhotoCaptured = (path: string) => {
    setCapturedImagePath(path);
    setAppState('processing');
  };

  const handleProcessingComplete = (contact: ScannedContact) => {
    setScannedContactData(contact);
    setAppState('review');
  };

  const handleProcessingError = (error: string) => {
    console.error('Processing failed:', error);
    setAppState('camera');
  };

  const handleSaveContact = (contact: ScannedContact) => {
    console.log('Final Contact to Save:', contact);
    Alert.alert(
      'Contact Saved!',
      'This is where we would save to phone contacts.',
    );
    setAppState('camera');
  };

  const handleCancelReview = () => {
    setAppState('camera');
  };
  return (
    <SafeAreaView style={styles.container}>
      {appState === 'camera' && (
        <CameraScreen onPhotoCaptured={handlePhotoCaptured} />
      )}
      {appState === 'processing' && capturedImagePath && (
        <ProcessingScreen
          imagePath={capturedImagePath}
          onProcessingComplete={handleProcessingComplete}
          onProcessingError={handleProcessingError}
        />
      )}
      {appState === 'review' && (
        <ReviewScreen
          scannedContact={scannedContactData}
          onSave={handleSaveContact}
          onCancel={handleCancelReview}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
});

export default App;
