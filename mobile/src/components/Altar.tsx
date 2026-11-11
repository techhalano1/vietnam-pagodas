import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import type { OfferItem } from "@/lib/i18n";

const STICK_H = 64;
const TABLE_H = 74;
const BOWL_H = 34;

function useLoop(duration: number, delay = 0) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.set(
      withDelay(
        delay,
        withRepeat(
          withTiming(1, { duration, easing: Easing.linear }),
          -1,
          false,
        ),
      ),
    );
    return () => cancelAnimation(v);
  }, [v, duration, delay]);
  return v;
}

function Flame({ size = 1 }: { size?: number }) {
  const v = useLoop(900);
  const style = useAnimatedStyle(() => ({
    transform: [
      { scaleY: interpolate(v.get(), [0, 0.5, 1], [0.92, 1.1, 0.92]) },
    ],
  }));
  return (
    <Animated.View style={[{ alignItems: "center" }, style]}>
      <View
        style={[styles.flameOuter, { width: 12 * size, height: 20 * size }]}
      >
        <View
          style={[styles.flameInner, { width: 5 * size, height: 10 * size }]}
        />
      </View>
    </Animated.View>
  );
}

function Wisp({ delay, drift }: { delay: number; drift: number }) {
  const v = useLoop(3600, delay);
  const style = useAnimatedStyle(() => {
    const t = v.get();
    return {
      opacity: interpolate(t, [0, 0.12, 0.6, 1], [0, 0.4, 0.2, 0]),
      transform: [
        { translateY: interpolate(t, [0, 1], [0, -170]) },
        { translateX: interpolate(t, [0, 0.5, 1], [0, drift, -drift / 2]) },
        { scaleX: interpolate(t, [0, 1], [0.6, 3]) },
        { scaleY: interpolate(t, [0, 1], [1, 1.8]) },
      ],
    };
  });
  return <Animated.View pointerEvents="none" style={[styles.wisp, style]} />;
}

function stickHeight(remaining: number) {
  return 18 + (STICK_H - 18) * Math.max(0, Math.min(1, remaining));
}

function Stick({
  angle,
  remaining,
  lit,
}: {
  angle: number;
  remaining: number;
  lit: boolean;
}) {
  const h = stickHeight(remaining);
  return (
    <View style={[styles.stick, { transform: [{ rotate: `${angle}deg` }] }]}>
      <View style={[styles.ember, { opacity: lit ? 1 : 0 }]} />
      <View style={{ width: 3, height: h - 14, backgroundColor: "#7A4A2A" }} />
      <View style={{ width: 3, height: 14, backgroundColor: "#C0262D" }} />
    </View>
  );
}

function Candle({ lit }: { lit: boolean }) {
  return (
    <View style={{ alignItems: "center" }}>
      <View style={{ height: 22, justifyContent: "flex-end" }}>
        {lit ? <Flame /> : null}
      </View>
      <View style={{ width: 2, height: 4, backgroundColor: "#3A2A1A" }} />
      <LinearGradient colors={["#E53935", "#A01818"]} style={styles.candle} />
      <View style={styles.candleBase} />
    </View>
  );
}

function Flowers() {
  const petals = ["#F48FB1", "#F06292", "#FFF0F5", "#F48FB1", "#EC407A"];
  return (
    <View style={{ alignItems: "center" }}>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          width: 40,
          justifyContent: "center",
        }}
      >
        {petals.map((c, i) => (
          <View
            key={i}
            style={[
              styles.bloom,
              { backgroundColor: c, marginTop: i > 2 ? -6 : 0 },
            ]}
          />
        ))}
      </View>
      <View style={{ width: 2, height: 12, backgroundColor: "#4E7D3A" }} />
      <LinearGradient colors={["#F5E6B8", "#C9A24A"]} style={styles.vase} />
    </View>
  );
}

function Fruit() {
  const fruits = ["#F57C00", "#FBC02D", "#7CB342", "#F57C00", "#E53935"];
  return (
    <View style={{ alignItems: "center" }}>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          width: 46,
          justifyContent: "center",
        }}
      >
        {fruits.map((c, i) => (
          <View
            key={i}
            style={[
              styles.fruit,
              { backgroundColor: c, marginTop: i > 2 ? -5 : 0 },
            ]}
          />
        ))}
      </View>
      <View style={styles.plate} />
      <View style={styles.plateFoot} />
    </View>
  );
}

function Water() {
  return (
    <View style={{ alignItems: "center" }}>
      <LinearGradient colors={["#E3F2FD", "#90CAF9"]} style={styles.cup} />
      <View style={styles.cupFoot} />
    </View>
  );
}

