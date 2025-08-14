import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Site, Plant } from '../types';
import { getPlantsNeedingCare } from '../utils/plantCareUtils';
import { colors } from '../assets/styles/colors';
import PlantCard from './PlantCard';

interface NeedCareProps {
  sites: Site[];
  onNavigateToSites: () => void;
  onNavigateToPlants: () => void;
}

const NeedCare: React.FC<NeedCareProps> = ({ sites, onNavigateToSites, onNavigateToPlants }) => {
  const plantsNeedingCare = getPlantsNeedingCare(sites);

  if (plantsNeedingCare.length === 0) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Need Care</Text>
        </View>
        
        <View style={styles.happyState}>
          <Text style={styles.happyText}>All plants are happy!!</Text>
          
          <View style={styles.ctaContainer}>
            <TouchableOpacity style={styles.ctaButton} onPress={onNavigateToSites}>
              <Text style={styles.ctaButtonText}>View Your Sites</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.ctaButton} onPress={onNavigateToPlants}>
              <Text style={styles.ctaButtonText}>View Your Plants</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Need Care</Text>
      </View>
      
      <View style={styles.plantsContainer}>
        {plantsNeedingCare.map(plant => (
          <PlantCard
            key={plant.id}
            plant={plant}
            showSpecies={false}
            showCareSchedule={true}
            showCareInfo={true}
          />
        ))}
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
    paddingTop: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  happyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 50,
  },
  happyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 40,
  },
  ctaContainer: {
    width: '100%',
    gap: 15,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  plantsContainer: {
    padding: 20,
  },
});

export default NeedCare;