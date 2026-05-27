import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  ImageBackground,
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
  const lift = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(lift, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, lift]);

  useEffect(() => {
    if (!loading && session) {
      const t = setTimeout(() => {
        router.replace("/(tabs)/home");
      }, 900);
      return () => clearTimeout(t);
    }
  }, [loading, session, router]);

  const handleBegin = () => {
    if (session) router.replace("/(tabs)/home");
    else router.push("/onboarding");
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ImageBackground
        source={undefined}
        style={styles.bg}
        imageStyle={styles.bgImage}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.55)", "rgba(13,26,13,0.85)", "#0D1A0D"]}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
          <Animated.View
            style={[
              styles.center,
              { opacity: fade, transform: [{ translateY: lift }] },
            ]}
          >
            <Text style={styles.flame}>🔥</Text>
            <Text style={styles.title}>Hearth</Text>
            <Text style={styles.subtitle}>
              A space for reflection, growth, and understanding
            </Text>
          </Animated.View>

          <Animated.View style={[styles.bottom, { opacity: fade }]}>
            <Pressable style={styles.cta} onPress={handleBegin}>
              <Text style={styles.ctaText}>
                {session ? "Continue" : "Begin Your Journey"}
              </Text>
            </Pressable>
            <Text style={styles.footer}>Quiet within. Clarity ahead.</Text>
          </Animated.View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },
  bg: { flex: 1, backgroundColor: Colors.bg.primary },
  bgImage: { opacity: 0.4 },
  safe: { flex: 1, paddingHorizontal: 24, justifyContent: "space-between" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  flame: { fontSize: 80, marginBottom: 12 },
  title: {
    color: Colors.text.primary,
    fontSize: 44,
    fontWeight: "300",
    letterSpacing: 2,
    marginBottom: 12,
  },
  subtitle: {
    color: Colors.text.muted,
    fontSize: 15,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 22,
  },
  bottom: { paddingBottom: 24, alignItems: "center" },
  cta: {
    backgroundColor: Colors.accent.primary,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 50,
    shadowColor: Colors.accent.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  footer: {
    color: Colors.text.muted,
    fontSize: 12,
    marginTop: 18,
    letterSpacing: 1,
  },
});
