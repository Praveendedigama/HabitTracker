import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Habit } from '../types';
import CustomInput from '../components/CustomInputButton';
import CustomButton from '../components/CustomButton';
import { StorageService } from '../services/storage';

type AddHabitScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddHabit'
>;

interface Props {
  navigation: AddHabitScreenNavigationProp;
}

const AddHabitScreen: React.FC<Props> = ({ navigation }) => {
  const [habitName, setHabitName] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!habitName.trim()) {
      newErrors.habitName = 'Habit name is required';
    } else if (habitName.trim().length < 3) {
      newErrors.habitName = 'Habit name must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateHabit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const newHabit: Habit = {
        id: Date.now().toString(),
        name: habitName.trim(),
        frequency,
        createdAt: new Date().toISOString(),
        completedDates: [],
      };

      await StorageService.addHabit(newHabit);
      
      Alert.alert(
        'Success! 🎉',
        'Your new habit has been created successfully!',
        [
          {
            text: 'Great!',
            onPress: () => navigation.goBack(),
            style: 'default',
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create habit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderFrequencyOption = (
    option: 'daily' | 'weekly',
    title: string,
    description: string,
    icon: string
  ) => (
    <TouchableOpacity
      style={[
        styles.frequencyOption,
        frequency === option && styles.selectedFrequencyOption,
      ]}
      onPress={() => setFrequency(option)}
      activeOpacity={0.7}>
      <View style={styles.frequencyContent}>
        <View style={styles.frequencyIconContainer}>
          <Text style={styles.frequencyIcon}>{icon}</Text>
        </View>
        <View style={styles.frequencyText}>
          <Text
            style={[
              styles.frequencyTitle,
              frequency === option && styles.selectedFrequencyTitle,
            ]}>
            {title}
          </Text>
          <Text
            style={[
              styles.frequencyDescription,
              frequency === option && styles.selectedFrequencyDescription,
            ]}>
            {description}
          </Text>
        </View>
        <View
          style={[
            styles.radioButton,
            frequency === option && styles.selectedRadioButton,
          ]}>
          {frequency === option && <View style={styles.radioButtonInner} />}
        </View>
      </View>
    </TouchableOpacity>
  );

  const habitSuggestions = [
    '💧 Drink 8 glasses of water',
    '🏃‍♂️ Exercise for 30 minutes',
    '📚 Read for 20 minutes',
    '🧘‍♀️ Meditate for 10 minutes',
    '🌅 Wake up early',
    '📱 No phone before bed',
    '🥗 Eat a healthy meal',
    '✍️ Write in journal',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Create New Habit ✨</Text>
            <Text style={styles.subtitle}>
              Start building a positive habit today!
            </Text>
          </View>
        </View>

        <View style={styles.form}>
          {/* Habit Name Input */}
          <View style={styles.inputSection}>
            <CustomInput
              label="Habit Name"
              placeholder="e.g., Exercise for 30 minutes"
              value={habitName}
              onChangeText={(value) => {
                setHabitName(value);
                if (errors.habitName) {
                  setErrors(prev => ({ ...prev, habitName: '' }));
                }
              }}
              error={errors.habitName}
              autoCapitalize="sentences"
            />
          </View>

          {/* Habit Suggestions */}
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>💡 Popular Habits</Text>
            <View style={styles.suggestionsGrid}>
              {habitSuggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.suggestionChip,
                    habitName === suggestion && styles.selectedSuggestionChip
                  ]}
                  onPress={() => setHabitName(suggestion)}
                  activeOpacity={0.8}>
                  <Text style={[
                    styles.suggestionText,
                    habitName === suggestion && styles.selectedSuggestionText
                  ]}>
                    {suggestion}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Frequency Selection */}
          <View style={styles.frequencyContainer}>
            <Text style={styles.frequencyLabel}>📅 Frequency</Text>
            
            <View style={styles.frequencyOptions}>
              {renderFrequencyOption(
                'daily',
                'Daily',
                'Track this habit every day',
                '📅'
              )}
              
              {renderFrequencyOption(
                'weekly',
                'Weekly',
                'Track this habit once a week',
                '📆'
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <CustomButton
              title={loading ? "Creating..." : "Create Habit 🚀"}
              onPress={handleCreateHabit}
              loading={loading}
              style={styles.createButton}
              variant="primary"
              size="large"
            />
            
            <CustomButton
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="outline"
              style={styles.cancelButton}
              size="large"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  header: {
    marginBottom: 32,
  },
  titleContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderLeftWidth: 5,
    borderLeftColor: '#8B5CF6',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#8B5CF6',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  form: {
    flex: 1,
  },
  inputSection: {
    marginBottom: 28,
  },
  suggestionsContainer: {
    marginBottom: 28,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 16,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  suggestionChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedSuggestionChip: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F3F4F6',
  },
  suggestionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedSuggestionText: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  frequencyContainer: {
    marginBottom: 32,
  },
  frequencyLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 16,
  },
  frequencyOptions: {
    gap: 12,
  },
  frequencyOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  selectedFrequencyOption: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F8FAFC',
    shadowOpacity: 0.15,
  },
  frequencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  frequencyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  frequencyIcon: {
    fontSize: 24,
  },
  frequencyText: {
    flex: 1,
  },
  frequencyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  selectedFrequencyTitle: {
    color: '#8B5CF6',
  },
  frequencyDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedFrequencyDescription: {
    color: '#8B5CF6',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRadioButton: {
    borderColor: '#8B5CF6',
    backgroundColor: '#FFFFFF',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#8B5CF6',
  },
  buttonContainer: {
    gap: 16,
    marginTop: 'auto',
    paddingTop: 32,
  },
  createButton: {
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cancelButton: {
    borderWidth: 2,
    borderColor: '#6B7280',
  },
});

export default AddHabitScreen;