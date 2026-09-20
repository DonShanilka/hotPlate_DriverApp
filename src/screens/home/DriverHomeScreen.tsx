import { StyleSheet, Text, View } from "react-native";

import { useAuth } from "../../context/AuthContext";

export default function DriverHomeScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Welcome, {user?.firstName || "Driver"}
      </Text>

      <Text style={styles.subtitle}>Ready for your next delivery?</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    paddingTop: 70,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
  },

  subtitle: {
    fontSize: 16,
    color: "#777",
    marginTop: 8,
  },
});
