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
  StatusBar,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import * as SecureStore from 'expo-secure-store';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const ImagePickerComponent = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean>(true);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [galleryPermission, setGalleryPermission] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

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
    const cameraResult = await Camera.requestCameraPermissionsAsync();
    setCameraPermission(cameraResult.status === 'granted');

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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Image Picker</Text>
        </View>

        <View style={styles.contentContainer}>
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
        </View>

        {(!cameraPermission || !galleryPermission) && (
          <View style={styles.footerContainer}>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => ImagePicker.openSettings()}
            >
              <MaterialIcons name="settings" size={20} color="#007AFF" />
              <Text style={styles.settingsText}>
                Enable permissions in settings
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    paddingTop: 60, // Increased top padding
    paddingBottom: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40, // Added more space at the top
    alignItems: 'center',
  },
  footerContainer: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  imageContainer: {
    width: width - 40,
    height: height * 0.4, // Made height relative to screen height
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 40, // Increased bottom margin
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
    resizeMode: 'cover',
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
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  settingsText: {
    color: '#007AFF',
    marginLeft: 5,
    fontSize: 16,
  },
});


export default ImagePickerComponent;