import type React from "react"
import { View, Text, StyleSheet, ImageBackground, SafeAreaView } from "react-native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RootStackParamList } from "../types"
import CustomButton from "../components/CustomButton"

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Welcome">

interface Props {
  navigation: WelcomeScreenNavigationProp
}

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <ImageBackground source={require("../assest/welcome.jpg")} style={styles.backgroundImage} resizeMode="cover">
      {/* Gradient overlay */}
      <View style={styles.gradientOverlay}>
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>Habit Tracker</Text>
                <Text style={styles.subtitle}>Build Good Habits, Break Bad Ones!</Text>
                <Text style={styles.description}>
                  Track your daily habits,
                   monitor your progress 
                   build a better you, one day at a time.
                </Text>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <CustomButton
                title="Get Started"
                onPress={() => navigation.navigate("Register")}
                variant="primary"
                size="large"
               
              />

              <CustomButton
                title="I Already Have an Account"
                onPress={() => navigation.navigate("Login")}
                variant="outline"
                size="large"
               
              />
            </View>
          </View>
        </SafeAreaView>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    flex: 1,
    backgroundColor: "rgba(40, 16, 95, 0.7)", 
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  header: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingBottom: 10,
  },
  titleContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)", // Semi-transparent background
    borderRadius: 20,
    padding: 40,
    alignItems: "center",

  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    paddingBottom: 20,
    paddingTop: 20,
  },

  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  description: {
    fontSize: 16,
    color: "#F3F4F6",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  buttonContainer: {
    gap: 18,
  },
 
})

export default WelcomeScreen