export function Altar({
  items,
  sticks,
  remaining,
  height = 380,
}: {
  items: OfferItem[];
  sticks: 1 | 3;
  /** 0..1 fraction of incense left; null when nothing is burning. */
  remaining: number | null;
  height?: number;
}) {
  const lit = remaining !== null && remaining > 0;
  const has = (k: OfferItem) => items.includes(k);
  const angles = sticks === 3 ? [-9, 0, 9] : [0];
  return (
    <LinearGradient
      colors={["#FFFDF7", "#FDF0CC", "#F6DE9E"]}
      style={[styles.scene, { height }]}
    >
      <View style={styles.halo} />
      <Image
        source={require("../../assets/quan-am.png")}
        style={styles.figure}
        contentFit="contain"
        accessibilityIgnoresInvertColors
      />
      <View style={styles.tableTop}>
        <Candle lit={has("den")} />
        {has("hoa") ? <Flowers /> : <View style={{ width: 40 }} />}
        {has("nuoc") ? <Water /> : <View style={{ width: 20 }} />}
        <View style={{ alignItems: "center" }}>
          <View style={styles.sticks}>
            {remaining !== null
              ? angles.map((a) => (
                  <Stick key={a} angle={a} remaining={remaining} lit={lit} />
                ))
              : null}
          </View>
          <LinearGradient colors={["#D9A441", "#8B5A1B"]} style={styles.bowl}>
            <View style={styles.bowlRim} />
          </LinearGradient>
        </View>
        {has("qua") ? <Fruit /> : <View style={{ width: 46 }} />}
        <View style={{ width: 20 }} />
        <Candle lit={has("den")} />
      </View>
      {lit ? (
        <View
          pointerEvents="none"
          style={[
            styles.smoke,
            { bottom: TABLE_H + BOWL_H - 12 + stickHeight(remaining) },
          ]}
        >
          <Wisp delay={0} drift={10} />
          <Wisp delay={700} drift={-12} />
          <Wisp delay={1400} drift={6} />
          <Wisp delay={2100} drift={-8} />
          <Wisp delay={2800} drift={12} />
        </View>
      ) : null}
      <LinearGradient colors={["#A31F1F", "#6E1010"]} style={styles.table}>
        <View style={styles.tableTrim} />
        <View style={styles.tablePanel} />
      </LinearGradient>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scene: {
    width: "100%",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  halo: {
    position: "absolute",
    top: 34,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: "rgba(255,214,102,0.35)",
    borderWidth: 2,
    borderColor: "rgba(212,160,23,0.35)",
  },
  figure: { position: "absolute", top: 24, width: 190, height: 270 },
  tableTop: {
    width: "100%",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    zIndex: 2,
  },
  table: { width: "100%", height: TABLE_H, alignItems: "center" },
  tableTrim: { width: "100%", height: 5, backgroundColor: "#D4A017" },
  tablePanel: {
    marginTop: 14,
    width: "62%",
    height: 34,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "rgba(212,160,23,0.7)",
  },
  sticks: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: STICK_H + 20,
    marginBottom: -12,
  },
  stick: {
    alignItems: "center",
    marginHorizontal: 1,
    transformOrigin: "bottom",
  },
  ember: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF6F00",
    shadowColor: "#FF6F00",
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  smoke: {
    position: "absolute",
    left: "50%",
    marginLeft: -45,
    width: 90,
    height: 170,
    zIndex: 3,
  },
  wisp: {
    position: "absolute",
    bottom: 0,
    left: 42,
    width: 6,
    height: 34,
    borderRadius: 3,
    backgroundColor: "rgb(150,140,132)",
  },
  bowl: {
    width: 74,
    height: 34,
    borderBottomLeftRadius: 37,
    borderBottomRightRadius: 37,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    alignItems: "center",
  },
  bowlRim: {
    width: 80,
    height: 6,
    borderRadius: 3,
    marginTop: -2,
    backgroundColor: "#E8C063",
  },
  candle: { width: 12, height: 44, borderRadius: 2 },
  candleBase: {
    width: 22,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D4A017",
  },
  flameOuter: {
    borderRadius: 999,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 999,
    backgroundColor: "#FFA726",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 2,
    transform: [{ rotate: "-45deg" }],
  },
  flameInner: { borderRadius: 999, backgroundColor: "#FFF59D" },
  bloom: { width: 14, height: 14, borderRadius: 7, marginHorizontal: -1 },
  vase: {
    width: 22,
    height: 30,
    borderRadius: 10,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  fruit: { width: 15, height: 15, borderRadius: 8, marginHorizontal: -0.5 },
  plate: { width: 52, height: 6, borderRadius: 3, backgroundColor: "#D4A017" },
  plateFoot: {
    width: 18,
    height: 14,
    backgroundColor: "#B8860B",
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  cup: {
    width: 18,
    height: 20,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  cupFoot: {
    width: 12,
    height: 5,
    backgroundColor: "#D4A017",
    borderRadius: 2,
  },
});
