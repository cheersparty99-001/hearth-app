import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../../constants/colors";

const DURATION_SECONDS = 12 * 60 + 48;
const INITIAL_SECONDS = 5 * 60 + 32;

function formatTime(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function Meditation() {
  const [elapsed, setElapsed] = useState(INITIAL_SECONDS);
  const [playing, setPlaying] = useState(true);
  const [favorited, setFavorited] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulse]);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setElapsed((e) => (e >= DURATION_SECONDS ? 0 : e + 1));
    }, 1000);
    return () => clearInterval(t);
  }, [playing]);

  const progress = elapsed / DURATION_SECONDS;
  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <Pressable hitSlop={10}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={Colors.text.secondary}
            />
          </Pressable>
          <Text style={styles.headerEyebrow}>GUIDED MEDITATION</Text>
          <View style={styles.headerRight}>
            <Pressable
              hitSlop={10}
              onPress={() => setFavorited((f) => !f)}
            >
              <Ionicons
                name={favorited ? "heart" : "heart-outline"}
                size={24}
                color={
                  favorited
                    ? Colors.accent.light
                    : Colors.text.secondary
                }
              />
            </Pressable>
            <Pressable hitSlop={10}>
              <Ionicons
                name="ellipsis-vertical"
                size={24}
                color={Colors.text.secondary}
              />
            </Pressable>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.artworkBlock}>
            <Animated.View
              style={[
                styles.playerCircle,
                { transform: [{ scale: pulseScale }] },
              ]}
            >
              <LinearGradient
                colors={[
                  "rgba(200, 129, 58, 0.2)",
                  "transparent",
                ]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.imageOuter}>
                <View style={styles.imageInner}>
                  <Image
                    source={require("../../assets/images/meditation-bg.png")}
                    style={styles.image}
                  />
                  <View style={styles.progressArcWrap} pointerEvents="none">
                    <View style={styles.progressArc} />
                  </View>
                  <View style={styles.progressDot} />
                </View>
              </View>
            </Animated.View>

            <View style={styles.titleBlock}>
              <Text style={styles.title}>Forest at Dusk</Text>
              <Text style={styles.subtitle}>
                A calming journey to help you release the day and return to
                your center.
              </Text>
            </View>
          </View>

          <View style={styles.chapter}>
            <Text style={styles.chapterLabel}>Chapter 2 of 5</Text>
            <Text style={styles.chapterTitle}>Letting Go</Text>
          </View>

          <View style={styles.progress}>
            <View style={styles.progressBg}>
              <LinearGradient
                colors={[Colors.accent.light, Colors.accent.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${progress * 100}%` }]}
              />
            </View>
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{formatTime(elapsed)}</Text>
              <Text style={styles.timeText}>{formatTime(DURATION_SECONDS)}</Text>
            </View>
          </View>

          <View style={styles.transport}>
            <Pressable
              hitSlop={10}
              onPress={() => setElapsed((e) => Math.max(0, e - 10))}
            >
              <Ionicons
                name="refresh"
                size={32}
                color={Colors.text.secondary}
                style={{ transform: [{ scaleX: -1 }] }}
              />
            </Pressable>
            <View style={styles.transportCenter}>
              <Pressable hitSlop={10}>
                <Ionicons
                  name="play-skip-back"
                  size={36}
                  color={Colors.text.secondary}
                />
              </Pressable>
              <Pressable
                style={styles.playBtn}
                onPress={() => setPlaying((p) => !p)}
              >
                <LinearGradient
                  colors={[Colors.accent.light, Colors.accent.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Ionicons
                  name={playing ? "pause" : "play"}
                  size={40}
                  color={Colors.accent.onPrimary}
                />
              </Pressable>
              <Pressable hitSlop={10}>
                <Ionicons
                  name="play-skip-forward"
                  size={36}
                  color={Colors.text.secondary}
                />
              </Pressable>
            </View>
            <Pressable
              hitSlop={10}
              onPress={() =>
                setElapsed((e) => Math.min(DURATION_SECONDS, e + 10))
              }
            >
              <Ionicons
                name="refresh"
                size={32}
                color={Colors.text.secondary}
              />
            </Pressable>
          </View>

          <View style={styles.actionsGrid}>
            <Pressable style={styles.actionItem}>
              <View style={styles.actionIcon}>
                <Ionicons
                  name="download-outline"
                  size={24}
                  color={Colors.text.secondary}
                />
              </View>
              <Text style={styles.actionLabel}>Download</Text>
            </Pressable>
            <Pressable style={styles.actionItem}>
              <View style={styles.actionIcon}>
                <Ionicons
                  name="add-circle-outline"
                  size={24}
                  color={Colors.text.secondary}
                />
              </View>
              <Text style={styles.actionLabel}>Playlist</Text>
            </Pressable>
            <Pressable style={styles.actionItem}>
              <View style={styles.actionIcon}>
                <Ionicons
                  name="timer-outline"
                  size={24}
                  color={Colors.text.secondary}
                />
              </View>
              <Text style={styles.actionLabel}>Timer</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },
  safe: { flex: 1 },
  header: {
    height: 64,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerEyebrow: {
    color: Colors.text.secondary,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    opacity: 0.6,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 16 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 140,
    alignItems: "center",
  },
  artworkBlock: {
    alignItems: "center",
    width: "100%",
    maxWidth: 420,
    marginTop: 16,
    marginBottom: 32,
  },
  playerCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: Colors.accent.primary,
    shadowOpacity: 0.15,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
  },
  imageOuter: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "rgba(255, 184, 118, 0.2)",
    padding: 4,
    overflow: "hidden",
  },
  imageInner: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: Colors.bg.secondary,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  progressArcWrap: {
    ...StyleSheet.absoluteFillObject,
    transform: [{ rotate: "-45deg" }],
  },
  progressArc: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: "rgba(255, 184, 118, 0.4)",
    borderTopColor: "transparent",
    borderLeftColor: "transparent",
  },
  progressDot: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.accent.light,
    right: 15,
    bottom: 60,
    shadowColor: Colors.accent.light,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  titleBlock: {
    marginTop: 40,
    alignItems: "center",
  },
  title: {
    color: Colors.text.primary,
    fontSize: 28,
    lineHeight: 36,
    fontFamily: "Lora_700Bold",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.text.secondary,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    maxWidth: 280,
    opacity: 0.8,
    fontFamily: "Inter_400Regular",
  },
  chapter: {
    alignItems: "center",
    opacity: 0.6,
    marginBottom: 32,
  },
  chapterLabel: {
    color: Colors.secondary,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.7,
  },
  chapterTitle: {
    color: Colors.text.primary,
    fontSize: 24,
    lineHeight: 32,
    fontFamily: "Lora_600SemiBold",
    marginTop: 4,
  },
  progress: {
    width: "100%",
    maxWidth: 420,
    gap: 12,
    marginBottom: 32,
  },
  progressBg: {
    width: "100%",
    height: 4,
    backgroundColor: Colors.bg.card,
    borderRadius: 9999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 9999,
    shadowColor: Colors.accent.light,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeText: {
    color: Colors.text.secondary,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.7,
  },
  transport: {
    width: "100%",
    maxWidth: 420,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  transportCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 40,
  },
  playBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: Colors.accent.primary,
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  actionsGrid: {
    width: "100%",
    maxWidth: 420,
    marginTop: 48,
    paddingTop: 32,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    flexDirection: "row",
  },
  actionItem: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    color: Colors.text.secondary,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.7,
    opacity: 0.6,
  },
});
