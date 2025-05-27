import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { TabParamList, Habit } from '../types';
import { StorageService } from '../services/storage';

type ProgressScreenNavigationProp = BottomTabNavigationProp<TabParamList, 'Progress'>;

interface Props {
  navigation: ProgressScreenNavigationProp;
}

interface DayProgress {
  date: string;
  completed: number;
  total: number;
  percentage: number;
}

const ProgressScreen: React.FC<Props> = ({ navigation }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState<DayProgress[]>([]);
  const [overallStats, setOverallStats] = useState({
    totalHabits: 0,
    completedToday: 0,
    todayPercentage: 0,
    weeklyAverage: 0,
    longestStreak: 0,
  });

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const habitsData = await StorageService.getHabits();
      setHabits(habitsData);
      calculateProgress(habitsData);
    } catch (error) {
      console.error('Error loading progress data:', error);
    }
  };

  const calculateProgress = (habitsData: Habit[]) => {
    const dailyHabits = habitsData.filter(habit => habit.frequency === 'daily');
    const today = new Date();
    
    // Calculate weekly progress
    const weeklyData: DayProgress[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const completedCount = dailyHabits.filter(habit =>
        habit.completedDates.includes(dateString)
      ).length;
      
      const total = dailyHabits.length;
      const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;
      
      weeklyData.push({
        date: dateString,
        completed: completedCount,
        total,
        percentage,
      });
    }
    
    setWeeklyProgress(weeklyData);
    
    // Calculate overall stats
    const todayString = today.toISOString().split('T')[0];
    const completedToday = dailyHabits.filter(habit =>
      habit.completedDates.includes(todayString)
    ).length;
    
    const todayPercentage = dailyHabits.length > 0 
      ? Math.round((completedToday / dailyHabits.length) * 100) 
      : 0;
    
    const weeklyAverage = weeklyData.length > 0
      ? Math.round(weeklyData.reduce((sum, day) => sum + day.percentage, 0) / weeklyData.length)
      : 0;
    
    // Calculate longest streak for any habit
    const longestStreak = Math.max(
      0,
      ...dailyHabits.map(habit => calculateHabitStreak(habit))
    );
    
    setOverallStats({
      totalHabits: habitsData.length,
      completedToday,
      todayPercentage,
      weeklyAverage,
      longestStreak,
    });
  };

  const calculateHabitStreak = (habit: Habit): number => {
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateString = checkDate.toISOString().split('T')[0];
      
      if (habit.completedDates.includes(dateString)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  };

  const getDayName = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 80) return '#10B981';
    if (percentage >= 60) return '#F59E0B';
    if (percentage >= 40) return '#EF4444';
    return '#6B7280';
  };

  const renderProgressBar = (percentage: number, height: number = 100) => {
    const screenWidth = Dimensions.get('window').width;
    const barWidth = (screenWidth - 80) / 7; // 7 days, with padding
    
    return (
      <View style={[styles.progressBar, { width: barWidth, height }]}>
        <View
          style={[
            styles.progressFill,
            {
              height: `${percentage}%`,
              backgroundColor: getProgressColor(percentage),
            },
          ]}
        />
      </View>
    );
  };

  const renderStatCard = (title: string, value: string, subtitle: string, icon: string) => (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Progress Report</Text>
          <Text style={styles.subtitle}>Track your habit journey</Text>
        </View>

        {/* Overall Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            {renderStatCard(
              'Today',
              `${overallStats.todayPercentage}%`,
              `${overallStats.completedToday}/${overallStats.totalHabits} completed`,
              '🎯'
            )}
            {renderStatCard(
              'Weekly Avg',
              `${overallStats.weeklyAverage}%`,
              'Last 7 days average',
              '📊'
            )}
          </View>
          <View style={styles.statsRow}>
            {renderStatCard(
              'Longest Streak',
              `${overallStats.longestStreak}`,
              'days in a row',
              '🔥'
            )}
            {renderStatCard(
              'Total Habits',
              `${overallStats.totalHabits}`,
              'habits created',
              '📝'
            )}
          </View>
        </View>

        {/* Weekly Progress Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Weekly Progress</Text>
          <Text style={styles.chartSubtitle}>Daily completion percentage</Text>
          
          <View style={styles.chart}>
            {weeklyProgress.map((day, index) => (
              <View key={index} style={styles.chartDay}>
                {renderProgressBar(day.percentage)}
                <Text style={styles.chartDayLabel}>{getDayName(day.date)}</Text>
                <Text style={styles.chartDayPercentage}>{day.percentage}%</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>80%+</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.legendText}>60-79%</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.legendText}>40-59%</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#6B7280' }]} />
              <Text style={styles.legendText}>0-39%</Text>
            </View>
          </View>
        </View>

        {/* Individual Habit Progress */}
        <View style={styles.habitsContainer}>
          <Text style={styles.habitsTitle}>Individual Habits</Text>
          {habits.map((habit) => {
            const streak = calculateHabitStreak(habit);
            const totalCompleted = habit.completedDates.length;
            const daysSinceCreated = Math.ceil(
              (Date.now() - new Date(habit.createdAt).getTime()) / (1000 * 60 * 60 * 24)
            );
            const completionRate = daysSinceCreated > 0 
              ? Math.round((totalCompleted / daysSinceCreated) * 100) 
              : 0;

            return (
              <View key={habit.id} style={styles.habitCard}>
                <View style={styles.habitHeader}>
                  <Text style={styles.habitName}>{habit.name}</Text>
                  <Text style={styles.habitFrequency}>
                    {habit.frequency === 'daily' ? '📅 Daily' : '📆 Weekly'}
                  </Text>
                </View>
                <View style={styles.habitStats}>
                  <View style={styles.habitStat}>
                    <Text style={styles.habitStatValue}>{streak}</Text>
                    <Text style={styles.habitStatLabel}>Current Streak</Text>
                  </View>
                  <View style={styles.habitStat}>
                    <Text style={styles.habitStatValue}>{totalCompleted}</Text>
                    <Text style={styles.habitStatLabel}>Total Completed</Text>
                  </View>
                  <View style={styles.habitStat}>
                    <Text style={styles.habitStatValue}>{completionRate}%</Text>
                    <Text style={styles.habitStatLabel}>Success Rate</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    marginBottom: 16,
  },
  chartDay: {
    alignItems: 'center',
    flex: 1,
  },
  progressBar: {
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  progressFill: {
    borderRadius: 4,
    minHeight: 4,
  },
  chartDayLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  chartDayPercentage: {
    fontSize: 10,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
  habitsContainer: {
    marginBottom: 24,
  },
  habitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  habitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  habitFrequency: {
    fontSize: 12,
    color: '#8B5CF6',
  },
  habitStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  habitStat: {
    alignItems: 'center',
  },
  habitStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 2,
  },
  habitStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default ProgressScreen;