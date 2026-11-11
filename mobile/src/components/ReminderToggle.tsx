import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, StyleSheet, Switch, View } from "react-native";
import { AppText } from "@/components/Text";
import { Card } from "@/components/ui";
import { useOfferings } from "@/lib/offerings";
import { useSettings } from "@/lib/settings";
import { space } from "@/lib/theme";

export function ReminderToggle({ inset = true }: { inset?: boolean }) {
  const { t, theme } = useSettings();
  const { reminders, setReminders } = useOfferings();
  const [busy, setBusy] = useState(false);

  const onChange = async (on: boolean) => {
    setBusy(true);
    const ok = await setReminders(on);
    setBusy(false);
    if (!ok) Alert.alert(t.offer.remindersTitle, t.offer.remindersDenied);
  };

  return (
    <Card
      style={[
        styles.card,
        inset ? { marginHorizontal: space.screen } : null,
        { borderColor: theme.line },
      ]}
      tone="soft"
    >
      <Ionicons
        name="notifications-outline"
        size={20}
        color={theme.primaryText}
      />
      <View style={{ flex: 1 }}>
        <AppText variant="h3">{t.offer.remindersTitle}</AppText>
        <AppText variant="bodyS" tone="text2">
          {t.offer.remindersText}
        </AppText>
      </View>
      <Switch
        value={reminders}
        disabled={busy}
        onValueChange={onChange}
        trackColor={{ true: theme.primary, false: theme.line }}
        thumbColor="#fff"
        accessibilityLabel={t.offer.remindersTitle}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1 },
});
