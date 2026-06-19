import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

interface InsightShape {
  title: string;
  body: string;
  strengths: string[];
  growth: string;
  isNew: boolean;
}

export default function Insight() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    title?: string;
    body?: string;
    strengths?: string;
    growth?: string;
  }>();
  const [insight, setInsight] = useState<InsightShape | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.title && params.body) {
      let strengths: string[] = [];
      try {
        strengths = params.strengths ? JSON.parse(params.strengths) : [];
      } catch {
        strengths = [];
      }
      setInsight({
        title: params.title,
        body: params.body,
        strengths,
        growth: params.growth ?? "",
        isNew: true,
      });
      setLoading(false);
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("insights")
        .select("pattern_title, pattern_body, strengths, growth")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        const strengths = Array.isArray(data.strengths)
          ? (data.strengths as string[])
          : [];
        setInsight({
          title: data.pattern_title,
          body: data.pattern_body,
          strengths,
          growth: data.growth ?? "",
          isNew: false,
        });
      }
      setLoading(false);
    })();
  }, [user, params.title, params.body, params.strengths, params.growth]);

  if (loading) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <StatusBar style="light" />
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Drawing your pattern...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!insight) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <StatusBar style="light" />
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="leaf" size={56} color={Colors.accent.primary} />
          </View>
          <Text style={styles.emptyTitle}>No insight yet</Text>
          <Text style={styles.emptyText}>
            Complete Life Crossroads first to see your pattern.
          </Text>
          <Pressable
            style={styles.cta}
            onPress={() => router.push("/(tabs)/crossroads")}
          >
            <Text style={styles.ctaText}>Begin Crossroads</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Your Insight</Text>

        <View style={styles.card}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>CORE PATTERN</Text>
          </View>
          <Text style={styles.patternTitle}>{insight.title}</Text>
          <Text style={styles.patternBody}>{insight.body}</Text>
          <Text style={styles.tag}>
            {insight.isNew ? "Discovered just now" : "Your most recent insight"}
          </Text>
        </View>

        {insight.strengths.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>YOUR STRENGTHS</Text>
            <View style={styles.pills}>
              {insight.strengths.map((s, i) => (
                <View key={`${s}-${i}`} style={styles.pill}>
                  <Text style={styles.pillText}>{s}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {!!insight.growth && (
          <>
            <Text style={styles.sectionLabel}>GROWTH OPPORTUNITY</Text>
            <View style={styles.growthCard}>
              <Text style={styles.growthText}>{insight.growth}</Text>
            </View>
          </>
        )}

        <Pressable
          style={styles.cta}
          onPress={() => router.push("/(tabs)/chat")}
        >
          <Text style={styles.ctaText}>Talk to Ember</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { paddingHorizontal: 24, paddingBottom: 40, paddingTop: 8 },
  heading: {
    color: Colors.text.primary,
    fontSize: 24,
    fontWeight: "400",
    marginBottom: 20,
    fontFamily: "Lora_700Bold",
  },
  empty: { flex: 1, padding: 24, alignItems: "center", justifyContent: "center" },
  emptyIcon: { marginBottom: 16 },
  emptyTitle: {
    color: Colors.text.primary,
    fontSize: 20,
    marginBottom: 8,
    fontFamily: "Lora_600SemiBold",
  },
  emptyText: {
    color: Colors.text.muted,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    maxWidth: 280,
    fontFamily: "Inter_400Regular",
  },
  card: {
    backgroundColor: Colors.bg.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 22,
    marginBottom: 28,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.accent.glow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 50,
    marginBottom: 14,
  },
  badgeText: {
    color: Colors.accent.primary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    fontFamily: "Inter_500Medium",
  },
  patternTitle: {
    color: Colors.text.primary,
    fontSize: 26,
    fontWeight: "400",
    marginBottom: 14,
    fontFamily: "Lora_700Bold",
  },
  patternBody: {
    color: Colors.text.secondary,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 16,
    fontFamily: "Inter_400Regular",
  },
  tag: {
    color: Colors.accent.light,
    fontSize: 12,
    letterSpacing: 0.5,
    fontFamily: "Inter_400Regular",
  },
  sectionLabel: {
    color: Colors.text.muted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 2,
    marginBottom: 12,
    fontFamily: "Inter_500Medium",
  },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 28 },
  pill: {
    backgroundColor: Colors.bg.elevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
  },
  pillText: {
    color: Colors.accent.light,
    fontSize: 13,
    fontWeight: "500",
    fontFamily: "Inter_500Medium",
  },
  growthCard: {
    backgroundColor: Colors.bg.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    marginBottom: 28,
  },
  growthText: {
    color: Colors.text.secondary,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: "Inter_400Regular",
  },
  cta: {
    backgroundColor: Colors.accent.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 50,
    alignItems: "center",
    marginTop: 8,
  },
  ctaText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
});
