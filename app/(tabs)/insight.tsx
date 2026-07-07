import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import { PROFILES, WellnessDimension } from "../../constants/questions";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

type Scores = {
  stress: number;
  anxiety: number;
  depression: number;
  sleep: number;
};

interface ProfileView {
  name: string;
  dimensionLabel: string;
  description: string;
  strengths: string[];
  growth: string;
  scores: Scores;
  topDimension: WellnessDimension;
}

const BARS: { key: keyof Scores; label: string }[] = [
  { key: "stress", label: "Stress" },
  { key: "anxiety", label: "Anxiety" },
  { key: "depression", label: "Low Mood" },
  { key: "sleep", label: "Sleep" },
];

function topOf(scores: Scores): WellnessDimension {
  return (Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]) as WellnessDimension;
}

export default function Insight() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    stress?: string;
    anxiety?: string;
    depression?: string;
    sleep?: string;
    topDimension?: string;
  }>();

  const [profile, setProfile] = useState<ProfileView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fresh result passed via navigation params
    if (params.topDimension && PROFILES[params.topDimension as WellnessDimension]) {
      const topDimension = params.topDimension as WellnessDimension;
      const scores: Scores = {
        stress: Number(params.stress) || 0,
        anxiety: Number(params.anxiety) || 0,
        depression: Number(params.depression) || 0,
        sleep: Number(params.sleep) || 0,
      };
      const p = PROFILES[topDimension];
      setProfile({
        name: p.name,
        dimensionLabel: p.dimension,
        description: p.description,
        strengths: p.strengths,
        growth: p.growth,
        scores,
        topDimension,
      });
      setLoading(false);
      return;
    }

    // Otherwise load the most recent insight from Supabase
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("insights")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        const scores: Scores = {
          stress: data.stress_score ?? 0,
          anxiety: data.anxiety_score ?? 0,
          depression: data.depression_score ?? 0,
          sleep: data.sleep_score ?? 0,
        };
        const topDimension = topOf(scores);
        const strengths = Array.isArray(data.strengths)
          ? (data.strengths as string[])
          : [];
        setProfile({
          name: data.pattern_title,
          dimensionLabel: PROFILES[topDimension].dimension,
          description: data.pattern_body,
          strengths,
          growth: data.growth ?? "",
          scores,
          topDimension,
        });
      }
      setLoading(false);
    })();
  }, [
    user,
    params.topDimension,
    params.stress,
    params.anxiety,
    params.depression,
    params.sleep,
  ]);

  if (loading) {
    return (
      <View style={styles.root}>
        <StatusBar style="light" />
        <SafeAreaView style={styles.safe} edges={["top"]}>
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Drawing your profile...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.root}>
        <StatusBar style="light" />
        <SafeAreaView style={styles.safe} edges={["top"]}>
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="leaf" size={52} color={Colors.accent.light} />
            </View>
            <Text style={styles.emptyTitle}>No profile yet</Text>
            <Text style={styles.emptyText}>
              Complete the Wellness Profiler first to see your profile emerge.
            </Text>
            <Pressable
              style={styles.talkBtn}
              onPress={() => router.push("/(tabs)/crossroads")}
            >
              <Text style={styles.talkBtnText}>Start Profiler</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Text style={styles.eyebrow}>YOUR PROFILE</Text>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.primaryArea}>
            Primary area: {profile.dimensionLabel}
          </Text>

          <Text style={styles.description}>{profile.description}</Text>

          {/* Score bars */}
          <Text style={styles.landscapeLabel}>YOUR WELLNESS LANDSCAPE</Text>
          <View style={styles.bars}>
            {BARS.map((bar) => {
              const score = profile.scores[bar.key];
              const isTop = profile.topDimension === bar.key;
              return (
                <View key={bar.key} style={styles.barRow}>
                  <Text style={styles.barLabel}>{bar.label}</Text>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${(score / 15) * 100}%`,
                          backgroundColor: isTop ? "#C8813A" : "#4A8C4A",
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barScore}>{score}</Text>
                </View>
              );
            })}
          </View>

          {/* Strengths */}
          {profile.strengths.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>YOUR STRENGTHS</Text>
              <View style={styles.strengthsWrap}>
                {profile.strengths.map((s, i) => (
                  <View key={`${s}-${i}`} style={styles.strengthPill}>
                    <Text style={styles.strengthText}>{s}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Growth */}
          {!!profile.growth && (
            <>
              <Text style={styles.sectionLabel}>GROWTH OPPORTUNITY</Text>
              <View style={styles.growthCard}>
                <View style={styles.growthAccent} />
                <Text style={styles.growthText}>{profile.growth}</Text>
              </View>
            </>
          )}

          {/* CTA */}
          <Pressable
            style={styles.talkBtn}
            onPress={() => router.push("/(tabs)/chat")}
          >
            <Ionicons
              name="chatbubble-ellipses"
              size={18}
              color={Colors.accent.onPrimary}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.talkBtnText}>Talk to Ember</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },
  safe: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 60,
  },

  eyebrow: {
    color: "#C8813A",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  name: {
    color: "#E8A855",
    fontSize: 26,
    lineHeight: 34,
    fontFamily: "Lora_700Bold",
    marginBottom: 6,
  },
  primaryArea: {
    color: "#6A946A",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 20,
  },
  description: {
    color: "#D4E8D4",
    fontSize: 15,
    lineHeight: 24,
    fontFamily: "Inter_400Regular",
    marginBottom: 32,
  },

  landscapeLabel: {
    color: "#6A946A",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  bars: {
    gap: 14,
    marginBottom: 32,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  barLabel: {
    width: 80,
    color: "#D4E8D4",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  barContainer: {
    flex: 1,
    height: 6,
    backgroundColor: "#1E3A1E",
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
  },
  barScore: {
    width: 24,
    color: "#6A946A",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
  },

  sectionLabel: {
    color: "#6A946A",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  strengthsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 32,
  },
  strengthPill: {
    backgroundColor: "#243824",
    borderWidth: 1,
    borderColor: "#C8813A",
    borderRadius: 50,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  strengthText: {
    color: "#D4E8D4",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },

  growthCard: {
    flexDirection: "row",
    backgroundColor: "#1E3A1E",
    borderWidth: 1,
    borderColor: "#2A4A2A",
    borderRadius: 16,
    padding: 16,
    gap: 14,
    marginBottom: 36,
  },
  growthAccent: {
    width: 3,
    borderRadius: 2,
    backgroundColor: "#C8813A",
  },
  growthText: {
    flex: 1,
    color: "#D4E8D4",
    fontSize: 15,
    lineHeight: 24,
    fontFamily: "Inter_400Regular",
  },

  talkBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#C8813A",
    borderRadius: 50,
    padding: 16,
    shadowColor: "#C8813A",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  talkBtnText: {
    color: Colors.accent.onPrimary,
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },

  empty: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIcon: { marginBottom: 16 },
  emptyTitle: {
    color: Colors.text.primary,
    fontSize: 22,
    fontFamily: "Lora_600SemiBold",
    marginBottom: 8,
  },
  emptyText: {
    color: Colors.text.secondary,
    fontSize: 15,
    textAlign: "center",
    marginBottom: 24,
    maxWidth: 280,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
});
