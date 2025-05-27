import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Habit } from '../types';



interface FlashlistBoxProps {
  habit: Habit;
  isCompleted: boolean;
  onToggleComplete: (habitId: string) => void;
  style?: ViewStyle;
}

const FlashlistBox: React.FC<FlashlistBoxProps> = ({
  habit,
  isCompleted,
  onToggleComplete,
  style,
}) => {
  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getStreakCount = () => {
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < 30; i++) {
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

  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        <View style={styles.habitInfo}>
          <Text style={styles.habitName}>{habit.name}</Text>
          <View style={styles.habitDetails}>
            <Text style={styles.frequency}>
              {habit.frequency === 'daily' ? '📅 Daily' : '📆 Weekly'}
            </Text>
            <Text style={styles.streak}>🔥 {getStreakCount()} day streak</Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={[styles.checkButton, isCompleted && styles.checkButtonCompleted]}
          onPress={() => onToggleComplete(habit.id)}>
          <Text style={[styles.checkText, isCompleted && styles.checkTextCompleted]}>
            {isCompleted ? '✅' : '⭕'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {isCompleted && (
        <View style={styles.completedBanner}>
          <Text style={styles.completedText}>Completed Today! 🎉</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  habitDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  frequency: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 16,
  },
  streak: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  checkButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  checkButtonCompleted: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  checkText: {
    fontSize: 20,
  },
  checkTextCompleted: {
    color: '#FFFFFF',
  },
  completedBanner: {
    backgroundColor: '#10B981',
    paddingVertical: 8,
    alignItems: 'center',
  },
  completedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default FlashlistBox;