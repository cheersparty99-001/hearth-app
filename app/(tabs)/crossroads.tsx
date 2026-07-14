import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../../constants/colors";
import {
  QUESTIONS,
  DIMENSION_MAP,
  PROFILES,
  ChoiceId,
  WellnessDimension,
} from "../../constants/questions";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

type MaterialName = React.ComponentProps<typeof MaterialIcons>["name"];

// Each choice maps to a wellness dimension (a/b/c/d) — give each a distinct icon.
const CHOICE_ICON: Record<ChoiceId, MaterialName> = {
  a: "eco",
  b: "local-fire-department",
  c: "forum",
  d: "shield",
};

export default function Crossroads() {
  const router = useRouter();
  const { user } = useAuth();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, ChoiceId>>({});
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  const question = QUESTIONS[index];
  const selected = answers[question.id];
  const isLast = index === QUESTIONS.length - 1;
  const total = QUESTIONS.length;
  const progress = (index + 1) / total;

  const onSelect = (choice: ChoiceId) => {
    setAnswers((a) => ({ ...a, [question.id]: choice }));
  };

  const onBack = () => {
    if (index > 0) setIndex((i) => i - 1);
  };

  const onContinue = async () => {
    if (!selected) return;
    if (!isLast) {
      setIndex((i) => i + 1);
      return;
    }
    if (!user) {
      Alert.alert("Not signed in", "Please sign in first.");
      return;
    }

    setSubmitting(true);
    try {
      // Preserve raw answer history
      const rows = QUESTIONS.map((q) => ({
        user_id: user.id,
        question_id: q.id,
        choice: answers[q.id],
      }));
      await supabase.from("crossroads_answers").insert(rows);

      // Score each wellness dimension
      const scores = { stress: 0, anxiety: 0, depression: 0, sleep: 0 };
      rows.forEach((answer) => {
        const dimension = DIMENSION_MAP[answer.choice as ChoiceId];
        scores[dimension]++;
      });
      const topDimension = (Object.entries(scores).sort(
        (a, b) => b[1] - a[1]
      )[0][0]) as WellnessDimension;

      const { error: insErr } = await supabase.from("insights").insert({
        user_id: user.id,
        pattern_title: PROFILES[topDimension].name,
        pattern_body: PROFILES[topDimension].description,
        strengths: PROFILES[topDimension].strengths,
        growth: PROFILES[topDimension].growth,
        stress_score: scores.stress,
        anxiety_score: scores.anxiety,
        depression_score: scores.depression,
        sleep_score: scores.sleep,
      });
      if (insErr) throw new Error(insErr.message);

      router.push({
        pathname: "/(tabs)/insight",
        params: {
          stress: scores.stress,
          anxiety: scores.anxiety,
          depression: scores.depression,
          sleep: scores.sleep,
          topDimension,
        },
      });

      setIndex(0);
      setAnswers({});
    } catch (e: any) {
      Alert.alert("Could not save your profile", e?.message ?? String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={onBack} hitSlop={10} disabled={index === 0}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={index === 0 ? Colors.text.muted : Colors.accent.light}
            />
          </Pressable>
          <Text style={styles.headerTitle}>
            Scenario {index + 1} of {total}
          </Text>
          <Pressable onPress={() => setSaved((s) => !s)} hitSlop={10}>
            <MaterialIcons
              name={saved ? "bookmark" : "bookmark-border"}
              size={22}
              color={Colors.accent.light}
            />
          </Pressable>
        </View>

        <View style={styles.progressBlock}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Forest hero */}
          <View style={styles.hero}>
            <Image
              source={require("../../assets/images/crossroads-forest.png")}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
            <LinearGradient
              colors={["transparent", "transparent", "rgba(13,26,13,0.95)"]}
              locations={[0, 0.45, 1]}
              style={StyleSheet.absoluteFill}
            />
          </View>

          <Text style={styles.sceneLabel}>Life Scenario</Text>
          <Text style={styles.scenario}>{question.scenario}</Text>

          <View style={styles.choices}>
            {question.choices.map((c) => {
              const isSel = selected === c.id;
              return (
                <Pressable
                  key={c.id}
                  style={[styles.choice, isSel && styles.choiceSelected]}
                  onPress={() => onSelect(c.id as ChoiceId)}
                >
                  <View style={[styles.iconBox, isSel && styles.iconBoxSelected]}>
                    <MaterialIcons
                      name={CHOICE_ICON[c.id as ChoiceId]}
                      size={20}
                      color={isSel ? Colors.accent.light : "#6A946A"}
                    />
                  </View>
                  <Text
                    style={[
                      styles.choiceText,
                      isSel && styles.choiceTextSelected,
                    ]}
                  >
                    {c.title}
                  </Text>
                  {isSel && (
                    <MaterialIcons
                      name="radio-button-checked"
                      size={20}
                      color={Colors.accent.light}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.ctaWrap}>
          <Pressable
            style={[styles.cta, !selected && styles.ctaDisabled]}
            disabled={!selected || submitting}
            onPress={onContinue}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.accent.onPrimary} />
            ) : (
              <>
                <Text style={styles.ctaText}>
                  {isLast ? "Reveal My Profile" : "Continue"}
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={Colors.accent.onPrimary}
                />
              </>
            )}
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },
  safe: { flex: 1 },
  header: {
    height: 56,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: Colors.text.primary,
    fontSize: 18,
    fontFamily: "Literata_600SemiBold",
  },
  progressBlock: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 16,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#1E3A1E",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: Colors.accent.primary,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 140,
  },
  hero: {
    width: "100%",
    height: 180,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "#1E3A1E",
  },
  sceneLabel: {
    color: Colors.accent.light,
    fontSize: 22,
    fontFamily: "Literata_700Bold",
    textAlign: "center",
    marginBottom: 12,
  },
  scenario: {
    color: Colors.text.secondary,
    fontSize: 17,
    lineHeight: 26,
    fontFamily: "DMSans_400Regular",
    textAlign: "center",
    marginBottom: 28,
  },
  choices: {
    gap: 14,
  },
  choice: {
    backgroundColor: "rgba(30, 58, 30, 0.5)",
    borderWidth: 1.5,
    borderColor: "rgba(42, 74, 42, 0.7)",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  choiceSelected: {
    borderColor: Colors.accent.primary,
    backgroundColor: "rgba(200, 129, 58, 0.12)",
    shadowColor: Colors.accent.primary,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(42, 74, 42, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxSelected: {
    backgroundColor: "rgba(200, 129, 58, 0.25)",
  },
  choiceText: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: "DMSans_400Regular",
  },
  choiceTextSelected: {
    color: Colors.accent.light,
    fontFamily: "DMSans_500Medium",
  },
  ctaWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 24,
    paddingTop: 16,
    backgroundColor: Colors.bg.primary,
  },
  cta: {
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
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
  ctaDisabled: { opacity: 0.4 },
  ctaText: {
    color: Colors.accent.onPrimary,
    fontSize: 15,
    fontFamily: "DMSans_600SemiBold",
    letterSpacing: 0.5,
  },
});
