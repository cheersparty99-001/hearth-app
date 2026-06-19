import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
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
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

interface InsightShape {
  title: string;
  body: string;
  strengths: string[];
  growth: string;
}

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const STRENGTH_ICONS: IoniconName[] = ["heart", "shield", "leaf", "flame"];

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
  const [saved, setSaved] = useState(false);

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
        });
      }
      setLoading(false);
    })();
  }, [user, params.title, params.body, params.strengths, params.growth]);

  if (loading) {
    return (
      <View style={styles.root}>
        <StatusBar style="light" />
        <SafeAreaView style={styles.safe} edges={["top"]}>
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Drawing your pattern...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!insight) {
    return (
      <View style={styles.root}>
        <StatusBar style="light" />
        <SafeAreaView style={styles.safe} edges={["top"]}>
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="leaf" size={56} color={Colors.accent.light} />
            </View>
            <Text style={styles.emptyTitle}>No insight yet</Text>
            <Text style={styles.emptyText}>
              Complete your Journey first to see your pattern emerge.
            </Text>
            <Pressable
              style={styles.primaryBtn}
              onPress={() => router.push("/(tabs)/crossroads")}
            >
              <Text style={styles.primaryBtnText}>Begin Journey</Text>
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
        <View style={styles.header}>
          <Pressable hitSlop={10} onPress={() => router.back()}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={Colors.accent.light}
            />
          </Pressable>
          <Text style={styles.headerBrand}>Hearth</Text>
          <View style={styles.headerAvatar}>
            <Ionicons name="flame" size={16} color={Colors.accent.light} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.titleBlock}>
            <Text style={styles.eyebrow}>YOUR INSIGHT</Text>
            <Text style={styles.title}>{insight.title}</Text>
          </View>

          <View style={styles.heroWrap}>
            <View style={styles.heroOuter} />
            <View style={styles.heroInner}>
              <LinearGradient
                colors={[Colors.bg.secondary, Colors.accent.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Image
                source={require("../../assets/images/ember-avatar.png")}
                style={styles.heroImage}
              />
            </View>
          </View>

          <View style={styles.bodyCard}>
            <Text style={styles.bodyText}>{insight.body}</Text>
          </View>

          {insight.strengths.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionLabelRow}>
                <View style={styles.sectionLine} />
                <Text style={styles.sectionLabel}>YOUR STRENGTHS</Text>
                <View style={styles.sectionLine} />
              </View>
              <View style={styles.strengthsWrap}>
                {insight.strengths.map((s, i) => (
                  <View key={`${s}-${i}`} style={styles.strengthPill}>
                    <Ionicons
                      name={STRENGTH_ICONS[i % STRENGTH_ICONS.length]}
                      size={14}
                      color={Colors.secondary}
                    />
                    <Text style={styles.strengthText}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {!!insight.growth && (
            <View style={styles.section}>
              <View style={styles.growthHeader}>
                <View style={styles.growthDot} />
                <Text style={styles.growthTitle}>Growth Opportunity</Text>
              </View>
              <View style={styles.growthBody}>
                <Text style={styles.growthText}>{insight.growth}</Text>
              </View>
            </View>
          )}

          <View style={styles.quoteWrap}>
            <Ionicons
              name="chatbox"
              size={32}
              color="rgba(252, 186, 101, 0.4)"
            />
            <Text style={styles.pullQuote}>
              "You're not too sensitive. You're just deeply human."
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              style={styles.primaryBtn}
              onPress={() => router.push("/(tabs)/chat")}
            >
              <Text style={styles.primaryBtnText}>
                Explore Deeper Insights
              </Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color={Colors.accent.onPrimary}
              />
            </Pressable>
            <Pressable
              style={styles.secondaryBtn}
              onPress={() => setSaved((s) => !s)}
            >
              <Ionicons
                name={saved ? "bookmark" : "bookmark-outline"}
                size={20}
                color={Colors.text.primary}
              />
              <Text style={styles.secondaryBtnText}>
                {saved ? "Saved" : "Save Insight"}
              </Text>
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
  headerBrand: {
    color: Colors.accent.light,
    fontSize: 24,
    lineHeight: 32,
    fontFamily: "Lora_700Bold",
    letterSpacing: -0.5,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 184, 118, 0.2)",
    backgroundColor: Colors.bg.elevated,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 140,
    alignItems: "center",
    gap: 32,
  },
  titleBlock: { alignItems: "center", gap: 8 },
  eyebrow: {
    color: Colors.text.primary,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    letterSpacing: 2.8,
    opacity: 0.6,
  },
  title: {
    color: Colors.tertiaryFixed,
    fontSize: 28,
    lineHeight: 36,
    fontFamily: "Lora_700Bold",
    fontStyle: "italic",
  },
  heroWrap: {
    width: 256,
    height: 256,
    alignItems: "center",
    justifyContent: "center",
  },
  heroOuter: {
    position: "absolute",
    width: 290,
    height: 290,
    borderRadius: 145,
    borderWidth: 2,
    borderColor: "rgba(255, 184, 118, 0.2)",
  },
  heroInner: {
    width: "100%",
    height: "100%",
    borderRadius: 128,
    borderWidth: 4,
    borderColor: Colors.bg.secondary,
    overflow: "hidden",
    backgroundColor: Colors.bg.card,
    shadowColor: Colors.accent.primary,
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  bodyCard: {
    width: "100%",
    backgroundColor: Colors.glassPanel,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSoft,
    borderRadius: 16,
    padding: 24,
  },
  bodyText: {
    color: Colors.text.secondary,
    fontSize: 18,
    lineHeight: 28,
    fontFamily: "Inter_400Regular",
  },
  section: { width: "100%", gap: 16 },
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  sectionLine: {
    height: 1,
    width: 32,
    backgroundColor: Colors.border,
  },
  sectionLabel: {
    color: Colors.accent.light,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  strengthsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  strengthPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: "rgba(49, 78, 48, 0.3)",
    borderWidth: 1,
    borderColor: "rgba(174, 207, 168, 0.2)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  strengthText: {
    color: Colors.secondary,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  growthHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  growthDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.tertiary,
    shadowColor: Colors.tertiary,
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  growthTitle: {
    color: Colors.tertiaryFixed,
    fontSize: 24,
    lineHeight: 32,
    fontFamily: "Lora_600SemiBold",
  },
  growthBody: {
    paddingLeft: 16,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(252, 186, 101, 0.2)",
  },
  growthText: {
    color: Colors.text.primary,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "Inter_400Regular",
  },
  quoteWrap: {
    width: "100%",
    paddingVertical: 24,
    gap: 8,
  },
  pullQuote: {
    color: Colors.text.secondary,
    fontSize: 24,
    lineHeight: 32,
    fontStyle: "italic",
    fontFamily: "Lora_600SemiBold",
  },
  actions: { width: "100%", gap: 16, paddingTop: 16 },
  primaryBtn: {
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
  empty: { flex: 1, padding: 24, alignItems: "center", justifyContent: "center" },
  emptyIcon: { marginBottom: 16 },
  emptyTitle: {
    color: Colors.text.primary,
    fontSize: 24,
    lineHeight: 32,
    fontFamily: "Lora_600SemiBold",
    marginBottom: 8,
  },
  emptyText: {
    color: Colors.text.secondary,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    maxWidth: 280,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
  },
});
