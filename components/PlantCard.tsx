import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Plant, Site } from '../types';
import AddPlant from './AddPlant';

interface PlantCareInfo {
  needsWater?: boolean;
  needsFertilizer?: boolean;
  statusText?: string | null;
}

interface PlantCardProps {
  plant: Plant;
  careInfo?: PlantCareInfo;
  showEditIcon?: boolean;
  sites?: Site[];
  onPlantUpdate?: (plantData: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>) => void;
  additionalInfo?: string;
}

const PlantCard: React.FC<PlantCardProps> = ({ 
  plant, 
  careInfo = {}, 
  showEditIcon = false,
  sites = [],
  onPlantUpdate,
  additionalInfo 
}) => {
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleSaveEdit = (plantData: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (onPlantUpdate) {
      onPlantUpdate(plantData);
    }
    setShowEditModal(false);
  };

  return (
    <View style={styles.plantCard}>
      <View style={styles.header}>
        <View style={styles.plantInfo}>
          <Text style={styles.plantName}>{plant.name}</Text>
          <Text style={styles.plantSpecies}>{plant.species}</Text>
        </View>
        {showEditIcon && (
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.editIcon}>✎</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.careNeeds}>
        {careInfo.needsWater && (
          <View style={styles.careTag}>
            <Text style={styles.careTagText}>Needs Water</Text>
          </View>
        )}
        {careInfo.needsFertilizer && (
          <View style={styles.careTag}>
            <Text style={styles.careTagText}>Needs Fertilizer</Text>
          </View>
        )}
        {careInfo.statusText && !careInfo.needsWater && !careInfo.needsFertilizer && (
          <Text style={styles.plantCareStatus}>{careInfo.statusText}</Text>
        )}
        {additionalInfo && (
          <Text style={styles.additionalInfo}>{additionalInfo}</Text>
        )}
      </View>

      {showEditModal && (
        <AddPlant
          visible={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
          sites={sites}
          editingPlant={plant}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  plantCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  plantInfo: {
    flex: 1,
  },
  plantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  plantSpecies: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  editButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    minWidth: 24,
    minHeight: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    fontSize: 12,
    color: '#333',
    fontWeight: 'bold',
  },
  careNeeds: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  careTag: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  careTagText: {
    color: '#856404',
    fontSize: 12,
    fontWeight: '500',
  },
  plantCareStatus: {
    fontSize: 14,
    color: '#666',
  },
  additionalInfo: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
});

export default PlantCard;