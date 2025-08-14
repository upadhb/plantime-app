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
          {sortedPlants.map(plant => (
            <PlantCard
              key={plant.id}
              plant={plant}
              showSpecies={false}
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