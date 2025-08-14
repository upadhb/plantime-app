import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plant } from '../types';
import { getDaysDifference } from '../utils/plantCareUtils';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface PlantCardProps {
  plant: Plant;
  showSpecies?: boolean;
  showCareSchedule?: boolean;
  showCareInfo?: boolean;
}

const PlantCard: React.FC<PlantCardProps> = ({ 
  plant, 
  showSpecies = false,
  showCareSchedule = false,
  showCareInfo = false,
}) => {
  const navigation = useNavigation<NavigationProp>();

  const handlePlantPress = () => {
    navigation.navigate('PlantDetails', { plantId: plant.id });
  };

  const getCareInfo = () => {
    if (!showCareInfo) return null;
    
    const today = new Date();
    const careItems = [];

    // Check for water
    if (plant.lastWatered) {
      const lastWateredDate = new Date(plant.lastWatered);
      const daysSinceWatered = getDaysDifference(today, lastWateredDate);
      if (daysSinceWatered >= 0) {
        careItems.push({
          type: 'water',
          days: daysSinceWatered,
          needsCare: daysSinceWatered >= plant.wateringSchedule.frequency
        });
      }
    } else {
      careItems.push({
        type: 'water',
        days: 0,
        needsCare: true
      });
    }

    // Check for fertilizer
    if (plant.fertilizingSchedule.isActive) {
      if (plant.lastFertilized) {
        const lastFertilizedDate = new Date(plant.lastFertilized);
        const daysSinceFertilized = getDaysDifference(today, lastFertilizedDate);
        if (daysSinceFertilized >= 0) {
          careItems.push({
            type: 'fertilizer',
            days: daysSinceFertilized,
            needsCare: daysSinceFertilized >= plant.fertilizingSchedule.frequency
          });
        }
      } else {
        careItems.push({
          type: 'fertilizer',
          days: 0,
          needsCare: true
        });
      }
    }

    return careItems.filter(item => item.needsCare);
  };

  const handleCareBlockPress = (careType: string, days: number) => {
    console.log(`Care block pressed: ${careType}, days passed: ${days}`);
  };

  const careInfo = getCareInfo();

  return (
    <TouchableOpacity style={styles.plantCard} onPress={handlePlantPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.plantInfo}>
          <Text style={styles.plantName} numberOfLines={1} ellipsizeMode="tail">
            {plant.name}
          </Text>
          {showSpecies && (
            <Text style={styles.plantSpecies}>
              {plant.species || 'Unknown species'}
            </Text>
          )}
          {showCareSchedule && (
            <View style={styles.careScheduleContainer}>
              <View style={styles.scheduleItem}>
                <FontAwesome5 name="hand-holding-water" size={12} color="#2196F3" style={styles.scheduleIcon} />
                <Text style={styles.scheduleText}>
                  Water every {plant.wateringSchedule.frequency} days
                </Text>
              </View>
              {plant.fertilizingSchedule.isActive && (
                <View style={styles.scheduleItem}>
                  <MaterialCommunityIcons name="format-color-fill" size={12} color="#FF8C00" style={styles.scheduleIcon} />
                  <Text style={styles.scheduleText}>
                    Fertilize every {plant.fertilizingSchedule.frequency} days
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
        {careInfo && careInfo.length > 0 && (
          <View style={styles.careBlocksContainer}>
            {careInfo.map((care, index) => (
              <TouchableOpacity
                key={`${care.type}-${index}`}
                style={styles.careBlock}
                onPress={(e) => {
                  e.stopPropagation();
                  handleCareBlockPress(care.type, care.days);
                }}
              >
                {care.type === 'water' ? (
                  <FontAwesome5 name="hand-holding-water" size={30} color="#87CEEB" />
                ) : (
                  <MaterialCommunityIcons name="format-color-fill" size={30} color="#FFB366" />
                )}
                <Text style={styles.careBlockText}>-{care.days} {care.days > 1 ? 'days' : 'day'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
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
    fontSize: 11,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  careScheduleContainer: {
    marginTop: 8,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  scheduleIcon: {
    marginRight: 6,
  },
  scheduleText: {
    fontSize: 12,
    color: '#666',
  },
  careBlocksContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  careBlock: {
    width: 46,
    height: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  careBlockText: {
    fontSize: 8,
    color: '#FF0000',
    fontWeight: '500',
    marginTop: 1,
  },
});

export default PlantCard;