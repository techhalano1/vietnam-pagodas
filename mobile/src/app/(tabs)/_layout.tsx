import { Tabs } from "expo-router";
import { TabBar, type TabMeta } from "@/components/TabBar";
import { useSettings } from "@/lib/settings";

export default function TabLayout() {
  const { theme, t } = useSettings();
  const tabs: Record<string, TabMeta> = {
    index: { icon: "home-outline", iconActive: "home", label: t.tabHome },
    chua: { icon: "search-outline", iconActive: "search", label: t.tabPagodas },
    kinh: { icon: "book-outline", iconActive: "book", label: t.tabScriptures },
    lich: { icon: "calendar-outline", iconActive: "calendar", label: t.tabCalendar },
    "ca-nhan": { icon: "person-outline", iconActive: "person", label: t.tabProfile },
  };
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} tabs={tabs} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t.tabHome }} />
      <Tabs.Screen name="chua" options={{ title: t.tabPagodas }} />
      <Tabs.Screen name="kinh" options={{ title: t.tabScriptures }} />
      <Tabs.Screen name="lich" options={{ title: t.tabCalendar }} />
      <Tabs.Screen name="ca-nhan" options={{ title: t.tabProfile }} />
    </Tabs>
  );
}
