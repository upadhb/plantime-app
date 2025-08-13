import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Site, Plant } from '../types';
import { getPlantsNeedingCare, getDaysDifference } from '../utils/plantCareUtils';
import { RootStackParamList } from '../navigation/AppNavigator';
import { storageService } from '../api/storage';
import { colors } from '../assets/styles/colors';
import PlantCard from '../components/PlantCard';

type SiteDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SiteDetails'>;
type SiteDetailsRouteProp = RouteProp<RootStackParamList, 'SiteDetails'>;

interface SiteDetailsProps {
  navigation: SiteDetailsNavigationProp;
  route: SiteDetailsRouteProp;
}

const SiteDetails: React.FC<SiteDetailsProps> = ({ navigation, route }) => {
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadSite();
  }, []);

  const loadSite = async () => {
    try {
      const sites = await storageService.sites.get();
      const foundSite = sites?.find(s => s.id === route.params.siteId);
      setSite(foundSite || null);
    } catch (error) {
      console.error('Error loading site:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!site) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Site Not Found</Text>
        </View>
      </View>
    );
  }
  const getPlantCareInfo = (plant: Plant) => {
    const plantsNeedingCare = getPlantsNeedingCare([{ ...site, plants: [plant] }]);
    const plantWithCareInfo = plantsNeedingCare.find(p => p.id === plant.id);
    
    if (plantWithCareInfo) {
      return {
        needsWater: plantWithCareInfo.needsWater,
        needsFertilizer: plantWithCareInfo.needsFertilizer,
        statusText: null
      };
    }
    
    // Calculate next care dates using day-only comparison
    const today = new Date();
    const upcomingCare = [];
    
    if (plant.lastWatered) {
      const lastWateredDate = new Date(plant.lastWatered);
      const daysSinceWatered = getDaysDifference(today, lastWateredDate);
      const daysUntilWatering = plant.wateringSchedule.frequency - daysSinceWatered;
      upcomingCare.push({ daysUntil: daysUntilWatering, type: 'water' });
    } else {
      upcomingCare.push({ daysUntil: 0, type: 'water' }); // Never watered
    }
    
    if (plant.fertilizingSchedule.isActive) {
      if (plant.lastFertilized) {
        const lastFertilizedDate = new Date(plant.lastFertilized);
        const daysSinceFertilized = getDaysDifference(today, lastFertilizedDate);
        const daysUntilFertilizing = plant.fertilizingSchedule.frequency - daysSinceFertilized;
        upcomingCare.push({ daysUntil: daysUntilFertilizing, type: 'fertilizer' });
      } else {
        upcomingCare.push({ daysUntil: 0, type: 'fertilizer' }); // Never fertilized
      }
    }
    
    if (upcomingCare.length === 0) {
      return { needsWater: false, needsFertilizer: false, statusText: 'Water needed' };
    }
    
    // Sort by days until care needed (most urgent first)
    upcomingCare.sort((a, b) => a.daysUntil - b.daysUntil);
    const nextCare = upcomingCare[0];
    
    let statusText = '';
    if (isNaN(nextCare.daysUntil)) {
      statusText = 'Care schedule unavailable';
    } else if (nextCare.daysUntil <= 0) {
      statusText = `${nextCare.type} overdue`;
    } else if (nextCare.daysUntil === 1) {
      statusText = `${nextCare.type} tomorrow`;
    } else {
      statusText = `${nextCare.type} in ${nextCare.daysUntil} days`;
    }
    
    return { needsWater: false, needsFertilizer: false, statusText };
  };

  const sortedPlants = [...site.plants].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{site.name}</Text>
      </View>
      
      {sortedPlants.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No plants in this site</Text>
        </View>
      ) : (
        <View style={styles.plantsContainer}>
          {sortedPlants.map(plant => {
            const careInfo = getPlantCareInfo(plant);
            return (
              <PlantCard
                key={plant.id}
                plant={plant}
                careInfo={careInfo}
                showEditIcon={true}
                sites={[site]}
                onPlantUpdate={(plantData) => {
                  // TODO: Implement plant update functionality for SiteDetails
                  console.log('Update plant:', plantData.name);
                  // For now, we'll focus on the main Home screen edit functionality
                }}
              />
            );
          })}
        </View>
      )}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'left',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  plantsContainer: {
    padding: 20,
  },
});

export default SiteDetails;