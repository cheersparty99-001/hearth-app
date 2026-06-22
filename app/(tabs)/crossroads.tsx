import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../../constants/colors";
import {
  PROFILER_META,
  PROFILER_QUESTIONS,
  PROFILER_PROFILES,
  calculateScores,
  determineProfiles,
  type Category,
  type ProfilerQuestion,
} from "../../constants/profiler";

export default function Crossroads() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Category>>({});

  const question = PROFILER_QUESTIONS[index];
  const selected = answers[question.id];
  const isLast = index === PROFILER_QUESTIONS.length - 1;
  const total = PROFILER_QUESTIONS.length;
  const progress = ((index + (selected ? 1 : 0)) / total) * 100;

  const onSelect = (category: Category) => {
    setAnswers((a) => ({ ...a, [question.id]: category }));
  };

  const onContinue = () => {
    if (!selected) return;
    if (!isLast) {
      setIndex((i) => i + 1);
      return;
    }

    // Calculate scores and determine profile(s)
    const scores = calculateScores(answers);
    const profiles = determineProfiles(scores);
    const profileIds = profiles.map((p) => p.id);

    // Navigate to result page
    router.push({
      pathname: "/(tabs)/profiler-result",
      params: {
        scores: JSON.stringify(scores),
        profileIds: JSON.stringify(profileIds),
      },
    });

    // Reset state for next time
    setIndex(0);
    setAnswers({});
  };

  const onBack = () => {
    if (index > 0) setIndex((i) => i - 1);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onBack} hitSlop={10} disabled={index === 0}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={
                index === 0 ? Colors.text.muted : Colors.accent.light
              }
            />
          </Pressable>
          <Text style={styles.headerTitle}>
            Question {index + 1} of {total}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressWrap}>
          <View style={styles.progressBg}>
            <View
              style={[styles.progressFill, { width: `${progress}%` }]}
            />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Question Card */}
          <LinearGradient
            colors={[Colors.bg.secondary, Colors.accent.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.questionBg}
          >
            <LinearGradient
              colors={["transparent", Colors.bg.primary]}
              start={{ x: 0, y: 0.4 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.questionInner}>
              <Text style={styles.questionEyebrow}>
                {PROFILER_META.subtitle}
              </Text>
              <Text style={styles.questionText}>{question.text}</Text>
            </View>
          </LinearGradient>

          {/* Options */}
          <View style={styles.options}>
            {question.options.map((opt) => {
              const isSel = selected === opt.category;
              return (
                <Pressable
                  key={opt.key}
                  style={[styles.option, isSel && styles.optionSelected]}
                  onPress={() => onSelect(opt.category)}
                >
                  <View
                    style={[
                      styles.radio,
                      isSel && styles.radioSelected,
                    ]}
                  >
                    {isSel && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.optionText,
                      isSel && styles.optionTextSelected,
                    ]}
                  >
                    {opt.text}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Fixed Continue Button */}
        <LinearGradient
          colors={[
            "transparent",
            Colors.bg.primary,
            Colors.bg.primary,
          ]}
          locations={[0, 0.5, 1]}
          style={styles.ctaWrap}
          pointerEvents="box-none"
        >
          <Pressable
            style={[styles.cta, !selected && styles.ctaDisabled]}
            disabled={!selected}
            onPress={onContinue}
          >
            <Text style={styles.ctaText}>
              {isLast ? "View Results" : "Continue"}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={18}
              color={Colors.accent.onPrimary}
            />
          </Pressable>
        </LinearGradient>
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
    color: Colors.text.primary,
    fontSize: 20,
    lineHeight: 28,
    fontFamily: "Lora_600SemiBold",
  },
  progressWrap: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  progressBg: {
    height: 6,
    backgroundColor: Colors.bg.elevated,
    borderRadius: 9999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.accent.light,
    borderRadius: 9999,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 200,
    gap: 24,
  },
  questionBg: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    minHeight: 180,
    shadowColor: Colors.accent.primary,
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  questionInner: {
    padding: 28,
    gap: 12,
  },
  questionEyebrow: {
    color: Colors.accent.light,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    opacity: 0.7,
  },
  questionText: {
    color: Colors.text.primary,
    fontSize: 22,
    lineHeight: 32,
    fontFamily: "Lora_600SemiBold",
    letterSpacing: -0.3,
  },
  options: {
    gap: 14,
  },
  option: {
    backgroundColor: Colors.glassPanel,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    borderTopWidth: 1,
    borderTopColor: Colors.borderSoft,
    borderRadius: 14,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  optionSelected: {
    borderColor: Colors.accent.primary,
    borderWidth: 1.5,
    backgroundColor: "rgba(200, 129, 58, 0.1)",
    shadowColor: Colors.accent.primary,
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "rgba(215, 199, 179, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: Colors.accent.light,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.accent.light,
  },
  optionText: {
    flex: 1,
    color: Colors.text.secondary,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "Inter_400Regular",
  },
  optionTextSelected: {
    color: Colors.accent.light,
    fontFamily: "Inter_500Medium",
  },
  ctaWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 24,
    paddingTop: 40,
    paddingBottom: 48,
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
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
  },
  ctaDisabled: { opacity: 0.5 },
  ctaText: {
    color: Colors.accent.onPrimary,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    fontWeight: "700",
    letterSpacing: 0.7,
  },
});