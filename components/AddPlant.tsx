import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Plant, Site } from '../types';
import { colors } from '../assets/styles/colors';

interface AddPlantProps {
  visible: boolean;
  onClose: () => void;
  onSave: (plantData: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>) => void;
  sites: Site[];
  editingPlant?: Plant | null;
}

const AddPlant: React.FC<AddPlantProps> = ({ visible, onClose, onSave, sites, editingPlant = null }) => {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [plantedDate, setPlantedDate] = useState<Date | null>(null);
  const [wateringSchedule, setWateringSchedule] = useState('');
  const [fertilizingSchedule, setFertilizingSchedule] = useState('');
  const [lastWatered, setLastWatered] = useState<Date | null>(null);
  const [lastFertilized, setLastFertilized] = useState<Date | null>(null);
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState<{
    field: 'plantedDate' | 'lastWatered' | 'lastFertilized' | null;
    visible: boolean;
  }>({ field: null, visible: false });
  const [showSiteDropdown, setShowSiteDropdown] = useState(false);

  useEffect(() => {
    if (editingPlant) {
      setName(editingPlant.name);
      setSpecies(editingPlant.species || '');
      setPlantedDate(editingPlant.plantedDate ? new Date(editingPlant.plantedDate) : null);
      setWateringSchedule(editingPlant.wateringSchedule.frequency.toString());
      setFertilizingSchedule(editingPlant.fertilizingSchedule.frequency.toString());
      setLastWatered(editingPlant.lastWatered ? new Date(editingPlant.lastWatered) : null);
      setLastFertilized(editingPlant.lastFertilized ? new Date(editingPlant.lastFertilized) : null);
      setImageUri(editingPlant.imageUri);
      setSelectedSiteId(editingPlant.siteId);
    } else {
      resetForm();
    }
  }, [editingPlant, visible]);

  const resetForm = () => {
    setName('');
    setSpecies('');
    setPlantedDate(null);
    setWateringSchedule('');
    setFertilizingSchedule('');
    setLastWatered(null);
    setLastFertilized(null);
    setImageUri(undefined);
    setSelectedSiteId('');
    setShowDatePicker({ field: null, visible: false });
    setShowSiteDropdown(false);
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const handleSave = () => {
    if (!name.trim() || !wateringSchedule.trim() || !fertilizingSchedule.trim() || !selectedSiteId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const wateringFreq = parseInt(wateringSchedule);
    const fertilizingFreq = parseInt(fertilizingSchedule);

    if (isNaN(wateringFreq) || wateringFreq <= 0) {
      Alert.alert('Error', 'Please enter a valid watering schedule (number of days)');
      return;
    }

    if (isNaN(fertilizingFreq) || fertilizingFreq <= 0) {
      Alert.alert('Error', 'Please enter a valid fertilizing schedule (number of days)');
      return;
    }

    const plantData: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'> = {
      name: name.trim(),
      species: species.trim() || undefined,
      plantedDate: plantedDate || undefined,
      siteId: selectedSiteId,
      imageUri,
      wateringSchedule: {
        frequency: wateringFreq,
        isActive: true,
      },
      fertilizingSchedule: {
        frequency: fertilizingFreq,
        isActive: true,
      },
      lastWatered: lastWatered || undefined,
      lastFertilized: lastFertilized || undefined,
    };

    onSave(plantData);
    resetForm();
    onClose();
  };

  const isFormValid = () => {
    return (
      name.trim().length > 0 &&
      wateringSchedule.trim().length > 0 &&
      fertilizingSchedule.trim().length > 0 &&
      selectedSiteId.length > 0
    );
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Select date';
    return date.toLocaleDateString();
  };

  const handleDateSelect = (field: 'plantedDate' | 'lastWatered' | 'lastFertilized') => {
    setShowDatePicker({ field, visible: true });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker({ field: null, visible: false });
    }
    
    if (selectedDate && showDatePicker.field) {
      switch (showDatePicker.field) {
        case 'plantedDate':
          setPlantedDate(selectedDate);
          break;
        case 'lastWatered':
          setLastWatered(selectedDate);
          break;
        case 'lastFertilized':
          setLastFertilized(selectedDate);
          break;
      }
    }

    if (Platform.OS === 'ios') {
      // On iOS, we'll handle the done button separately
    }
  };

  const handleDatePickerDone = () => {
    setShowDatePicker({ field: null, visible: false });
  };

  const handleImageSelect = () => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        { text: 'Camera', onPress: () => openCamera() },
        { text: 'Photo Library', onPress: () => openImageLibrary() },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Camera permission is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const openImageLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Photo library permission is required to select photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const removeImage = () => {
    setImageUri(undefined);
  };

  const selectedSite = sites.find(site => site.id === selectedSiteId);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {editingPlant ? 'Edit Plant' : 'Add a new Plant'}
            </Text>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.nameImageRow}>
              <View style={styles.nameContainer}>
                <Text style={styles.label}>
                  Name <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter plant name"
                  maxLength={50}
                />
              </View>

              <View style={styles.imageContainer}>
                <TouchableOpacity
                  style={styles.imagePicker}
                  onPress={handleImageSelect}
                >
                  {imageUri ? (
                    <View style={styles.imagePreviewContainer}>
                      <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                      <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                        <Text style={styles.removeImageText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.imagePickerPlaceholder}>
                      <Text style={styles.imagePickerText}>📷</Text>
                      <Text style={styles.imagePickerSubtext}>Add Photo</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Site <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowSiteDropdown(!showSiteDropdown)}
              >
                <Text style={styles.dropdownText}>
                  {selectedSite ? selectedSite.name : 'Select a site'}
                </Text>
                <Text style={styles.dropdownArrow}>
                  {showSiteDropdown ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>

              {showSiteDropdown && (
                <View style={styles.dropdownOptions}>
                  {sites.map((site) => (
                    <TouchableOpacity
                      key={site.id}
                      style={[
                        styles.dropdownOption,
                        selectedSiteId === site.id && styles.selectedOption,
                      ]}
                      onPress={() => {
                        setSelectedSiteId(site.id);
                        setShowSiteDropdown(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownOptionText,
                          selectedSiteId === site.id && styles.selectedOptionText,
                        ]}
                      >
                        {site.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Species</Text>
              <TextInput
                style={styles.input}
                value={species}
                onChangeText={setSpecies}
                placeholder="Enter species (optional)"
                maxLength={50}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Planted Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => handleDateSelect('plantedDate')}
              >
                <Text style={[styles.dateText, !plantedDate && styles.placeholderText]}>
                  {formatDate(plantedDate)}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Watering Schedule (days) <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={wateringSchedule}
                onChangeText={setWateringSchedule}
                placeholder="How often to water (e.g., 7)"
                keyboardType="numeric"
                maxLength={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Fertilizing Schedule (days) <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={fertilizingSchedule}
                onChangeText={setFertilizingSchedule}
                placeholder="How often to fertilize (e.g., 30)"
                keyboardType="numeric"
                maxLength={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Watered</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => handleDateSelect('lastWatered')}
              >
                <Text style={[styles.dateText, !lastWatered && styles.placeholderText]}>
                  {formatDate(lastWatered)}
                </Text>
              </TouchableOpacity>
              {lastWatered && (
                <TouchableOpacity
                  style={styles.clearDateButton}
                  onPress={() => setLastWatered(null)}
                >
                  <Text style={styles.clearDateText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Fertilized</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => handleDateSelect('lastFertilized')}
              >
                <Text style={[styles.dateText, !lastFertilized && styles.placeholderText]}>
                  {formatDate(lastFertilized)}
                </Text>
              </TouchableOpacity>
              {lastFertilized && (
                <TouchableOpacity
                  style={styles.clearDateButton}
                  onPress={() => setLastFertilized(null)}
                >
                  <Text style={styles.clearDateText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveButton,
                !isFormValid() && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!isFormValid()}
            >
              <Text
                style={[
                  styles.saveButtonText,
                  !isFormValid() && styles.saveButtonTextDisabled,
                ]}
              >
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {showDatePicker.visible && showDatePicker.field && (
        <>
          {Platform.OS === 'ios' && (
            <Modal transparent animationType="slide">
              <View style={styles.datePickerOverlay}>
                <View style={styles.datePickerContainer}>
                  <View style={styles.datePickerHeader}>
                    <TouchableOpacity onPress={handleDatePickerDone}>
                      <Text style={styles.datePickerDoneText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={
                      showDatePicker.field === 'plantedDate' ? plantedDate || new Date() :
                      showDatePicker.field === 'lastWatered' ? lastWatered || new Date() :
                      lastFertilized || new Date()
                    }
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                  />
                </View>
              </View>
            </Modal>
          )}
          {Platform.OS === 'android' && (
            <DateTimePicker
              value={
                showDatePicker.field === 'plantedDate' ? plantedDate || new Date() :
                showDatePicker.field === 'lastWatered' ? lastWatered || new Date() :
                lastFertilized || new Date()
              }
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  nameImageRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 15,
  },
  nameContainer: {
    flex: 1,
  },
  imageContainer: {
    width: 80,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#e74c3c',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  imagePicker: {
    width: 80,
    height: 80,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  imagePreviewContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 16,
  },
  imagePickerPlaceholder: {
    alignItems: 'center',
  },
  imagePickerText: {
    fontSize: 24,
    marginBottom: 4,
  },
  imagePickerSubtext: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
  },
  dropdownOptions: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedOption: {
    backgroundColor: '#e8f5e8',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: '#2e7d32',
    fontWeight: '600',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  clearDateButton: {
    marginTop: 5,
    alignSelf: 'flex-start',
  },
  clearDateText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: '#999',
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  datePickerDoneText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddPlant;