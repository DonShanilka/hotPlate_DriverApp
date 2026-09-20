import { StyleSheet, Text, View } from "react-native";

export default function MyDeliveriesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        My Deliveries
      </Text>

      <Text>
        Your assigned deliveries will appear here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    paddingTop: 70,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 15,
  },
});