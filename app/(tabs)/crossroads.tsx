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
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../../constants/colors";
import { QUESTIONS, ChoiceId, ChoiceIcon } from "../../constants/questions";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { generateInsight } from "../../lib/openrouter";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const ICON_MAP: Record<ChoiceIcon, IoniconName> = {
  eco: "leaf",
  flame: "flame",
  forum: "chatbubbles",
  shield: "shield",
};

const SCENARIO_IMAGES: Record<number, any> = {
  1: require("../../assets/images/scenario-1.png"),
  2: require("../../assets/images/scenario-2.png"),
  3: require("../../assets/images/scenario-3.png"),
  4: require("../../assets/images/scenario-4.png"),
  5: require("../../assets/images/scenario-5.png"),
  6: require("../../assets/images/scenario-6.png"),
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
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={["top"]}>
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
            Scenario {index + 1} of {total}
          </Text>
          <Pressable onPress={() => setSaved((s) => !s)} hitSlop={10}>
            <Ionicons
              name={saved ? "bookmark" : "bookmark-outline"}
              size={24}
              color={Colors.accent.light}
            />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroWrap}>
            <LinearGradient
              colors={[Colors.bg.secondary, Colors.accent.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <ImageBackground
              source={SCENARIO_IMAGES[question.id] ?? SCENARIO_IMAGES[1]}
              style={styles.hero}
              imageStyle={styles.heroImg}
            >
              <LinearGradient
                colors={["transparent", "transparent", Colors.bg.primary]}
                locations={[0, 0.4, 1]}
                style={StyleSheet.absoluteFill}
              />
            </ImageBackground>
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.title}>Life Scenario</Text>
            <View style={styles.titleDivider} />
            <Text style={styles.chapter}>{question.chapter}</Text>
            <Text style={styles.scenario}>{question.scenario}</Text>
          </View>

          <View style={styles.choices}>
            {question.choices.map((c) => {
              const isSel = selected === c.id;
              const iconName = ICON_MAP[c.icon];
              return (
                <Pressable
                  key={c.id}
                  style={[styles.choice, isSel && styles.choiceSelected]}
                  onPress={() => onSelect(c.id)}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      isSel && styles.iconCircleSelected,
                    ]}
                  >
                    <Ionicons
                      name={iconName}
                      size={22}
                      color={
                        isSel ? Colors.accent.light : Colors.secondary
                      }
                    />
                  </View>
                  <Text
                    style={[
                      styles.choiceText,
                      isSel && styles.choiceTextSelected,
                    ]}
                  >
                    {c.text}
                  </Text>
                  {isSel && (
                    <Ionicons
                      name="radio-button-on"
                      size={16}
                      color={Colors.accent.light}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

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
            disabled={!selected || submitting}
            onPress={onContinue}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.accent.onPrimary} />
            ) : (
              <>
                <Text style={styles.ctaText}>
                  {isLast ? "Reveal Insight" : "Continue"}
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={Colors.accent.onPrimary}
                />
              </>
            )}
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
    fontSize: 24,
    lineHeight: 32,
    fontFamily: "Lora_600SemiBold",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 220,
    gap: 24,
  },
  heroWrap: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  hero: { flex: 1 },
  heroImg: { resizeMode: "cover", opacity: 0.8 },
  titleBlock: {
    gap: 8,
  },
  title: {
    color: Colors.accent.light,
    fontSize: 28,
    lineHeight: 36,
    fontFamily: "Lora_600SemiBold",
    letterSpacing: -0.5,
  },
  titleDivider: {
    width: 48,
    height: 2,
    backgroundColor: "rgba(200, 129, 58, 0.3)",
    marginVertical: 8,
  },
  chapter: {
    color: Colors.text.secondary,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    opacity: 0.7,
  },
  scenario: {
    color: Colors.text.secondary,
    fontSize: 18,
    lineHeight: 28,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  choices: {
    gap: 16,
    marginTop: 8,
  },
  choice: {
    backgroundColor: Colors.glassPanel,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSoft,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  choiceSelected: {
    borderColor: Colors.accent.primary,
    borderWidth: 1.5,
    backgroundColor: "rgba(200, 129, 58, 0.1)",
    shadowColor: Colors.accent.primary,
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(49, 78, 48, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleSelected: {
    backgroundColor: "rgba(200, 129, 58, 0.4)",
  },
  choiceText: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "Inter_400Regular",
  },
  choiceTextSelected: {
    color: Colors.accent.light,
    fontFamily: "Inter_500Medium",
  },
  ctaWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 24,
    paddingTop: 32,
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
