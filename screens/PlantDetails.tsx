import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { Site, Plant } from '../types';
import { storageService } from '../api/storage';
import { colors } from '../assets/styles/colors';
import AddPlant from '../components/AddPlant';
import { RootStackParamList } from '../navigation/AppNavigator';

type PlantDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PlantDetails'>;
type PlantDetailsRouteProp = RouteProp<RootStackParamList, 'PlantDetails'>;

interface PlantDetailsProps {
  navigation: PlantDetailsNavigationProp;
  route: PlantDetailsRouteProp;
}

const PlantDetails: React.FC<PlantDetailsProps> = ({ navigation, route }) => {
  const [plant, setPlant] = useState<Plant | null>(null);
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showEditForm, setShowEditForm] = useState<boolean>(false);
  const [sites, setSites] = useState<Site[]>([]);

  useEffect(() => {
    loadPlant();
  }, []);

  const loadPlant = async () => {
    try {
      const allSites = await storageService.sites.get();
      setSites(allSites || []);
      
      if (allSites) {
        // Find the plant and its site
        let foundPlant: Plant | null = null;
        let foundSite: Site | null = null;

        for (const s of allSites) {
          const p = s.plants.find(plant => plant.id === route.params.plantId);
          if (p) {
            foundPlant = p;
            foundSite = s;
            break;
          }
        }

        setPlant(foundPlant);
        setSite(foundSite);
      }
    } catch (error) {
      console.error('Error loading plant:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setShowEditForm(true);
  };

  const handleSaveEdit = async (plantData: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!plant || !site) return;

    try {
      const updatedPlant: Plant = {
        ...plant,
        ...plantData,
        updatedAt: new Date(),
      };

      const updatedSites = sites.map(s => {
        if (s.id === site.id) {
          return {
            ...s,
            plants: s.plants.map(p => p.id === plant.id ? updatedPlant : p),
          };
        }
        return s;
      });

      await storageService.sites.set(updatedSites);
      setPlant(updatedPlant);
      setShowEditForm(false);
      
      // Reload to get fresh data
      loadPlant();
    } catch (error) {
      console.error('Error updating plant:', error);
    }
  };

  const formatDate = (date: Date | undefined | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleImagePress = () => {
    setShowEditForm(true);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!plant || !site) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Plant Not Found</Text>
        </View>
      </View>
    );
  }

  if (showEditForm) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowEditForm(false)} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Edit {plant.name}</Text>
        </View>
        <View style={styles.editFormContainer}>
          <AddPlant
            visible={true}
            onClose={() => setShowEditForm(false)}
            onSave={handleSaveEdit}
            sites={sites}
            editingPlant={plant}
            embedded={true}
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{plant.name}</Text>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.editIcon}>✎</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {/* Top section with info and image */}
        <View style={styles.topSection}>
          <View style={styles.leftInfo}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Site</Text>
              <Text style={styles.infoValue}>{site.name}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Planted</Text>
              <Text style={styles.infoValue}>{formatDate(plant.createdAt)}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Care Schedule</Text>
              <View style={styles.scheduleContainer}>
                <View style={styles.scheduleItem}>
                  <FontAwesome5 name="hand-holding-water" size={14} color="#2196F3" />
                  <Text style={styles.scheduleText}>
                    Every {plant.wateringSchedule.frequency} days
                  </Text>
                </View>
                {plant.fertilizingSchedule.isActive && (
                  <View style={styles.scheduleItem}>
                    <MaterialCommunityIcons name="format-color-fill" size={14} color="#FF8C00" />
                    <Text style={styles.scheduleText}>
                      Every {plant.fertilizingSchedule.frequency} days
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.imageContainer} onPress={handleImagePress}>
            {plant.imageUri ? (
              <Image source={{ uri: plant.imageUri }} style={styles.plantImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.addImageText}>Add Image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Care history section */}
        <View style={styles.careHistorySection}>
          <View style={styles.careItem}>
            <View style={styles.careItemHeader}>
              <FontAwesome5 name="hand-holding-water" size={16} color="#2196F3" />
              <Text style={styles.careItemTitle}>Last Watered</Text>
            </View>
            <Text style={styles.careItemValue}>{formatDate(plant.lastWatered)}</Text>
          </View>

          {plant.fertilizingSchedule.isActive && (
            <View style={styles.careItem}>
              <View style={styles.careItemHeader}>
                <MaterialCommunityIcons name="format-color-fill" size={16} color="#FF8C00" />
                <Text style={styles.careItemTitle}>Last Fertilized</Text>
              </View>
              <Text style={styles.careItemValue}>{formatDate(plant.lastFertilized)}</Text>
            </View>
          )}
        </View>

        {/* Details section */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Details</Text>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Species</Text>
            <Text style={styles.detailValue}>{plant.species || 'Unknown species'}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>{site.location}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Sun Exposure</Text>
            <Text style={styles.detailValue}>
              {site.sunExposure.replace('_', ' ').charAt(0).toUpperCase() + site.sunExposure.slice(1).replace('_', ' ')}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: colors.primary,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  editButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  topSection: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  leftInfo: {
    flex: 1,
    marginRight: 15,
  },
  infoItem: {
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  scheduleContainer: {
    marginTop: 4,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  scheduleText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  imageContainer: {
    width: 120,
    height: 120,
  },
  plantImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
  careHistorySection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  careItem: {
    marginBottom: 15,
  },
  careItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  careItemTitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  careItemValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  detailsSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
    color: '#666',
  },
  editFormContainer: {
    flex: 1,
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 20,
  },
});

export default PlantDetails;