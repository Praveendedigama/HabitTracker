import type React from "react"
import { TouchableOpacity, Text, StyleSheet, View, type ViewStyle } from "react-native"

interface CustomHomeButtonProps {
  title: string
  subtitle?: string
  onPress: () => void
  icon?: React.ReactNode
  style?: ViewStyle
}

const CustomHomeButton: React.FC<CustomHomeButtonProps> = ({ title, subtitle, onPress, icon, style }) => {
  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.content}>
        {icon && (
          <View style={styles.iconContainer}>
            <View style={styles.iconBackground}>{icon}</View>
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        <View style={styles.arrowContainer}>
          <Text style={styles.arrow}>→</Text>
        </View>
      </View>
      <View style={styles.bottomAccent} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginVertical: 8,
    shadowColor: "#8B5CF6",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    overflow: "hidden",
    position: "relative",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 24,
    paddingVertical: 20,
  },
  iconContainer: {
    marginRight: 20,
  },
  iconBackground: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    shadowColor: "#8B5CF6",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textContainer: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
    lineHeight: 20,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#8B5CF6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8B5CF6",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  arrow: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  bottomAccent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#8B5CF6",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
})

export default CustomHomeButton
