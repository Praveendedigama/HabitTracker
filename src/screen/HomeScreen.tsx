"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from "react-native"
import type { CompositeNavigationProp } from "@react-navigation/native"
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { TabParamList, RootStackParamList, User, Habit } from "../types"
import CustomHomeButton from "../components/CustomHomeButton"
import CustomButton from "../components/CustomButton"
import { StorageService } from "../services/storage"

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, "Home">,
  NativeStackNavigationProp<RootStackParamList>
>

interface Props {
  navigation: HomeScreenNavigationProp
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [user, setUser] = useState<User | null>(null)
  const [habits, setHabits] = useState<Habit[]>([])
  const [todayStats, setTodayStats] = useState({
    completed: 0,
    total: 0,
    percentage: 0,
  })

  useEffect(() => {
    loadUserData()
    loadHabits()
  }, [])

  useEffect(() => {
    calculateTodayStats()
  }, [habits])

  const loadUserData = async () => {
    try {
      const userData = await StorageService.getUser()
      setUser(userData)
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }

  const loadHabits = async () => {
    try {
      const habitsData = await StorageService.getHabits()
      setHabits(habitsData)
    } catch (error) {
      console.error("Error loading habits:", error)
    }
  }

  const calculateTodayStats = () => {
    const today = new Date().toISOString().split("T")[0]
    const dailyHabits = habits.filter((habit) => habit.frequency === "daily")
    const completedToday = dailyHabits.filter((habit) => habit.completedDates.includes(today)).length

    const total = dailyHabits.length
    const percentage = total > 0 ? Math.round((completedToday / total) * 100) : 0

    setTodayStats({
      completed: completedToday,
      total,
      percentage,
    })
  }

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            // Only clear the session, keep user data for future logins
            await StorageService.clearSession()

            // Reset navigation stack and go to Welcome screen
            navigation.reset({
              index: 0,
              routes: [{ name: "Welcome" }],
            })
          } catch (error) {
            Alert.alert("Error", "Failed to logout")
          }
        },
      },
    ])
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  const getMotivationalMessage = () => {
    if (todayStats.percentage === 100) {
      return "🎉 Perfect day! You've completed all your habits!"
    } else if (todayStats.percentage >= 75) {
      return "🔥 You're doing great! Keep up the momentum!"
    } else if (todayStats.percentage >= 50) {
      return "💪 Good progress! You're halfway there!"
    } else if (todayStats.percentage > 0) {
      return "🌱 Every step counts! Keep building those habits!"
    } else {
      return "🚀 Ready to start your day? Let's build some habits!"
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>
              {getGreeting()}, {user?.name || "User"}! 👋
            </Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>

        {/* Progress Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <Text style={styles.statsTitle}>Today's Progress</Text>
            <Text style={styles.statsEmoji}>📈</Text>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressCircleContainer}>
              <View style={styles.progressCircle}>
                <Text style={styles.progressPercentage}>{todayStats.percentage}%</Text>
                <Text style={styles.progressLabel}>Complete</Text>
              </View>
            </View>
            <View style={styles.progressDetails}>
              <View style={styles.progressTextContainer}>
                <Text style={styles.progressText}>
                  {todayStats.completed} of {todayStats.total} habits completed
                </Text>
                <Text style={styles.motivationalText}>{getMotivationalMessage()}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions Section */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.actionsGrid}>
        

            <CustomHomeButton
              title="Add New Habit"
              subtitle="Create a new habit to track"
              onPress={() => navigation.navigate("AddHabit")}
              icon={<Text style={styles.buttonIcon}>➕</Text>}
            />

          </View>
        </View>

        <View style={styles.logoutContainer}>
          <CustomButton title="Logout" onPress={handleLogout} style={styles.logoutButton} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 28,
    marginTop: 16,
  },
  greetingContainer: {
    marginTop: 20,
    backgroundColor: "#E9DFF8",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#8B5CF6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6
   
    
  },
  greeting: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  date: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  statsCard: {
    backgroundColor: "#E9DFF8",
    borderRadius: 24,
    padding: 24,
    marginBottom: 28,
    shadowColor: "#8B5CF6",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  statsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  statsEmoji: {
    fontSize: 24,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressCircleContainer: {
    marginRight: 20,
  },
  progressCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#8B5CF6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8B5CF6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  progressPercentage: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  progressLabel: {
    fontSize: 12,
    color: "#E5E7EB",
    fontWeight: "600",
    marginTop: 2,
  },
  progressDetails: {
    flex: 1,
  },
  progressTextContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#8B5CF6",
  },
  progressText: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 8,
    fontWeight: "600",
  },
  motivationalText: {
    fontSize: 14,
    color: "#8B5CF6",
    fontStyle: "italic",
    fontWeight: "500",
    lineHeight: 20,
  },
  quickActions: {
    marginBottom: 32,
    marginTop: 26,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 20,
    textAlign: "center",
  },
  actionsGrid: {
    gap: 16,
  },
 
  buttonIcon: {
    fontSize: 24,
  },
  logoutContainer: {
    alignItems: "center",
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  logoutButton: {
    backgroundColor: "#EF4444",
    width: "70%",
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#EF4444",
    shadowColor: "#EF4444",
    shadowOffset: {
      width: 1,
      height: 3,
    },
    elevation: 3,
  },
})

export default HomeScreen
