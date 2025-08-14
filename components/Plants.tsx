import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Site, Plant } from '../types';
import PlantCard from './PlantCard';

interface PlantsProps {
  sites: Site[];
}

const Plants: React.FC<PlantsProps> = ({ sites }) => {
  const getAllPlants = (): Plant[] => {
    return sites.flatMap(site => site.plants);
  };

  const plants = getAllPlants();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Plants</Text>
      </View>
      
      {plants.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No plants found</Text>
        </View>
      ) : (
        <View style={styles.plantsContainer}>
          {plants.map(plant => (
            <PlantCard
              key={plant.id}
              plant={plant}
              showSpecies={true}
              showCareSchedule={true}
            />
          ))}
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
    paddingTop: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
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

export default Plants;