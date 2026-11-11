import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { Dict } from "./i18n";
import { holidaysOn, solarToLunar } from "./lunar";

const CHANNEL = "lunar-reminders";
const DAYS_AHEAD = 60;
const HOUR = 6;
const MINUTE = 30;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestReminderPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  // Android reports canAskAgain=false before the first prompt; the OS no-ops if truly blocked.
  const granted =
    current.granted || (await Notifications.requestPermissionsAsync()).granted;
  if (granted && Platform.OS === "android") {
    // Channel creation is rejected until POST_NOTIFICATIONS is granted.
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: "Mùng 1 – rằm",
      importance: Notifications.AndroidImportance.DEFAULT,
    }).catch(() => undefined);
  }
  return granted;
}

/** Reminders for the coming 1st/15th lunar days and Buddhist holidays (one-off DATE triggers). */
export function upcomingReminders(t: Dict, from = new Date()) {
  const out: { date: Date; title: string; body: string }[] = [];
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const date = new Date(
      from.getFullYear(),
      from.getMonth(),
      from.getDate() + i,
      HOUR,
      MINUTE,
    );
    if (date <= from) continue;
    const l = solarToLunar(
      date.getDate(),
      date.getMonth() + 1,
      date.getFullYear(),
    );
    const holiday = holidaysOn(l).find((h) => h.kind === "buddhist");
    const base =
      l.day === 1
        ? t.offer.reminderMung1(l.month)
        : l.day === 15
          ? t.offer.reminderRam(l.month)
          : null;
    if (!base && !holiday) continue;
    const title = holiday ? holiday.vi : (base as string);
    out.push({
      date,
      title,
      body: t.offer.reminderBody(holiday && base ? base : t.offer.homeTitle),
    });
  }
  return out;
}

export async function scheduleReminders(t: Dict): Promise<number> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const items = upcomingReminders(t);
  for (const r of items) {
    await Notifications.scheduleNotificationAsync({
      content: { title: r.title, body: r.body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: r.date,
        channelId: CHANNEL,
      },
    });
  }
  return items.length;
}

export async function cancelReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
