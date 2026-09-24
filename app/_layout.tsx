import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { AuthProvider } from "../src/context/AuthContext";
import { store } from "../src/store/store";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </Provider>
  );
}
