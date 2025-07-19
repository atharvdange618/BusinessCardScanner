import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Camera,
  PhotoFile,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';

type CameraScreenProps = {
  navigation?: any;
  onPhotoCaptured: (imagePath: string) => void;
};

const CameraScreen: React.FC<CameraScreenProps> = ({ onPhotoCaptured }) => {
  const cameraRef = useRef<Camera>(null);
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  useEffect(() => {
    if (hasPermission && device) {
      setIsCameraActive(true);
    } else {
      setIsCameraActive(false);
    }
  }, [device, hasPermission]);

  const showPermissionAlert = useCallback(() => {
    Alert.alert(
      'Camera Permission Required',
      'This app needs camera accesss to scan business cards. Please go to settings to grant permission.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ],
      { cancelable: false },
    );
  }, []);

  const takePicture = async () => {
    if (cameraRef.current == null || !isCapturing) {
      console.warn('Camera is not ready or already capturing');
      return;
    }

    setIsCapturing(true);
    try {
      const photo: PhotoFile = await cameraRef.current.takePhoto({
        enableAutoRedEyeReduction: true,
        flash: 'auto',
        enableShutterSound: true,
      });

      console.log('Photo captured:', photo.path);
      onPhotoCaptured(photo.path);
    } catch (error) {
      console.error('Failed to take photo:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          Requesting Camera Permission...
        </Text>
        <ActivityIndicator size="large" color="#007AFF" />
        <TouchableOpacity style={styles.button} onPress={showPermissionAlert}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          No camera device found or initialized
        </Text>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isCameraActive}
        photo={true}
        enableZoomGesture={true}
      />

      <View style={styles.captureButtonContainer}>
        <TouchableOpacity
          style={[styles.captureButton, isCapturing && styles.disabledButton]}
          onPress={takePicture}
          disabled={isCapturing}
        >
          {isCapturing ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.captureButtonText}>Scan Card</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  permissionText: {
    color: '#FFF',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  captureButtonContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: 'grey',
  },
  captureButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default CameraScreen;
