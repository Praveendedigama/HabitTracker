"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Text, View, StyleSheet } from "react-native"

import type { RootStackParamList, TabParamList } from "../types"
import { StorageService } from "../services/storage"

import HomeScreen from "../screen/HomeScreen"
import AddHabitScreen from "../screen/AddHabitScreen"
import Calendar from "../screen/Calander"
import HabitListScreen from "../screen/HabitListScreen"
import LoginScreen from "../screen/LoginScreen"
import RegisterScreen from "../screen/Registerscreen"
import ProgressScreen from "../screen/ProgressScreen"
import WelcomeScreen from "../screen/WelcomeScreen"


const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<TabParamList>()

// Custom Tab Bar Icon Component
const TabIcon: React.FC<{ icon: string; focused: boolean }> = ({ icon, focused }) => (
  <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
    <Text style={[styles.tabIconText, focused && styles.tabIconTextFocused]}>{icon}</Text>
  </View>
)

// Main Tab Navigator
const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#8B5CF6",
        tabBarInactiveTintColor: "#6B7280",
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="HabitList"
        component={HabitListScreen}
        options={{
          tabBarLabel: "Habits",
          tabBarIcon: ({ focused }) => <TabIcon icon="📋" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          tabBarLabel: "Progress",
          tabBarIcon: ({ focused }) => <TabIcon icon="📊" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={Calendar}
        options={{
          tabBarLabel: "Calendar",
          tabBarIcon: ({ focused }) => <TabIcon icon="📅" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  )
}

// Main App Navigator
const AppNavigator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // Check if user has an active session
      const isUserLoggedIn = await StorageService.isUserLoggedIn()
      setIsLoggedIn(isUserLoggedIn)
    } catch (error) {
      console.error("Error checking auth status:", error)
      setIsLoggedIn(false)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          animation: "slide_from_right",
        }}
        initialRouteName={isLoggedIn ? "Main" : "Welcome"}
      >
       
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: true,
            headerTitle: "Sign In",
            headerStyle: styles.header,
            headerTitleStyle: styles.headerTitle,
            headerTintColor: "#8B5CF6",
          }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            headerShown: true,
            headerTitle: "Create Account",
            headerStyle: styles.header,
            headerTitleStyle: styles.headerTitle,
            headerTintColor: "#8B5CF6",
          }}
        />

        
        <Stack.Screen
          name="Main"
          component={MainTabNavigator}
          options={{
            gestureEnabled: false,
          }}
        />

        
        <Stack.Screen
          name="AddHabit"
          component={AddHabitScreen}
          options={{
            presentation: "modal",
            headerShown: true,
            headerTitle: "Add New Habit",
            headerStyle: styles.header,
            headerTitleStyle: styles.headerTitle,
            headerTintColor: "#8B5CF6",
            
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    fontSize: 18,
    color: "#8B5CF6",
    fontWeight: "600",
  },
  tabBar: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 8,
    paddingBottom: 8,
    height: 70,
    shadowColor: "#8B5CF6",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  tabIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  tabIconFocused: {
    backgroundColor: "#F3F4F6",
  },
  tabIconText: {
    fontSize: 20,
  },
  tabIconTextFocused: {
    fontSize: 22,
  },
  header: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#8B5CF6",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
})

export default AppNavigator
