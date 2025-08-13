import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Site, CareLog, Plant } from '../types';
import { storageService } from '../api/storage';
import { getPlantsNeedingCareCount } from '../utils/plantCareUtils';
import { RootStackParamList } from '../navigation/AppNavigator';
import Sites from '../components/Sites';
import Plants from '../components/Plants';
import NeedCare from '../components/NeedCare';
import AddSite from '../components/AddSite';
import AddPlant from '../components/AddPlant';
import { colors } from '../assets/styles/colors';

type TabType = 'need-care' | 'sites' | 'plants';
type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface HomeProps {
  navigation: HomeNavigationProp;
}

const Home: React.FC<HomeProps> = ({ navigation }) => {
  const [sites, setSites] = useState<Site[]>([]);
  const [careLogs, setCareLogs] = useState<CareLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabType>('need-care');
  const [showAddMenu, setShowAddMenu] = useState<boolean>(false);
  const [showAddSiteModal, setShowAddSiteModal] = useState<boolean>(false);
  const [showAddPlantModal, setShowAddPlantModal] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Set default page based on plants needing care
    if (!loading && sites.length > 0) {
      const plantsNeedingCareCount = getPlantsNeedingCareCount(sites);
      if (plantsNeedingCareCount === 0) {
        setActiveTab('sites');
      } else {
        setActiveTab('need-care');
      }
    }
  }, [loading, sites]);

  const loadData = async (): Promise<void> => {
    try {
      setLoading(true);
      await storageService.initializeDefaultData();
      
      const savedSites = await storageService.sites.get();
      const savedCareLogs = await storageService.careLogs.get();
      
      setSites(savedSites || []);
      setCareLogs(savedCareLogs || []);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getTotalPlants = (): number => {
    return sites.reduce((total, site) => total + site.plants.length, 0);
  };

  const handleSitePress = (siteId: string) => {
    navigation.navigate('SiteDetails', { siteId });
  };

  const toggleAddMenu = () => {
    setShowAddMenu(!showAddMenu);
  };

  const handleAddSite = () => {
    setShowAddMenu(false);
    setShowAddSiteModal(true);
  };

  const handleAddPlant = () => {
    setShowAddMenu(false);
    setShowAddPlantModal(true);
  };

  const handleSaveNewSite = async (siteData: Omit<Site, 'id' | 'plants' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newSite: Site = {
        ...siteData,
        id: `site-${Date.now()}`,
        plants: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedSites = [...sites, newSite];
      await storageService.sites.set(updatedSites);
      setSites(updatedSites);
      
      // Switch to sites tab to show the new site
      setActiveTab('sites');
      
      Alert.alert('Success', 'Site added successfully!');
    } catch (error) {
      console.error('Error saving site:', error);
      Alert.alert('Error', 'Failed to save site. Please try again.');
    }
  };

  const handleSaveNewPlant = async (plantData: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Check if this is an update (if plant data has all required fields for an existing plant)
      const isUpdate = sites.some(site => 
        site.plants.some(plant => 
          plant.name === plantData.name && 
          plant.siteId === plantData.siteId &&
          plant.species === plantData.species
        )
      );

      if (isUpdate) {
        // Find and update existing plant
        const updatedSites = sites.map(site => ({
          ...site,
          plants: site.plants.map(plant => {
            if (plant.name === plantData.name && 
                plant.siteId === plantData.siteId &&
                plant.species === plantData.species) {
              return {
                ...plant,
                ...plantData,
                updatedAt: new Date(),
              };
            }
            return plant;
          }),
          updatedAt: new Date(),
        }));

        await storageService.sites.set(updatedSites);
        setSites(updatedSites);
        
        Alert.alert('Success', 'Plant updated successfully!');
      } else {
        // Add new plant
        const newPlant: Plant = {
          ...plantData,
          id: `plant-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Find the site and add the plant to it
        const updatedSites = sites.map(site => {
          if (site.id === plantData.siteId) {
            return {
              ...site,
              plants: [...site.plants, newPlant],
              updatedAt: new Date(),
            };
          }
          return site;
        });

        await storageService.sites.set(updatedSites);
        setSites(updatedSites);
        
        // Switch to plants tab to show the new plant
        setActiveTab('plants');
        
        Alert.alert('Success', 'Plant added successfully!');
      }
    } catch (error) {
      console.error('Error saving plant:', error);
      Alert.alert('Error', 'Failed to save plant. Please try again.');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'sites':
        return <Sites sites={sites} onSitePress={handleSitePress} />;
      case 'plants':
        return <Plants sites={sites} onPlantUpdate={handleSaveNewPlant} />;
      case 'need-care':
        return (
          <NeedCare 
            sites={sites} 
            onNavigateToSites={() => setActiveTab('sites')}
            onNavigateToPlants={() => setActiveTab('plants')}
            onPlantUpdate={handleSaveNewPlant}
          />
        );
      default:
        return <NeedCare sites={sites} onNavigateToSites={() => setActiveTab('sites')} onNavigateToPlants={() => setActiveTab('plants')} onPlantUpdate={handleSaveNewPlant} />;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>PlantTime</Text>
        <Text style={styles.subtitle}>Your Plant Care Companion</Text>
      </View>

      <View style={styles.topNav}>
        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'sites' && styles.activeNavItem]} 
          onPress={() => setActiveTab('sites')}
        >
          <Text style={[styles.navNumber, activeTab === 'sites' && styles.activeNavNumber]}>
            {sites.length}
          </Text>
          <Text style={[styles.navLabel, activeTab === 'sites' && styles.activeNavLabel]}>
            Sites
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'plants' && styles.activeNavItem]} 
          onPress={() => setActiveTab('plants')}
        >
          <Text style={[styles.navNumber, activeTab === 'plants' && styles.activeNavNumber]}>
            {getTotalPlants()}
          </Text>
          <Text style={[styles.navLabel, activeTab === 'plants' && styles.activeNavLabel]}>
            Plants
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'need-care' && styles.activeWarningNavItem]} 
          onPress={() => setActiveTab('need-care')}
        >
          <Text style={[styles.navNumber, styles.warningNavNumber, activeTab === 'need-care' && styles.activeWarningNavNumber]}>
            {getPlantsNeedingCareCount(sites)}
          </Text>
          <Text style={[styles.navLabel, styles.warningNavLabel, activeTab === 'need-care' && styles.activeWarningNavLabel]}>
            Need Care
          </Text>
        </TouchableOpacity>
      </View>

      {renderContent()}

      {/* Floating Add Menu */}
      {showAddMenu && (
        <View style={styles.addMenuContainer}>
          <TouchableOpacity style={styles.addMenuItem} onPress={handleAddSite}>
            <Text style={styles.addMenuText}>Add Site</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.addMenuItem, styles.lastMenuItem]} onPress={handleAddPlant}>
            <Text style={styles.addMenuText}>Add Plant</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={toggleAddMenu}>
        <Text style={styles.addButtonText}>{showAddMenu ? '×' : '+'}</Text>
      </TouchableOpacity>

      {/* Add Site Modal */}
      <AddSite
        visible={showAddSiteModal}
        onClose={() => setShowAddSiteModal(false)}
        onSave={handleSaveNewSite}
      />

      {/* Add Plant Modal */}
      <AddPlant
        visible={showAddPlantModal}
        onClose={() => setShowAddPlantModal(false)}
        onSave={handleSaveNewPlant}
        sites={sites}
      />
    </View>
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
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginTop: -20,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
  },
  activeNavItem: {
    backgroundColor: '#e8f5e8',
  },
  navNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  activeNavNumber: {
    color: '#2e7d32',
  },
  navLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  activeNavLabel: {
    color: '#2e7d32',
    fontWeight: '600',
  },
  warningNavItem: {
    backgroundColor: '#fff3cd',
  },
  activeWarningNavItem: {
    backgroundColor: '#ffeaa7',
  },
  warningNavNumber: {
    color: '#856404',
  },
  activeWarningNavNumber: {
    color: '#6c5ce7',
  },
  warningNavLabel: {
    color: '#856404',
  },
  activeWarningNavLabel: {
    color: '#6c5ce7',
    fontWeight: '600',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  addMenuContainer: {
    position: 'absolute',
    bottom: 100,
    right: 30,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    minWidth: 140,
  },
  addMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  addMenuText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
});

export default Home;