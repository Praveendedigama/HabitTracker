import AsyncStorage from "@react-native-async-storage/async-storage"
import type { User, Habit } from "../types"

const USER_KEY = "@habit_tracker_user"
const HABITS_KEY = "@habit_tracker_habits"
const SESSION_KEY = "@habit_tracker_session" // New key for session management

export const StorageService = {
  // User methods
  async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user))
    } catch (error) {
      console.error("Error saving user:", error)
      throw error
    }
  },

  async getUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY)
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.error("Error getting user:", error)
      return null
    }
  },

  async removeUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(USER_KEY)
    } catch (error) {
      console.error("Error removing user:", error)
      throw error
    }
  },

  // Session methods (NEW)
  async createSession(userId: string): Promise<void> {
    try {
      const sessionData = {
        userId,
        loginTime: new Date().toISOString(),
        isLoggedIn: true,
      }
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sessionData))
    } catch (error) {
      console.error("Error creating session:", error)
      throw error
    }
  },

  async getSession(): Promise<{ userId: string; loginTime: string; isLoggedIn: boolean } | null> {
    try {
      const sessionData = await AsyncStorage.getItem(SESSION_KEY)
      return sessionData ? JSON.parse(sessionData) : null
    } catch (error) {
      console.error("Error getting session:", error)
      return null
    }
  },

  async clearSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SESSION_KEY)
    } catch (error) {
      console.error("Error clearing session:", error)
      throw error
    }
  },

  async isUserLoggedIn(): Promise<boolean> {
    try {
      const session = await this.getSession()
      return session?.isLoggedIn || false
    } catch (error) {
      console.error("Error checking login status:", error)
      return false
    }
  },

  // Habit methods (unchanged)
  async saveHabits(habits: Habit[]): Promise<void> {
    try {
      await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits))
    } catch (error) {
      console.error("Error saving habits:", error)
      throw error
    }
  },

  async getHabits(): Promise<Habit[]> {
    try {
      const habitsData = await AsyncStorage.getItem(HABITS_KEY)
      return habitsData ? JSON.parse(habitsData) : []
    } catch (error) {
      console.error("Error getting habits:", error)
      return []
    }
  },

  async addHabit(habit: Habit): Promise<void> {
    try {
      const existingHabits = await this.getHabits()
      const updatedHabits = [...existingHabits, habit]
      await this.saveHabits(updatedHabits)
    } catch (error) {
      console.error("Error adding habit:", error)
      throw error
    }
  },

  async updateHabit(updatedHabit: Habit): Promise<void> {
    try {
      const existingHabits = await this.getHabits()
      const updatedHabits = existingHabits.map((habit) => (habit.id === updatedHabit.id ? updatedHabit : habit))
      await this.saveHabits(updatedHabits)
    } catch (error) {
      console.error("Error updating habit:", error)
      throw error
    }
  },

  async deleteHabit(habitId: string): Promise<void> {
    try {
      const existingHabits = await this.getHabits()
      const updatedHabits = existingHabits.filter((habit) => habit.id !== habitId)
      await this.saveHabits(updatedHabits)
    } catch (error) {
      console.error("Error deleting habit:", error)
      throw error
    }
  },

  async markHabitComplete(habitId: string, date: string): Promise<void> {
    try {
      const habits = await this.getHabits()
      const habitIndex = habits.findIndex((h) => h.id === habitId)

      if (habitIndex !== -1) {
        const habit = habits[habitIndex]
        if (!habit.completedDates.includes(date)) {
          habit.completedDates.push(date)
          await this.updateHabit(habit)
        }
      }
    } catch (error) {
      console.error("Error marking habit complete:", error)
      throw error
    }
  },

  async markHabitIncomplete(habitId: string, date: string): Promise<void> {
    try {
      const habits = await this.getHabits()
      const habitIndex = habits.findIndex((h) => h.id === habitId)

      if (habitIndex !== -1) {
        const habit = habits[habitIndex]
        habit.completedDates = habit.completedDates.filter((d) => d !== date)
        await this.updateHabit(habit)
      }
    } catch (error) {
      console.error("Error marking habit incomplete:", error)
      throw error
    }
  },
}
