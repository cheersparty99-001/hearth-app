import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../../constants/colors";
import { QUESTIONS, DAILY_REFLECTION } from "../../constants/questions";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

function greetingForHour(h: number): string {
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState<string>("Friend");
  const [completed, setCompleted] = useState<number>(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: profile }, answers] = await Promise.all([
        supabase
          .from("profiles")
          .select("name")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("profiler_answers")
          .select("question_id")
          .eq("user_id", user.id),
      ]);
      if (profile?.name) setName(profile.name);
      else if (user.email) setName(user.email.split("@")[0]);
      const unique = new Set((answers.data ?? []).map((r: any) => r.question_id));
      setCompleted(unique.size);
    })();
  }, [user]);

  const greeting = greetingForHour(new Date().getHours());
  const total = QUESTIONS.length;
  const progress = Math.min(100, (completed / total) * 100);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <Ionicons
              name="arrow-back"
              size={22}
              color={Colors.accent.light}
            />
            <Text style={styles.brand}>Hearth</Text>
          </View>
          <View style={styles.avatar}>
            <Ionicons name="person" size={18} color={Colors.accent.light} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.welcomeBlock}>
            <Text style={styles.greeting}>Good {greeting}, {name}</Text>
            <Text style={styles.welcomeSub}>
              You've taken {completed} step{completed === 1 ? "" : "s"} on your
              journey inward.
            </Text>
          </View>

          <View style={styles.heroCard}>
            <LinearGradient
              colors={[Colors.bg.secondary, Colors.accent.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <ImageBackground
              source={require("../../assets/images/home-hero.png")}
              style={styles.heroBg}
              imageStyle={styles.heroImg}
            >
              <LinearGradient
                colors={["transparent", "transparent", Colors.bg.primary]}
                locations={[0, 0.4, 1]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.heroBadgeWrap}>
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>
                    Current Environment: Fireside Retreat
                  </Text>
                </View>
              </View>
            </ImageBackground>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Journey</Text>
            <Pressable>
              <Text style={styles.viewAll}>View All</Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.glassCard}
            onPress={() => router.push("/(tabs)/crossroads")}
          >
            <View style={styles.glassCardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.glassCardTitle}>Wellness Profiler</Text>
                <Text style={styles.glassCardSub}>
                  Understand your mental wellness landscape
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.text.secondary}
              />
            </View>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>
                {completed} / {total} Questions
              </Text>
              <Text style={styles.progressPct}>
                {Math.round(progress)}%
              </Text>
            </View>
            <View style={styles.progressBg}>
              <View
                style={[styles.progressFill, { width: `${progress}%` }]}
              />
            </View>
          </Pressable>

          <Text style={[styles.sectionTitle, { marginTop: 8 }]}>
            Today's Reflection
          </Text>
          <View style={[styles.glassCard, styles.quoteCard]}>
            <Ionicons
              name="chatbox"
              size={72}
              color="rgba(255, 184, 118, 0.1)"
              style={styles.quoteIcon}
            />
            <Text style={styles.quoteText}>"{DAILY_REFLECTION}"</Text>
            <View style={styles.quoteDivider} />
            <Ionicons
              name="leaf"
              size={32}
              color="rgba(255, 184, 118, 0.2)"
              style={styles.quoteLeaf}
            />
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 8 }]}>
            Connect with Ember
          </Text>
          <Pressable
            style={styles.emberCard}
            onPress={() => router.push("/(tabs)/chat")}
          >
            <View style={styles.emberIconWrap}>
              <View style={styles.emberPulse} />
              <Ionicons
                name="flame"
                size={28}
                color={Colors.accent.light}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.emberTitle}>Chat with Ember</Text>
              <Text style={styles.emberSub}>
                Your AI companion for support and clarity
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.accent.light}
            />
          </Pressable>
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
  brandRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  brand: {
    color: Colors.accent.light,
    fontSize: 24,
    lineHeight: 32,
    fontFamily: "Lora_700Bold",
    letterSpacing: -0.5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 184, 118, 0.2)",
    backgroundColor: Colors.bg.elevated,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 140,
    gap: 16,
  },
  welcomeBlock: { marginTop: 8 },
  greeting: {
    color: Colors.text.primary,
    fontSize: 28,
    lineHeight: 36,
    fontFamily: "Lora_600SemiBold",
  },
  welcomeSub: {
    color: Colors.text.secondary,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 4,
    fontFamily: "Inter_400Regular",
  },
  heroCard: {
    width: "100%",
    aspectRatio: 16 / 10,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: Colors.accent.primary,
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  heroBg: { flex: 1, justifyContent: "flex-end" },
  heroImg: { resizeMode: "cover" },
  heroBadgeWrap: { padding: 16 },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 184, 118, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  heroBadgeText: {
    color: Colors.accent.light,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.7,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  sectionTitle: {
    color: Colors.text.primary,
    fontSize: 24,
    lineHeight: 32,
    fontFamily: "Lora_600SemiBold",
  },
  viewAll: {
    color: Colors.accent.light,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.7,
  },
  glassCard: {
    backgroundColor: Colors.glassPanel,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSoft,
    borderRadius: 16,
    padding: 24,
    gap: 16,
  },
  glassCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  glassCardTitle: {
    color: Colors.accent.light,
    fontSize: 24,
    lineHeight: 32,
    fontFamily: "Lora_600SemiBold",
  },
  glassCardSub: {
    color: Colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    fontFamily: "Inter_500Medium",
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: {
    color: Colors.text.secondary,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  progressPct: {
    color: Colors.accent.light,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  progressBg: {
    height: 8,
    backgroundColor: Colors.bg.elevated,
    borderRadius: 9999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.accent.light,
    borderRadius: 9999,
  },
  quoteCard: {
    padding: 32,
    overflow: "hidden",
    alignItems: "center",
  },
  quoteIcon: {
    position: "absolute",
    top: -16,
    left: -8,
  },
  quoteLeaf: {
    position: "absolute",
    bottom: 16,
    right: 16,
    opacity: 0.5,
    transform: [{ rotate: "12deg" }],
  },
  quoteText: {
    color: Colors.text.primary,
    fontSize: 24,
    lineHeight: 32,
    fontStyle: "italic",
    textAlign: "center",
    fontFamily: "Lora_600SemiBold",
  },
  quoteDivider: {
    width: 48,
    height: 1,
    backgroundColor: "rgba(255, 184, 118, 0.3)",
    marginTop: 24,
  },
  emberCard: {
    backgroundColor: Colors.bg.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 184, 118, 0.05)",
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    shadowColor: Colors.accent.primary,
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  emberIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(200, 129, 58, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  emberPulse: {
    position: "absolute",
    inset: 0,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 184, 118, 0.2)",
  },
  emberTitle: {
    color: Colors.text.primary,
    fontSize: 22,
    lineHeight: 28,
    fontFamily: "Lora_600SemiBold",
  },
  emberSub: {
    color: Colors.text.secondary,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    marginTop: 2,
  },
});
