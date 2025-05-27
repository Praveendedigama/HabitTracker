import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { TabParamList, Habit } from '../types';
import { StorageService } from '../services/storage';

type CalendarScreenNavigationProp = BottomTabNavigationProp<TabParamList, 'Calendar'>;

interface Props {
  navigation: CalendarScreenNavigationProp;
}

interface CalendarDay {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  completedHabits: number;
  totalHabits: number;
  percentage: number;
}

const Calendar: React.FC<Props> = ({ navigation }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      loadHabits();
    }, [])
  );

  useEffect(() => {
    generateCalendar();
  }, [currentDate, habits]);

  const loadHabits = async () => {
    try {
      const habitsData = await StorageService.getHabits();
      setHabits(habitsData.filter(habit => habit.frequency === 'daily'));
    } catch (error) {
      console.error('Error loading habits:', error);
    }
  };

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of the month and how many days in month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: CalendarDay[] = [];
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    // Add days from previous month
    const prevMonth = new Date(year, month - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();
    
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = new Date(year, month - 1, day);
      const dateString = date.toISOString().split('T')[0];
      
      days.push({
        date: dateString,
        day,
        isCurrentMonth: false,
        isToday: false,
        ...calculateDayStats(dateString),
      });
    }
    
    // Add days from current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      
      days.push({
        date: dateString,
        day,
        isCurrentMonth: true,
        isToday: dateString === todayString,
        ...calculateDayStats(dateString),
      });
    }
    
    // Add days from next month to complete the grid
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      const dateString = date.toISOString().split('T')[0];
      
      days.push({
        date: dateString,
        day,
        isCurrentMonth: false,
        isToday: false,
        ...calculateDayStats(dateString),
      });
    }
    
    setCalendarDays(days);
  };

  const calculateDayStats = (dateString: string) => {
    const completedHabits = habits.filter(habit =>
      habit.completedDates.includes(dateString)
    ).length;
    
    const totalHabits = habits.length;
    const percentage = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
    
    return {
      completedHabits,
      totalHabits,
      percentage,
    };
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getDayColor = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return '#F3F4F6';
    if (day.percentage === 0) return '#FFFFFF';
    if (day.percentage >= 80) return '#10B981';
    if (day.percentage >= 60) return '#F59E0B';
    if (day.percentage >= 40) return '#EF4444';
    return '#8B5CF6';
  };

  const getDayTextColor = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return '#9CA3AF';
    if (day.isToday) return '#8B5CF6';
    if (day.percentage >= 40) return '#FFFFFF';
    return '#374151';
  };

  const getSelectedDateHabits = () => {
    if (!selectedDate) return [];
    
    return habits.map(habit => ({
      ...habit,
      isCompleted: habit.completedDates.includes(selectedDate),
    }));
  };

  const formatSelectedDate = () => {
    if (!selectedDate) return '';
    
    const date = new Date(selectedDate);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const screenWidth = Dimensions.get('window').width;
  const daySize = (screenWidth - 48) / 7; // 7 days with padding

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Habit Calendar</Text>
          <Text style={styles.subtitle}>Track your habit streaks</Text>
        </View>

        {/* Calendar Header */}
        <View style={styles.calendarHeader}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigateMonth('prev')}>
            <Text style={styles.navButtonText}>‹</Text>
          </TouchableOpacity>
          
          <Text style={styles.monthYear}>
            {currentDate.toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </Text>
          
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigateMonth('next')}>
            <Text style={styles.navButtonText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Days of Week */}
        <View style={styles.daysOfWeek}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Text key={day} style={[styles.dayOfWeek, { width: daySize }]}>
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendar}>
          {calendarDays.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.calendarDay,
                {
                  width: daySize,
                  height: daySize,
                  backgroundColor: getDayColor(day),
                },
                day.isToday && styles.todayBorder,
                selectedDate === day.date && styles.selectedDay,
              ]}
              onPress={() => setSelectedDate(day.date)}>
              <Text
                style={[
                  styles.calendarDayText,
                  { color: getDayTextColor(day) },
                  day.isToday && styles.todayText,
                ]}>
                {day.day}
              </Text>
              {day.isCurrentMonth && day.percentage > 0 && (
                <Text style={styles.percentageText}>{day.percentage}%</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Completion Rate</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' }]} />
              <Text style={styles.legendText}>0%</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.legendText}>40-59%</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.legendText}>60-79%</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>80%+</Text>
            </View>
          </View>
        </View>

        {/* Selected Date Details */}
        {selectedDate && (
          <View style={styles.selectedDateContainer}>
            <Text style={styles.selectedDateTitle}>{formatSelectedDate()}</Text>
            <View style={styles.selectedDateHabits}>
              {getSelectedDateHabits().map((habit) => (
                <View key={habit.id} style={styles.habitItem}>
                  <Text style={styles.habitItemName}>{habit.name}</Text>
                  <Text style={styles.habitItemStatus}>
                    {habit.isCompleted ? '✅ Completed' : '⭕ Not Completed'}
                  </Text>
                </View>
              ))}
              {getSelectedDateHabits().length === 0 && (
                <Text style={styles.noHabitsText}>No habits for this date</Text>
              )}
            </View>
          </View>
        )}
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
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  monthYear: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
  },
  daysOfWeek: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayOfWeek: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    paddingVertical: 8,
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  calendarDay: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  todayBorder: {
    borderColor: '#8B5CF6',
    borderWidth: 2,
  },
  selectedDay: {
    borderColor: '#374151',
    borderWidth: 2,
  },
  calendarDayText: {
    fontSize: 16,
    fontWeight: '600',
  },
  todayText: {
    fontWeight: 'bold',
  },
  percentageText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 2,
  },
  legend: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
  selectedDateContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  selectedDateHabits: {
    gap: 8,
  },
  habitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  habitItemName: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  habitItemStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  noHabitsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 16,
  },
});

export default Calendar;