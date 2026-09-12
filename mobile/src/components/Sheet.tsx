import { useEffect, useState, type ReactNode } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettings } from "@/lib/settings";
import { radius, space } from "@/lib/theme";
import { AppText } from "./Text";
import { IconButton } from "./ui";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Fraction of the screen height the sheet may use (default 0.9). */
  maxHeight?: number;
  footer?: ReactNode;
}

export function Sheet({ open, onClose, title, children, maxHeight = 0.9, footer }: Props) {
  const { theme } = useSettings();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [progress] = useState(() => new Animated.Value(0));
  const [prevOpen, setPrevOpen] = useState(open);
  const [closing, setClosing] = useState(false);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) setClosing(true);
  }
  const visible = open || closing;

  useEffect(() => {
    if (open) {
      Animated.spring(progress, {
        toValue: 1,
        useNativeDriver: true,
        damping: 22,
        stiffness: 220,
        mass: 0.9,
      }).start();
    } else {
      Animated.timing(progress, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setClosing(false);
      });
    }
  }, [open, progress]);

  if (!visible) return null;

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [height, 0],
  });

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Animated.View
          style={[styles.backdrop, { backgroundColor: theme.overlay, opacity: progress }]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" />
        </Animated.View>
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.card,
              maxHeight: height * maxHeight,
              paddingBottom: Math.max(insets.bottom, 12),
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={[styles.grabber, { backgroundColor: theme.line }]} />
          {title ? (
            <View style={styles.head}>
              <AppText variant="h2" style={{ flex: 1 }}>
                {title}
              </AppText>
              <IconButton icon="close" onPress={onClose} size={34} />
            </View>
          ) : null}
          <View style={{ flexShrink: 1 }}>{children}</View>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  backdrop: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  sheet: {
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingTop: 8,
  },
  grabber: {
    alignSelf: "center",
    width: 40,
    height: 5,
    borderRadius: 3,
    marginBottom: 8,
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space.screen,
    paddingBottom: 8,
  },
  footer: { paddingHorizontal: space.screen, paddingTop: 12 },
});
