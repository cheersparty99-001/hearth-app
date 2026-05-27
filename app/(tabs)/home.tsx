import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import { DAILY_QUOTES } from "../../constants/questions";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

function greetingForHour(h: number): string {
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

export default function Home() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [name, setName] = useState<string>("");
  const today = new Date();
  const dayIndex = today.getDay() % DAILY_QUOTES.length;
  const quote = DAILY_QUOTES[dayIndex];
  const greeting = greetingForHour(today.getHours());

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .maybeSingle();
      if (data?.name) setName(data.name);
      else if (user.email) setName(user.email.split("@")[0]);
    })();
  }, [user]);

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <Text style={styles.flame}>🔥</Text>
            <Text style={styles.brandText}>Hearth</Text>
          </View>
          <Pressable onPress={signOut} hitSlop={10}>
            <Text style={styles.signOut}>Sign Out</Text>
          </Pressable>
        </View>

        <Text style={styles.greeting}>
          Good {greeting},{name ? ` ${name}` : ""}
        </Text>
        <Text style={styles.welcome}>What stirs within you today?</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>TODAY'S REFLECTION</Text>
          <Text style={styles.quote}>"{quote.text}"</Text>
          <Text style={styles.author}>— {quote.author}</Text>
        </View>

        <Text style={styles.sectionLabel}>EXPLORE</Text>

        <Pressable
          style={styles.featureCard}
          onPress={() => router.push("/(tabs)/crossroads")}
        >
          <Text style={styles.featureIcon}>🌿</Text>
          <View style={styles.featureBody}>
            <Text style={styles.featureTitle}>Life Crossroads</Text>
            <Text style={styles.featureDesc}>
              Five questions. Quiet patterns surface.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.text.muted} />
        </Pressable>

        <Pressable
          style={styles.featureCard}
          onPress={() => router.push("/(tabs)/chat")}
        >
          <Text style={styles.featureIcon}>🔥</Text>
          <View style={styles.featureBody}>
            <Text style={styles.featureTitle}>Ember</Text>
            <Text style={styles.featureDesc}>Your companion for reflection.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.text.muted} />
        </Pressable>

        <View style={[styles.featureCard, styles.locked]}>
          <Text style={[styles.featureIcon, { opacity: 0.7 }]}>🌲</Text>
          <View style={styles.featureBody}>
            <Text style={[styles.featureTitle, { opacity: 0.8 }]}>
              Forest Meditation
            </Text>
            <Text style={styles.featureDesc}>Coming soon</Text>
          </View>
          <Ionicons name="lock-closed" size={18} color={Colors.text.muted} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    marginBottom: 24,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  flame: { fontSize: 22 },
  brandText: {
    color: Colors.text.primary,
    fontSize: 20,
    fontWeight: "500",
    letterSpacing: 1,
  },
  signOut: { color: Colors.text.muted, fontSize: 13 },
  greeting: {
    color: Colors.text.primary,
    fontSize: 26,
    fontWeight: "400",
    marginBottom: 4,
  },
  welcome: {
    color: Colors.text.muted,
    fontSize: 14,
    marginBottom: 24,
  },
  card: {
    backgroundColor: Colors.bg.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardLabel: {
    color: Colors.accent.primary,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 2,
    marginBottom: 12,
  },
  quote: {
    color: Colors.text.primary,
    fontSize: 17,
    fontStyle: "italic",
    lineHeight: 26,
    marginBottom: 12,
  },
  author: { color: Colors.text.muted, fontSize: 13 },
  sectionLabel: {
    color: Colors.text.muted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 2,
    marginBottom: 12,
  },
  featureCard: {
    backgroundColor: Colors.bg.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 14,
  },
  locked: { opacity: 0.65 },
  featureIcon: { fontSize: 30 },
  featureBody: { flex: 1 },
  featureTitle: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  featureDesc: { color: Colors.text.muted, fontSize: 13 },
});
