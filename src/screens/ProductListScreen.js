import React, { useCallback, useState } from "react";
import { View, Text, Button, FlatList, Pressable, Image } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { listProducts, deleteProduct } from "../storage/productsRepo";

function daysToExpiry(expiryDate) {
  const [y, m, d] = expiryDate.split("-").map(Number);
  const today = new Date();
  const exp = new Date(y, m - 1, d);
  today.setHours(0, 0, 0, 0);
  exp.setHours(0, 0, 0, 0);
  const diffMs = exp - today;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export default function ProductListScreen({ navigation }) {
  const [items, setItems] = useState([]);

  const load = async () => {
    const data = await listProducts();
    setItems(data);
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const onDelete = async (id) => {
    await deleteProduct(id);
    await load();
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Button title="Dodaj produkt" onPress={() => navigation.navigate("ProductForm")} />
        </View>
        <View style={{ width: 120 }}>
          <Button title="Ustawienia" onPress={() => navigation.navigate("Settings")} />
        </View>
      </View>

      {items.length === 0 ? (
        <Text style={{ marginTop: 12 }}>
          Brak produktów. Dodaj pierwszy produkt przyciskiem powyżej.
        </Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => {
            const d = daysToExpiry(item.expiryDate);
            const badge = d < 0 ? "PRZETERMINOWANE" : d === 0 ? "DZISIAJ" : `ZA ${d} DNI`;

            return (
              <Pressable
                onPress={() => navigation.navigate("ProductDetails", { id: item.id })}
                style={{
                  padding: 12,
                  borderWidth: 1,
                  borderRadius: 12,
                  marginBottom: 10,
                  flexDirection: "row",
                  gap: 12,
                }}
              >
                {item.photoUri ? (
                  <Image
                    source={{ uri: item.photoUri }}
                    style={{ width: 64, height: 64, borderRadius: 12 }}
                  />
                ) : (
                  <View
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 12,
                      borderWidth: 1,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 10 }}>BRAK ZDJĘCIA</Text>
                  </View>
                )}

                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: "600" }}>{item.name}</Text>
                  <Text style={{ marginTop: 4 }}>
                    Ważne do: {item.expiryDate} • {badge}
                  </Text>

                  <View style={{ marginTop: 10, flexDirection: "row", gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <Button
                        title="Edytuj"
                        onPress={() => navigation.navigate("ProductForm", { id: item.id })}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Button title="Usuń" onPress={() => onDelete(item.id)} />
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}
