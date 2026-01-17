import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { getSettings, saveSettings } from "../storage/settings";

import { apiListProducts } from "../api/productsApi";
import { upsertRemoteProduct } from "../storage/productsRepo";
import { getApiBaseUrl, setApiBaseUrl, apiFetch } from "../api/client";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function SettingsScreen() {
  // powiadomienia
  const [daysBefore, setDaysBefore] = useState("2");
  const [hour, setHour] = useState("9");
  const [minute, setMinute] = useState("0");

  // api url
  const [apiUrl, setApiUrl] = useState("");
  const [syncInfo, setSyncInfo] = useState("");

  useEffect(() => {
    (async () => {
      const s = await getSettings();
      setDaysBefore(String(s.daysBefore));
      setHour(String(s.hour));
      setMinute(String(s.minute));

      const url = await getApiBaseUrl();
      setApiUrl(url);
    })();
  }, []);

  const onSaveNotif = async () => {
    const d = clamp(parseInt(daysBefore, 10) || 0, 0, 30);
    const h = clamp(parseInt(hour, 10) || 0, 0, 23);
    const m = clamp(parseInt(minute, 10) || 0, 0, 59);

    await saveSettings({ daysBefore: d, hour: h, minute: m });

    Alert.alert(
      "Zapisano",
      `Powiadomienia: ${d} dni przed o ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
    );
  };

  const onSaveApiUrl = async () => {
    try {
      const saved = await setApiBaseUrl(apiUrl);
      setApiUrl(saved);
      Alert.alert("Zapisano", `Adres serwera ustawiony na:\n${saved}`);
    } catch (e) {
      Alert.alert("Błąd", String(e?.message || e));
    }
  };

  const onTestApi = async () => {
    try {
      setSyncInfo("Test połączenia...");
      const health = await apiFetch("/health");
      setSyncInfo(`OK: ${JSON.stringify(health)}`);
      Alert.alert("Połączenie OK", "Serwer odpowiada na /health");
    } catch (e) {
      setSyncInfo("Błąd połączenia");
      Alert.alert("Błąd", String(e?.message || e));
    }
  };

  // PULL sync
  const onSync = async () => {
    try {
      setSyncInfo("Pobieranie danych z serwera...");
      const remote = await apiListProducts();

      for (let i = 0; i < remote.length; i++) {
        await upsertRemoteProduct(remote[i]);
      }

      setSyncInfo(`Synchronizacja OK. Pobrano ${remote.length} produktów.`);
      Alert.alert("Synchronizacja", `Pobrano ${remote.length} produktów z serwera.`);
    } catch (e) {
      console.error(e);
      setSyncInfo("Błąd synchronizacji");
      Alert.alert("Błąd", String(e?.message || e));
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>Ustawienia powiadomień</Text>

      <Text>Ile dni przed terminem ważności?</Text>
      <TextInput
        value={daysBefore}
        onChangeText={setDaysBefore}
        keyboardType="number-pad"
        style={{ borderWidth: 1, borderRadius: 10, padding: 10 }}
      />

      <Text>Godzina (0–23)</Text>
      <TextInput
        value={hour}
        onChangeText={setHour}
        keyboardType="number-pad"
        style={{ borderWidth: 1, borderRadius: 10, padding: 10 }}
      />

      <Text>Minuta (0–59)</Text>
      <TextInput
        value={minute}
        onChangeText={setMinute}
        keyboardType="number-pad"
        style={{ borderWidth: 1, borderRadius: 10, padding: 10 }}
      />

      <Button title="Zapisz ustawienia powiadomień" onPress={onSaveNotif} />

      <View style={{ height: 16 }} />

      <Text style={{ fontSize: 18, fontWeight: "700" }}>Adres serwera (REST API)</Text>
      <TextInput
        value={apiUrl}
        onChangeText={setApiUrl}
        placeholder="https://foodsaver-dawid.loca.lt"
        autoCapitalize="none"
        style={{ borderWidth: 1, borderRadius: 10, padding: 10 }}
      />
      <Button title="Zapisz adres serwera" onPress={onSaveApiUrl} />
      <Button title="Test połączenia (/health)" onPress={onTestApi} />

      <View style={{ height: 16 }} />

      <Text style={{ fontSize: 18, fontWeight: "700" }}>Synchronizacja</Text>
      <Button title="Pobierz dane z serwera (REST API)" onPress={onSync} />

      {syncInfo ? <Text style={{ marginTop: 8 }}>{syncInfo}</Text> : null}
    </View>
  );
}
