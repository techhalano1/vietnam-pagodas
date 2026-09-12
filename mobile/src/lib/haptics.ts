import * as Haptics from "expo-haptics";

export function tap() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}

export function select() {
  Haptics.selectionAsync().catch(() => undefined);
}

export function success() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
    () => undefined,
  );
}
