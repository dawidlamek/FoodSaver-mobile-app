import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "foodsaver_settings_v1";

const DEFAULTS = {
  daysBefore: 2,     // ile dni przed
  hour: 9,           // 0-23
  minute: 0,         // 0-59
};

export async function getSettings() {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return DEFAULTS;

  try {
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return DEFAULTS;
  }
}

export async function saveSettings(next) {
  const current = await getSettings();
  const merged = { ...current, ...next };
  await AsyncStorage.setItem(KEY, JSON.stringify(merged));
  return merged;
}
