import "../src/global.css";

import { Stack } from "expo-router";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { AuthProvider } from "../src/context/AuthContext";
import { DriverProvider } from "../src/context/DriverContext";
import { hydrateAuth } from "../src/redux/features/auth/authThunk";
import { useAppDispatch } from "../src/redux/store/hooks";
import { store } from "../src/redux/store/store";

function RootNavigator() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(hydrateAuth());
  }, [dispatch]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <DriverProvider>
          <RootNavigator />
        </DriverProvider>
      </AuthProvider>
    </Provider>
  );
}
