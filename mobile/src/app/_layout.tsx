import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SavedProvider } from "@/lib/saved";
import { SettingsProvider, useSettings } from "@/lib/settings";

function RootNavigator() {
  const { theme, t, ready } = useSettings();
  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.header,
        }}
      >
        <ActivityIndicator color={theme.headerText} />
      </View>
    );
  }
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.header },
          headerTintColor: theme.headerText,
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: theme.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="chua/[slug]" options={{ title: "" }} />
        <Stack.Screen name="le-hoi" options={{ title: t.festivalsTitle }} />
        <Stack.Screen name="hanh-trinh" options={{ title: t.routesTitle }} />
        <Stack.Screen name="gioi-thieu" options={{ title: t.navAbout }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <SavedProvider>
          <RootNavigator />
        </SavedProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
