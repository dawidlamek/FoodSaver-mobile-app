import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_API_URL = "foodsaver_api_url_v1";
const DEFAULT_URL = "https://foodsaver-dawid.loca.lt"; // <- tu wpisz swój stały subdomain

export async function getApiBaseUrl() {
  const saved = await AsyncStorage.getItem(KEY_API_URL);
  return saved || DEFAULT_URL;
}

export async function setApiBaseUrl(url) {
  const normalized = (url || "").trim().replace(/\/+$/, "");
  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    throw new Error("URL musi zaczynać się od http:// albo https://");
  }
  await AsyncStorage.setItem(KEY_API_URL, normalized);
  return normalized;
}

// timeout helper
function withTimeout(ms) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return { controller, cancel: () => clearTimeout(id) };
}

export async function apiFetch(path, options = {}) {
  const baseUrl = await getApiBaseUrl();
  const { controller, cancel } = withTimeout(12000);

  try {
    const res = await fetch(`${baseUrl}${path}`, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      signal: controller.signal,
      ...options,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`API ${res.status}: ${text}`);
    }

    return await res.json().catch(() => null);
  } catch (e) {
    if (String(e?.name) === "AbortError") {
      throw new Error("Timeout: serwer nie odpowiada (12s).");
    }
    throw e;
  } finally {
    cancel();
  }
}
