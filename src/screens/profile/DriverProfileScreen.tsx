import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "../../context/AuthContext";

export default function DriverProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: logout,
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Driver Profile
      </Text>

      <Text style={styles.label}>
        Name
      </Text>

      <Text style={styles.value}>
        {user?.firstName} {user?.lastName}
      </Text>

      <Text style={styles.label}>
        Email
      </Text>

      <Text style={styles.value}>
        {user?.email}
      </Text>

      <TouchableOpacity
        style={styles.logout}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>
          Logout
        </Text>
      </TouchableOpacity>
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
    marginBottom: 35,
  },

  label: {
    fontSize: 13,
    color: "#888",
    marginTop: 15,
  },

  value: {
    fontSize: 17,
    marginTop: 5,
  },

  logout: {
    marginTop: 40,
    height: 50,
    backgroundColor: "#000",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  logoutText: {
    color: "#fff",
    fontWeight: "700",
  },
});