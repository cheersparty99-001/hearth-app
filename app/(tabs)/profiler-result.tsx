import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../../constants/colors";
import {
  PROFILER_CATEGORIES,
  PROFILER_PROFILES,
  PROFILER_RESULT_FOOTER,
  PROFILER_META,
  type Category,
  type ProfilerProfile,
} from "../../constants/profiler";

const CATEGORY_COLORS: Record<Category, string> = {
  stress: "#A07040",
  anxiety: "#C8813A",
  depression: "#E8A060",
  sleep: "#FFB876",
};

const CATEGORY_ICONS: Record<Category, React.ComponentProps<typeof Ionicons>["name"]> = {
  stress: "trending-up",
  anxiety: "alert-circle",
  depression: "cloudy",
  sleep: "moon",
};

export default function ProfilerResult() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    scores?: string;
    profileIds?: string;
  }>();

  const scores: Record<Category, number> = params.scores
    ? JSON.parse(params.scores)
    : { stress: 0, anxiety: 0, depression: 0, sleep: 0 };

  const profileIds: string[] = params.profileIds
    ? JSON.parse(params.profileIds)
    : [];

  const profiles: ProfilerProfile[] = profileIds
    .map((id: string) => PROFILER_PROFILES.find((p) => p.id === id))
    .filter((p): p is ProfilerProfile => p !== undefined);

  const maxScore = Math.max(...Object.values(scores), 1);
  const categories = Object.keys(scores) as Category[];

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <Pressable hitSlop={10} onPress={() => router.back()}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={Colors.accent.light}
            />
          </Pressable>
          <Text style={styles.headerTitle}>Your Results</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Badge */}
          <View style={styles.badgeWrap}>
            <View style={styles.badgeOuter}>
              <View style={styles.badgeInner}>
                <LinearGradient
                  colors={[Colors.bg.secondary, Colors.accent.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Image
                  source={require("../../assets/images/result-badge.png")}
                  style={styles.badgeImage}
                />
              </View>
            </View>
          </View>

          {/* Profile Name */}
          {profiles.map((p, i) => (
            <View key={p.id} style={styles.profileBlock}>
              {profiles.length > 1 && (
                <View style={styles.tieBadge}>
                  <Ionicons name="swap-horizontal" size={14} color={Colors.accent.onPrimary} />
                  <Text style={styles.tieBadgeText}>Tied Profile {i + 1}</Text>
                </View>
              )}
              <Text style={styles.profileName}>{p.name}</Text>
              <Text style={styles.profileDesc}>{p.description}</Text>
            </View>
          ))}

          {/* Category Scores */}
          <View style={styles.scoresCard}>
            <Text style={styles.scoresTitle}>Your Score Breakdown</Text>
            {categories.map((cat) => {
              const count = scores[cat];
              const pct = (count / maxScore) * 100;
              const catInfo = PROFILER_CATEGORIES[cat];
              return (
                <View key={cat} style={styles.scoreRow}>
                  <View style={styles.scoreLabelRow}>
                    <Ionicons
                      name={CATEGORY_ICONS[cat]}
                      size={16}
                      color={CATEGORY_COLORS[cat]}
                    />
                    <Text style={styles.scoreLabel}>{catInfo.label}</Text>
                    <Text style={styles.scoreValue}>
                      {count}/{Object.keys(scores).length > 0
                        ? Math.max(...Object.values(scores))
                        : 15}
                    </Text>
                  </View>
                  <View style={styles.barBg}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${Math.max(pct, 4)}%`,
                          backgroundColor: CATEGORY_COLORS[cat],
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>

          {/* Actions */}
          <Pressable
            style={styles.primaryBtn}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/chat",
              })
            }
          >
            <Ionicons name="flame" size={20} color={Colors.accent.onPrimary} />
            <Text style={styles.primaryBtnText}>Discuss with Ember</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryBtn}
            onPress={() => {
              router.replace("/(tabs)/crossroads");
            }}
          >
            <Ionicons name="refresh" size={20} color={Colors.text.primary} />
            <Text style={styles.secondaryBtnText}>Retake Assessment</Text>
          </Pressable>

          {/* Disclaimer */}
          <View style={styles.disclaimerWrap}>
            <Ionicons
              name="information-circle"
              size={16}
              color={Colors.text.muted}
            />
            <Text style={styles.disclaimer}>{PROFILER_RESULT_FOOTER}</Text>
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
  headerTitle: {
    color: Colors.accent.light,
    fontSize: 24,
    lineHeight: 32,
    fontFamily: "Lora_600SemiBold",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 140,
    alignItems: "center",
    gap: 28,
  },
  badgeWrap: {
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeOuter: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "rgba(255, 184, 118, 0.2)",
  },
  badgeInner: {
    width: "100%",
    height: "100%",
    borderRadius: 90,
    borderWidth: 4,
    borderColor: Colors.bg.secondary,
    overflow: "hidden",
    backgroundColor: Colors.bg.card,
    shadowColor: Colors.accent.primary,
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    alignItems: "center",
    justifyContent: "center",
  },
  badgeImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  profileBlock: {
    width: "100%",
    alignItems: "center",
    gap: 12,
  },
  tieBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(200, 129, 58, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  tieBadgeText: {
    color: Colors.accent.onPrimary,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  profileName: {
    color: Colors.accent.light,
    fontSize: 32,
    lineHeight: 40,
    fontFamily: "Lora_700Bold",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  profileDesc: {
    color: Colors.text.secondary,
    fontSize: 16,
    lineHeight: 26,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 8,
  },
  scoresCard: {
    width: "100%",
    backgroundColor: Colors.glassPanel,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSoft,
    borderRadius: 16,
    padding: 24,
    gap: 20,
  },
  scoresTitle: {
    color: Colors.text.primary,
    fontSize: 18,
    lineHeight: 24,
    fontFamily: "Lora_600SemiBold",
    textAlign: "center",
  },
  scoreRow: {
    gap: 8,
  },
  scoreLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scoreLabel: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  scoreValue: {
    color: Colors.text.muted,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  barBg: {
    height: 8,
    backgroundColor: Colors.bg.elevated,
    borderRadius: 9999,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 9999,
  },
  primaryBtn: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.accent.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: Colors.accent.primary,
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  primaryBtnText: {
    color: Colors.accent.onPrimary,
    fontSize: 18,
    fontFamily: "Inter_500Medium",
    fontWeight: "700",
  },
  secondaryBtn: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(32, 45, 31, 0.5)",
    borderWidth: 1,
    borderColor: "rgba(82, 68, 56, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  secondaryBtnText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  disclaimerWrap: {
    width: "100%",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 4,
  },
  disclaimer: {
    flex: 1,
    color: Colors.text.muted,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "Inter_400Regular",
    opacity: 0.8,
  },
});