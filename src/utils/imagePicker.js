import * as ImagePicker from "expo-image-picker";

export async function pickImageFromLibrary() {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    return { ok: false, error: "Brak uprawnień do galerii." };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
    allowsEditing: true,
  });

  if (result.canceled) return { ok: false, canceled: true };

  const uri = result.assets?.[0]?.uri ?? null;
  if (!uri) return { ok: false, error: "Nie udało się pobrać URI zdjęcia." };

  return { ok: true, uri };
}
