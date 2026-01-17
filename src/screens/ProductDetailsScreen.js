import React, { useEffect, useState } from "react";
import { View, Text, Button, Image } from "react-native";
import { getProductById } from "../storage/productsRepo";

export default function ProductDetailsScreen({ navigation, route }) {
  const id = route?.params?.id;
  const [p, setP] = useState(null);

  useEffect(() => {
    (async () => {
      const data = await getProductById(id);
      setP(data);
    })();
  }, [id]);

  if (!p) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text>Ładowanie...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>{p.name}</Text>

      {p.photoUri ? (
        <Image
          source={{ uri: p.photoUri }}
          style={{ width: "100%", height: 220, borderRadius: 12 }}
          resizeMode="cover"
        />
      ) : (
        <Text>Brak zdjęcia</Text>
      )}

      <Text>Data ważności: {p.expiryDate}</Text>
      <Text>Opis: {p.description || "-"}</Text>

      <Button title="Edytuj" onPress={() => navigation.navigate("ProductForm", { id: p.id })} />
    </View>
  );
}
