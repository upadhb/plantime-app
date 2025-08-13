import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Site } from '../types';
import { getSunExposureLabel } from '../utils/app.const';
import { colors } from '../assets/styles/colors';

interface SitesProps {
  sites: Site[];
  onSitePress?: (siteId: string) => void;
}

const Sites: React.FC<SitesProps> = ({ sites, onSitePress }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Sites</Text>
      </View>
      
      {sites.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No sites found</Text>
        </View>
      ) : (
        <View style={styles.sitesContainer}>
          {sites.map(site => (
            <TouchableOpacity 
              key={site.id} 
              style={styles.siteCard}
              onPress={() => onSitePress?.(site.id)}
            >
              <View style={styles.siteCardContent}>
                <View style={styles.siteInfo}>
                  <Text style={styles.siteName}>{site.name}</Text>
                  <Text style={styles.siteLocation}>{site.location}</Text>
                  <Text style={styles.siteDetails}>
                    {getSunExposureLabel(site.sunExposure)}
                  </Text>
                </View>
                <View style={styles.plantCountBadge}>
                  <Text style={styles.plantCountText}>{site.plants.length}</Text>
                </View>
              </View>
            </TouchableOpacity>
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
  sitesContainer: {
    padding: 20,
  },
  siteCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  siteCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  siteInfo: {
    flex: 1,
  },
  siteName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  siteLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  siteDetails: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  plantCountBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  plantCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default Sites;