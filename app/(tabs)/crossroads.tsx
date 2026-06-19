import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import { QUESTIONS, ChoiceId } from "../../constants/questions";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { generateInsight } from "../../lib/openrouter";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const CHOICE_ICONS: Record<number, Record<ChoiceId, IoniconName>> = {
  1: { a: "briefcase", b: "home", c: "scale", d: "hourglass" },
  2: { a: "sunny", b: "home-outline", c: "chatbubble", d: "refresh" },
  3: { a: "trending-up", b: "walk", c: "megaphone", d: "search" },
  4: { a: "heart", b: "water", c: "people", d: "cloud" },
  5: { a: "exit", b: "eye", c: "leaf", d: "chatbox" },
};

export default function Crossroads() {
  const router = useRouter();
  const { user } = useAuth();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, ChoiceId>>({});
  const [submitting, setSubmitting] = useState(false);

  const question = QUESTIONS[index];
  const selected = answers[question.id];
  const isLast = index === QUESTIONS.length - 1;
  const progress = ((index + 1) / QUESTIONS.length) * 100;

  const onSelect = (choice: ChoiceId) => {
    setAnswers((a) => ({ ...a, [question.id]: choice }));
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
      const rows = QUESTIONS.map((q) => ({
        user_id: user.id,
        question_id: q.id,
        choice: answers[q.id],
      }));
      const { error: ansErr } = await supabase
        .from("crossroads_answers")
        .insert(rows);
      if (ansErr) throw new Error(ansErr.message);

      const payload = rows.map((r) => ({
        question_id: r.question_id,
        choice: r.choice,
      }));
      const insight = await generateInsight(payload);

      const { error: insErr } = await supabase.from("insights").insert({
        user_id: user.id,
        pattern_title: insight.title,
        pattern_body: insight.body,
        strengths: insight.strengths,
        growth: insight.growth,
      });
      if (insErr) throw new Error(insErr.message);

      router.push({
        pathname: "/(tabs)/insight",
        params: {
          title: insight.title,
          body: insight.body,
          strengths: JSON.stringify(insight.strengths),
          growth: insight.growth,
        },
      });

      setIndex(0);
      setAnswers({});
    } catch (e: any) {
      Alert.alert("Could not generate insight", e?.message ?? String(e));
    } finally {
      setSubmitting(false);
    }
  };

  const onBack = () => {
    if (index > 0) setIndex((i) => i - 1);
  };

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>Life Crossroads</Text>
        <Text style={styles.progressLabel}>
          Question {index + 1} of {QUESTIONS.length}
        </Text>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.chapter}>{question.chapter.toUpperCase()}</Text>

        <View style={styles.scenarioCard}>
          <Text style={styles.scenarioLabel}>SCENARIO</Text>
          <Text style={styles.scenarioText}>{question.scenario}</Text>
          <Text style={styles.questionText}>{question.question}</Text>
        </View>

        {question.choices.map((c) => {
          const isSel = selected === c.id;
          const iconName = CHOICE_ICONS[question.id]?.[c.id] ?? "ellipse-outline";
          return (
            <Pressable
              key={c.id}
              style={[styles.choice, isSel && styles.choiceSelected]}
              onPress={() => onSelect(c.id)}
            >
              <View style={styles.iconCircle}>
                <Ionicons name={iconName} size={22} color={Colors.accent.primary} />
              </View>
              <View style={styles.choiceBody}>
                <Text style={styles.choiceTitle}>{c.title}</Text>
                <Text style={styles.choiceDesc}>{c.description}</Text>
              </View>
              <View
                style={[styles.radio, isSel && styles.radioSelected]}
              />
            </Pressable>
          );
        })}

        <View style={styles.navRow}>
          {index > 0 && (
            <Pressable style={styles.backBtn} onPress={onBack}>
              <Text style={styles.backText}>Back</Text>
            </Pressable>
          )}
          <Pressable
            style={[
              styles.continueBtn,
              !selected && styles.continueDisabled,
              { flex: index > 0 ? 1 : undefined, width: index > 0 ? undefined : "100%" },
            ]}
            disabled={!selected || submitting}
            onPress={onContinue}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.continueText}>
                {isLast ? "Reveal Insight" : "Continue"}
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },
  header: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 8 },
  title: {
    color: Colors.text.primary,
    fontSize: 24,
    fontWeight: "400",
    marginBottom: 4,
    fontFamily: "Lora_700Bold",
  },
  progressLabel: {
    color: Colors.text.muted,
    fontSize: 12,
    marginBottom: 10,
    fontFamily: "Inter_400Regular",
  },
  progressBg: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.accent.primary,
  },
  content: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  chapter: {
    color: Colors.text.muted,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: "600",
    marginBottom: 14,
    fontFamily: "Inter_500Medium",
  },
  scenarioCard: {
    backgroundColor: Colors.bg.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    marginBottom: 24,
  },
  scenarioLabel: {
    color: Colors.accent.primary,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 2,
    marginBottom: 10,
    fontFamily: "Inter_500Medium",
  },
  scenarioText: {
    color: Colors.text.primary,
    fontSize: 17,
    lineHeight: 26,
    marginBottom: 12,
    fontFamily: "Lora_400Regular",
  },
  questionText: {
    color: Colors.text.muted,
    fontSize: 14,
    fontStyle: "italic",
    fontFamily: "Inter_400Regular",
  },
  choice: {
    backgroundColor: Colors.bg.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 12,
  },
  choiceSelected: {
    borderColor: Colors.accent.primary,
    borderWidth: 2,
    backgroundColor: Colors.bg.elevated,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.bg.elevated,
    alignItems: "center",
    justifyContent: "center",
  },
  choiceBody: { flex: 1 },
  choiceTitle: {
    color: Colors.text.primary,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
    fontFamily: "Inter_600SemiBold",
  },
  choiceDesc: { color: Colors.text.muted, fontSize: 13, fontFamily: "Inter_400Regular" },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  radioSelected: {
    borderColor: Colors.accent.primary,
    backgroundColor: Colors.accent.primary,
  },
  navRow: { flexDirection: "row", gap: 12, marginTop: 20 },
  backBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backText: { color: Colors.text.muted, fontWeight: "500", fontFamily: "Inter_500Medium" },
  continueBtn: {
    backgroundColor: Colors.accent.primary,
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  continueDisabled: { opacity: 0.5 },
  continueText: { color: "#FFFFFF", fontWeight: "600", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
