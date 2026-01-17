import * as React from "react";
import { useEffect, useState } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { initDb } from "./src/storage/db";
import { requestNotificationPermissions } from "./src/notifications/notifications";

import ProductListScreen from "./src/screens/ProductListScreen";
import ProductFormScreen from "./src/screens/ProductFormScreen";
import ProductDetailsScreen from "./src/screens/ProductDetailsScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        await initDb();
        await requestNotificationPermissions(); // prosimy o zgode raz przy starcie
        setReady(true);
      } catch (e) {
        console.error(e);
        setError(e);
      }
    })();
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
        <Text style={{ fontSize: 16, fontWeight: "600" }}>
          Błąd inicjalizacji aplikacji
        </Text>
        <Text style={{ marginTop: 8 }}>{String(error)}</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Products"
          component={ProductListScreen}
          options={{ title: "FoodSaver" }}
        />
        <Stack.Screen
          name="ProductForm"
          component={ProductFormScreen}
          options={{ title: "Dodaj / Edytuj" }}
        />
        <Stack.Screen
          name="ProductDetails"
          component={ProductDetailsScreen}
          options={{ title: "Szczegóły" }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: "Ustawienia" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
