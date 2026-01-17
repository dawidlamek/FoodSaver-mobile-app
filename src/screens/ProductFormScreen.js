import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, Alert, Image } from "react-native";

import {
  addProduct,
  getProductById,
  updateProduct,
} from "../storage/productsRepo";

import {
  scheduleExpiryNotification,
  cancelNotification,
} from "../notifications/notifications";

import { pickImageFromLibrary } from "../utils/imagePicker";

function isValidDateYYYYMMDD(s) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export default function ProductFormScreen({ navigation, route }) {
  const editId = route?.params?.id ?? null;

  const [name, setName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [description, setDescription] = useState("");
  const [photoUri, setPhotoUri] = useState(null);

  useEffect(() => {
    if (!editId) return;

    (async () => {
      const p = await getProductById(editId);
      if (!p) return;

      setName(p.name);
      setExpiryDate(p.expiryDate);
      setDescription(p.description ?? "");
      setPhotoUri(p.photoUri ?? null);
    })();
  }, [editId]);

  const onPickPhoto = async () => {
    const res = await pickImageFromLibrary();
    if (res.canceled) return;
    if (!res.ok) {
      Alert.alert("Błąd", res.error || "Nie udało się wybrać zdjęcia.");
      return;
    }
    setPhotoUri(res.uri);
  };

  const onRemovePhoto = () => {
    setPhotoUri(null);
  };

  const onSave = async () => {
    const trimmed = name.trim();

    if (!trimmed) {
      Alert.alert("Błąd", "Podaj nazwę produktu.");
      return;
    }
    if (!isValidDateYYYYMMDD(expiryDate)) {
      Alert.alert("Błąd", "Podaj datę w formacie RRRR-MM-DD (np. 2026-01-17).");
      return;
    }

    try {
      // edycja -> anuluj stare powiadomienie
      if (editId) {
        const old = await getProductById(editId);
        await cancelNotification(old?.notificationId ?? null);
      }

      // zaplanuj nowe
      const notificationId = await scheduleExpiryNotification({
        name: trimmed,
        expiryDate,
      });

      if (editId) {
        await updateProduct(editId, {
          name: trimmed,
          expiryDate,
          description,
          photoUri,
          notificationId,
        });
      } else {
        await addProduct({
          name: trimmed,
          expiryDate,
          description,
          photoUri,
          notificationId,
        });
      }

      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert("Błąd", "Nie udało się zapisać produktu.");
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text>Nazwa *</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="np. Jogurt naturalny"
        style={{ borderWidth: 1, borderRadius: 10, padding: 10 }}
      />

      <Text>Data ważności * (RRRR-MM-DD)</Text>
      <TextInput
        value={expiryDate}
        onChangeText={setExpiryDate}
        placeholder="2026-01-17"
        style={{ borderWidth: 1, borderRadius: 10, padding: 10 }}
      />

      <Text>Opis</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="np. 2 sztuki, lodówka"
        multiline
        style={{ borderWidth: 1, borderRadius: 10, padding: 10, minHeight: 80 }}
      />

      <View style={{ gap: 10 }}>
        <Button title={photoUri ? "Zmień zdjęcie" : "Dodaj zdjęcie"} onPress={onPickPhoto} />
        {photoUri ? (
          <>
            <Image
              source={{ uri: photoUri }}
              style={{ width: "100%", height: 180, borderRadius: 12 }}
              resizeMode="cover"
            />
            <Button title="Usuń zdjęcie" onPress={onRemovePhoto} />
          </>
        ) : null}
      </View>

      <Button
        title={editId ? "Zapisz zmiany" : "Dodaj produkt"}
        onPress={onSave}
      />
    </View>
  );
}
