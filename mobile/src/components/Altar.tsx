import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import type { OfferItem } from "@/lib/i18n";

const STICK_H = 64;

function useLoop(duration: number, delay = 0) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [v, duration, delay]);
  return v;
}

function Flame({ size = 1 }: { size?: number }) {
  const v = useLoop(900);
  const scale = v.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.92, 1.1, 0.92],
  });
  return (
    <Animated.View
      style={{ transform: [{ scaleY: scale }], alignItems: "center" }}
    >
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
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wisp,
        {
          opacity: v.interpolate({
            inputRange: [0, 0.15, 0.7, 1],
            outputRange: [0, 0.55, 0.25, 0],
          }),
          transform: [
            {
              translateY: v.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -150],
              }),
            },
            {
              translateX: v.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, drift, -drift / 2],
              }),
            },
            {
              scale: v.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 2.2],
              }),
            },
          ],
        },
      ]}
    />
  );
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
  const h = 18 + (STICK_H - 18) * Math.max(0, Math.min(1, remaining));
  return (
    <View style={[styles.stick, { transform: [{ rotate: `${angle}deg` }] }]}>
      {lit ? (
        <View
          style={{ position: "absolute", bottom: h + 14, alignItems: "center" }}
        >
          <Wisp delay={0} drift={10} />
          <Wisp delay={1200} drift={-12} />
          <Wisp delay={2400} drift={6} />
        </View>
      ) : null}
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
  table: { width: "100%", height: 74, alignItems: "center" },
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
  wisp: {
    position: "absolute",
    width: 10,
    height: 22,
    borderRadius: 10,
    backgroundColor: "rgba(170,160,150,0.55)",
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
