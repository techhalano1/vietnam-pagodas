import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSettings } from "@/lib/settings";

export default function TabLayout() {
  const { theme, t } = useSettings();
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.header },
        headerTintColor: theme.headerText,
        headerTitleStyle: { fontWeight: "700" },
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
        },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.muted,
        sceneStyle: { backgroundColor: theme.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabExplore,
          headerTitle: t.siteName,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: t.tabMap,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: t.tabSaved,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: t.tabMore,
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="ellipsis-horizontal-circle"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
