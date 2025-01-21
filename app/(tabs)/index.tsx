import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import * as SecureStore from 'expo-secure-store';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ImagePickerComponent = () => {
  const [image, setImage] = useState(null);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [galleryPermission, setGalleryPermission] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkIfFirstLaunch();
  }, []);

  const checkIfFirstLaunch = async () => {
    try {
      const hasLaunched = await SecureStore.getItemAsync('hasLaunched');
      if (hasLaunched === null) {
        await SecureStore.setItemAsync('hasLaunched', 'true');
        requestInitialPermissions();
      } else {
        setIsFirstLaunch(false);
        checkExistingPermissions();
      }
    } catch (error) {
      console.error('Error checking first launch:', error);
    }
  };

  const requestInitialPermissions = async () => {
    Alert.alert(
      "👋 Welcome!",
      "To help you capture and share moments, we need access to your camera and photos.",
      [
        {
          text: "Let's Get Started",
          onPress: requestPermissionsSequentially
        }
      ]
    );
  };

  const requestPermissionsSequentially = async () => {
    // Camera permission
    const cameraResult = await Camera.requestCameraPermissionsAsync();
    setCameraPermission(cameraResult.status === 'granted');

    // Gallery permission
    const galleryResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    setGalleryPermission(galleryResult.status === 'granted');

    if (cameraResult.status === 'granted' && galleryResult.status === 'granted') {
      Alert.alert(
        "🎉 All Set!",
        "You're ready to start capturing moments.",
        [{ text: "Great!" }]
      );
    }
  };

  const checkExistingPermissions = async () => {
    const cameraStatus = await Camera.getCameraPermissionsAsync();
    setCameraPermission(cameraStatus.status === 'granted');

    const galleryStatus = await ImagePicker.getMediaLibraryPermissionsAsync();
    setGalleryPermission(galleryStatus.status === 'granted');
  };

  const launchCamera = async () => {
    if (!cameraPermission) {
      Alert.alert(
        "📸 Camera Access Needed",
        "Please enable camera access to take photos.",
        [
          { text: "Not Now", style: "cancel" },
          { text: "Open Settings", onPress: () => ImagePicker.openSettings() }
        ]
      );
      return;
    }

    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
    setLoading(false);
  };

  const launchGallery = async () => {
    if (!galleryPermission) {
      Alert.alert(
        "🖼️ Gallery Access Needed",
        "Please enable photo gallery access to select photos.",
        [
          { text: "Not Now", style: "cancel" },
          { text: "Open Settings", onPress: () => ImagePicker.openSettings() }
        ]
      );
      return;
    }

    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Image Picker</Text>
      
      <View style={styles.imageContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <MaterialIcons name="add-photo-alternate" size={50} color="#666" />
            <Text style={styles.placeholderText}>
              Take a photo or choose from gallery
            </Text>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.cameraButton]}
          onPress={launchCamera}
          activeOpacity={0.7}
        >
          <MaterialIcons name="camera-alt" size={24} color="white" />
          <Text style={styles.buttonText}>Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.galleryButton]}
          onPress={launchGallery}
          activeOpacity={0.7}
        >
          <MaterialIcons name="photo-library" size={24} color="white" />
          <Text style={styles.buttonText}>Gallery</Text>
        </TouchableOpacity>
      </View>

      {(!cameraPermission || !galleryPermission) && (
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => ImagePicker.openSettings()}
        >
          <MaterialIcons name="settings" size={20} color="#007AFF" />
          <Text style={styles.settingsText}>
            Enable permissions in settings
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  imageContainer: {
    width: width - 40,
    aspectRatio: 4/3,
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    width: '48%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  cameraButton: {
    backgroundColor: '#007AFF',
  },
  galleryButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
  },
  settingsText: {
    color: '#007AFF',
    marginLeft: 5,
    fontSize: 16,
  },
});

export default ImagePickerComponent;