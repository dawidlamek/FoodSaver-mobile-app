import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { getSettings } from "../storage/settings";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const ANDROID_CHANNEL_ID = "expiry-reminders";

export async function requestNotificationPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: "Przypomnienia o ważności",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  return status === "granted";
}

export async function scheduleExpiryNotification(product) {
  const { name, expiryDate } = product;

  const settings = await getSettings();
  const DAYS_BEFORE = Number(settings.daysBefore ?? 2);
  const HOUR = Number(settings.hour ?? 9);
  const MINUTE = Number(settings.minute ?? 0);

  // expiryDate = "YYYY-MM-DD" -> lokalna data
  const [y, m, d] = expiryDate.split("-").map((x) => Number(x));
  const expiry = new Date(y, m - 1, d);

  const notifyDate = new Date(expiry);
  notifyDate.setDate(expiry.getDate() - DAYS_BEFORE);
  notifyDate.setHours(HOUR, MINUTE, 0, 0);

  if (notifyDate <= new Date()) {
    return null;
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "FoodSaver ⏰",
      body: `Produkt "${name}" wkrótce traci ważność`,
      sound: true,
    },
    trigger: Platform.select({
      ios: { type: "date", date: notifyDate },
      android: { type: "date", date: notifyDate, channelId: ANDROID_CHANNEL_ID },
      default: { type: "date", date: notifyDate },
    }),
  });

  return id;
}

export async function cancelNotification(notificationId) {
  if (!notificationId) return;
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
