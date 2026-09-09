import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PlayerProvider } from "@/lib/player";
import { ReadingProvider } from "@/lib/reading";
import { SavedProvider } from "@/lib/saved";
import { SettingsProvider, useSettings } from "@/lib/settings";

SplashScreen.preventAutoHideAsync().catch(() => undefined);
SplashScreen.setOptions({ duration: 400, fade: true });

function RootNavigator() {
  const { theme, t, ready, isDark } = useSettings();

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: "#FFFDF7" }} />;
  }
  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.bg },
          headerTintColor: theme.text,
          headerShadowVisible: false,
          headerTitleStyle: { fontFamily: "BeVietnamPro_700Bold", fontSize: 17 },
          headerBackButtonDisplayMode: "minimal",
          contentStyle: { backgroundColor: theme.bg },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="chua/[slug]" options={{ headerShown: false }} />
        <Stack.Screen name="kinh/[slug]" options={{ headerShown: false }} />
        <Stack.Screen name="da-luu" options={{ headerShown: false }} />
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
          <ReadingProvider>
            <PlayerProvider>
              <RootNavigator />
            </PlayerProvider>
          </ReadingProvider>
        </SavedProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
