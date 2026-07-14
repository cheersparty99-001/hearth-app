import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  ImageBackground,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/colors";
import { useAuth } from "../context/AuthContext";

export default function SplashScreen() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const fade = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0.8,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fade, float, glow]);

  useEffect(() => {
    if (!loading && session) {
      const t = setTimeout(() => router.replace("/(tabs)/home"), 900);
      return () => clearTimeout(t);
    }
  }, [loading, session, router]);

  const handleBegin = () => {
    if (session) router.replace("/(tabs)/home");
    else router.push("/onboarding");
  };

  const translateY = float.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ImageBackground
        source={require("../assets/images/splash-bg.png")}
        style={styles.bg}
        imageStyle={styles.bgImage}
      >
        <LinearGradient
          colors={[
            "rgba(9,22,10,0.4)",
            "rgba(9,22,10,0)",
            "rgba(9,22,10,0.95)",
          ]}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
        />

        <Animated.View
          style={[
            styles.emberGlow,
            { opacity: glow, transform: [{ scale: glow }] },
          ]}
        />

        <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
          <Animated.View
            style={[
              styles.center,
              { opacity: fade, transform: [{ translateY }] },
            ]}
          >
            <View style={styles.flame}>
              <Ionicons name="flame" size={56} color={Colors.accent.light} />
            </View>
            <Text style={styles.title}>Hearth</Text>
            <Text style={styles.subtitle}>
              Understand. Heal. Grow.{"\n"}
              <Text style={styles.subtitleAccent}>You, at your core.</Text>
            </Text>
          </Animated.View>

          <View style={styles.spacer} />

          <Animated.View style={[styles.bottom, { opacity: fade }]}>
            <Pressable style={styles.cta} onPress={handleBegin}>
              <Text style={styles.ctaText}>
                {session ? "Continue" : "Start Your Journey"}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={Colors.accent.onPrimary}
              />
            </Pressable>

            <View style={styles.anchor}>
              <Text style={styles.anchorText}>
                YOUR JOURNEY INWARD BEGINS HERE
              </Text>
              <View style={styles.dots}>
                <View style={[styles.dot, styles.dotActive]} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
            </View>
          </Animated.View>
        </SafeAreaView>

        <View style={styles.audioBtnWrap}>
          <Pressable style={styles.audioBtn}>
            <Ionicons
              name="volume-high-outline"
              size={20}
              color={Colors.text.secondary}
            />
          </Pressable>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },
  bg: { flex: 1, backgroundColor: Colors.bg.primary },
  bgImage: { opacity: 1 },
  emberGlow: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 384,
    height: 384,
    marginLeft: -192,
    marginTop: -192,
    borderRadius: 192,
    backgroundColor: "rgba(200, 129, 58, 0.2)",
  },
  safe: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 16,
    alignItems: "center",
  },
  center: {
    alignItems: "center",
    marginTop: 48,
  },
  flame: {
    marginBottom: 16,
    shadowColor: Colors.accent.light,
    shadowOpacity: 0.6,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 0 },
  },
  title: {
    color: "#ffdcc0",
    fontSize: 48,
    lineHeight: 56,
    letterSpacing: -0.96,
    marginBottom: 8,
    fontFamily: "Literata_700Bold",
    textShadowColor: "rgba(255, 184, 118, 0.3)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  subtitle: {
    color: Colors.text.secondary,
    fontSize: 18,
    lineHeight: 28,
    textAlign: "center",
    maxWidth: 280,
    opacity: 0.9,
    fontFamily: "DMSans_400Regular",
  },
  subtitleAccent: {
    color: Colors.accent.light,
    fontFamily: "DMSans_500Medium",
  },
  spacer: { flex: 1 },
  bottom: {
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    marginBottom: 16,
  },
  cta: {
    width: "100%",
    backgroundColor: Colors.accent.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 9999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: Colors.accent.primary,
    shadowOpacity: 0.3,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  ctaText: {
    color: Colors.accent.onPrimary,
    fontSize: 14,
    fontFamily: "DMSans_500Medium",
    fontWeight: "700",
    letterSpacing: 0.7,
  },
  anchor: {
    marginTop: 32,
    alignItems: "center",
    opacity: 0.8,
    gap: 8,
  },
  anchorText: {
    color: Colors.text.secondary,
    fontSize: 14,
    fontFamily: "DMSans_500Medium",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  dots: {
    flexDirection: "row",
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  dotActive: {
    backgroundColor: Colors.accent.primary,
    shadowColor: Colors.accent.primary,
    shadowOpacity: 1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
  },
  audioBtnWrap: {
    position: "absolute",
    bottom: 24,
    left: 24,
  },
  audioBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(18, 31, 17, 0.4)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
});
