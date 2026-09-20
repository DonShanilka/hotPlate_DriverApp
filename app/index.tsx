import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <Text style={styles.eyebrow}>HOTPLATE DRIVER</Text>
        <Text style={styles.title}>Ready for your next delivery</Text>
        <Text style={styles.subtitle}>
          Your driver dashboard is ready. New orders and delivery updates will
          appear here.
        </Text>
        <View style={styles.statusCard}>
          <View style={styles.statusDot} />
          <View>
            <Text style={styles.statusTitle}>You are offline</Text>
            <Text style={styles.statusText}>
              Go online to start receiving orders.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#122018",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  eyebrow: {
    color: "#9bd95b",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.8,
    marginBottom: 16,
  },
  title: {
    color: "#f4f7ed",
    fontSize: 36,
    fontWeight: "800",
    lineHeight: 42,
    maxWidth: 340,
  },
  subtitle: {
    color: "#b6c4b4",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 16,
    maxWidth: 360,
  },
  statusCard: {
    alignItems: "center",
    backgroundColor: "#1d2d23",
    borderColor: "#304636",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 36,
    padding: 18,
  },
  statusDot: {
    backgroundColor: "#8c9b8b",
    borderRadius: 6,
    height: 12,
    marginRight: 14,
    width: 12,
  },
  statusTitle: {
    color: "#f4f7ed",
    fontSize: 16,
    fontWeight: "700",
  },
  statusText: {
    color: "#9faf9e",
    fontSize: 13,
    marginTop: 4,
  },
});
