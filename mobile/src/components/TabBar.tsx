import { Ionicons } from "@expo/vector-icons";
import type { Tabs } from "expo-router";
import { useEffect, useState, type ComponentProps } from "react";
import { Animated, Platform, Pressable, StyleSheet, View } from "react-native";
import * as haptics from "@/lib/haptics";
import { useSettings } from "@/lib/settings";
import { MiniPlayer } from "./Player";
import { AppText } from "./Text";
import type { IconName } from "./ui";

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];

export interface TabMeta {
  icon: IconName;
  iconActive: IconName;
  label: string;
}

export function TabBar({
  state,
  navigation,
  insets,
  tabs,
}: TabBarProps & { tabs: Record<string, TabMeta> }) {
  const { theme } = useSettings();
  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}
    >
      <MiniPlayer />
      <View
        accessibilityRole="tablist"
        style={[
          styles.bar,
          { backgroundColor: theme.tabBar, borderColor: theme.line },
          theme.shadowLg,
        ]}
      >
        {state.routes.map((route, index) => {
          const meta = tabs[route.name];
          if (!meta) return null;
          const focused = state.index === index;
          return (
            <TabItem
              key={route.key}
              meta={meta}
              focused={focused}
              onPress={() => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  haptics.select();
                  navigation.navigate(route.name);
                }
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

function TabItem({
  meta,
  focused,
  onPress,
}: {
  meta: TabMeta;
  focused: boolean;
  onPress: () => void;
}) {
  const { theme } = useSettings();
  const [anim] = useState(() => new Animated.Value(focused ? 1 : 0));
  useEffect(() => {
    Animated.spring(anim, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      damping: 16,
      stiffness: 200,
    }).start();
  }, [focused, anim]);
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -1] });
  const color = focused ? theme.primaryText : theme.text3;
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={meta.label}
      onPress={onPress}
      style={styles.item}
    >
      <Animated.View
        style={[
          styles.iconWrap,
          { backgroundColor: focused ? theme.primarySoft : "transparent" },
          { transform: [{ scale }, { translateY }] },
        ]}
      >
        <Ionicons name={focused ? meta.iconActive : meta.icon} size={22} color={color} />
      </Animated.View>
      <AppText
        variant="caption"
        weight={focused ? 700 : 500}
        color={color}
        numberOfLines={1}
        style={{ fontSize: 10.5, lineHeight: 13 }}
      >
        {meta.label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 14,
  },
  bar: {
    flexDirection: "row",
    borderRadius: 26,
    borderWidth: Platform.OS === "android" ? 1 : StyleSheet.hairlineWidth,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: 3,
    minHeight: 54,
    justifyContent: "center",
  },
  iconWrap: {
    width: 44,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
});
