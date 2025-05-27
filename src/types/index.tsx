export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

export interface Habit {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly';
  createdAt: string;
  completedDates: string[]; // Array of date strings when habit was completed
}

export interface HabitCompletion {
  habitId: string;
  date: string;
  completed: boolean;
}

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
  AddHabit: undefined;
};

export type TabParamList = {
  Home: undefined;
  HabitList: undefined;
  Progress: undefined;
  Calendar: undefined;
};