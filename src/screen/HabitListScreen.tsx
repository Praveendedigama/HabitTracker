import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { TabParamList, Habit } from '../types';
import FlashlistBox from '../components/FlashlistBox';
import CustomButton from '../components/CustomButton';
import { StorageService } from '../services/storage';

type HabitListScreenNavigationProp = BottomTabNavigationProp<TabParamList, 'HabitList'>;

interface Props {
  navigation: HabitListScreenNavigationProp;
}

type FilterType = 'all' | 'today' | 'completed';

const HabitListScreen: React.FC<Props> = ({ navigation }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [filteredHabits, setFilteredHabits] = useState<Habit[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadHabits();
    }, [])
  );

  useEffect(() => {
    applyFilter();
  }, [habits, activeFilter]);

  const loadHabits = async () => {
    try {
      setLoading(true);
      const habitsData = await StorageService.getHabits();
      setHabits(habitsData);
    } catch (error) {
      console.error('Error loading habits:', error);
      Alert.alert('Error', 'Failed to load habits');
    } finally {
      setLoading(false);
    }
  };

  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const isHabitCompletedToday = (habit: Habit): boolean => {
    const today = getTodayString();
    return habit.completedDates.includes(today);
  };

  const applyFilter = () => {
    const today = getTodayString();
    
    switch (activeFilter) {
      case 'today':
        // Show daily habits for today
        setFilteredHabits(habits.filter(habit => habit.frequency === 'daily'));
        break;
      case 'completed':
        // Show habits completed today
        setFilteredHabits(habits.filter(habit => isHabitCompletedToday(habit)));
        break;
      default:
        // Show all habits
        setFilteredHabits(habits);
        break;
    }
  };

  const handleToggleComplete = async (habitId: string) => {
    try {
      const today = getTodayString();
      const habit = habits.find(h => h.id === habitId);
      
      if (!habit) return;

      const isCompleted = isHabitCompletedToday(habit);
      
      if (isCompleted) {
        await StorageService.markHabitIncomplete(habitId, today);
      } else {
        await StorageService.markHabitComplete(habitId, today);
      }
      
      await loadHabits();
    } catch (error) {
      console.error('Error toggling habit completion:', error);
      Alert.alert('Error', 'Failed to update habit');
    }
  };

  const handleDeleteHabit = (habitId: string, habitName: string) => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habitName}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteHabit(habitId);
              await loadHabits();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete habit');
            }
          },
        },
      ]
    );
  };

  const renderFilterButton = (filter: FilterType, title: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        activeFilter === filter && styles.activeFilterButton,
      ]}
      onPress={() => setActiveFilter(filter)}>
      <Text
        style={[
          styles.filterButtonText,
          activeFilter === filter && styles.activeFilterButtonText,
        ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderHabitItem = ({ item }: { item: Habit }) => (
    <View style={styles.habitItemContainer}>
      <FlashlistBox
        habit={item}
        isCompleted={isHabitCompletedToday(item)}
        onToggleComplete={handleToggleComplete}
      />
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteHabit(item.id, item.name)}>
        <Text style={styles.deleteButtonText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📝</Text>
      <Text style={styles.emptyTitle}>
        {activeFilter === 'all' && 'No habits yet'}
        {activeFilter === 'today' && 'No daily habits'}
        {activeFilter === 'completed' && 'No completed habits today'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeFilter === 'all' && 'Create your first habit to get started!'}
        {activeFilter === 'today' && 'Create some daily habits to track!'}
        {activeFilter === 'completed' && 'Complete some habits to see them here!'}
      </Text>
      {activeFilter === 'all' && (
        <CustomButton
          title="Add Your First Habit"
          onPress={() => navigation.navigate('AddHabit' as any)}
          style={styles.emptyButton}
        />
      )}
    </View>
  );

  const getFilterCounts = () => {
    const today = getTodayString();
    return {
      all: habits.length,
      today: habits.filter(h => h.frequency === 'daily').length,
      completed: habits.filter(h => isHabitCompletedToday(h)).length,
    };
  };

  const filterCounts = getFilterCounts();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Habits</Text>
        <CustomButton
          title="Add Habit"
          onPress={() => navigation.navigate('AddHabit' as any)}
          size="small"
          style={styles.addButton}
        />
      </View>

      <View style={styles.filterContainer}>
        {renderFilterButton('all', `All (${filterCounts.all})`)}
        {renderFilterButton('today', `Today (${filterCounts.today})`)}
        {renderFilterButton('completed', `Done (${filterCounts.completed})`)}
      </View>

      <FlatList
        data={filteredHabits}
        renderItem={renderHabitItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        refreshing={loading}
        onRefresh={loadHabits}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
  },
  addButton: {
    paddingHorizontal: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingBottom: 20,
  },
  habitItemContainer: {
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 24,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyButton: {
    marginTop: 16,
  },
});

export default HabitListScreen;