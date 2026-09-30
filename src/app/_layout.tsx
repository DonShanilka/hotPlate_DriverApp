import "../global.css";

import { Stack } from "expo-router";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { AuthProvider } from "../context/AuthContext";
import { DriverProvider } from "../context/DriverContext";
import { OrderProvider } from "../context/OrderContext";
import { hydrateAuth } from "../redux/features/auth/authThunk";
import { useAppDispatch } from "../redux/store/hooks";
import { store } from "../redux/store/store";

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
          <OrderProvider>
            <RootNavigator />
          </OrderProvider>
        </DriverProvider>
      </AuthProvider>
    </Provider>
  );
}
