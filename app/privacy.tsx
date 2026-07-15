// NOTE: This is a good-faith starting template, NOT legal advice. Have a
// professional review it, and set the real contact email + effective date
// before submitting to the App Store / Google Play.
import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/colors";

const EFFECTIVE_DATE = "July 2026";
const CONTACT_EMAIL = "support@hearth.app"; // TODO: replace with your real address

function Section({ title, children }: { title: string; children: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.h2}>{title}</Text>
      <Text style={styles.body}>{children}</Text>
    </View>
  );
}

export default function Privacy() {
  const router = useRouter();
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={Colors.accent.light} />
          </Pressable>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.effective}>Effective {EFFECTIVE_DATE}</Text>

          <Section title="Who we are">
            {"Hearth is a personal reflection and wellbeing app. This policy explains what we collect and how we handle it."}
          </Section>

          <Section title="What we collect">
            {"• Your email address and optional display name.\n• Your Wellness Profiler answers and generated profile.\n• Messages you send to Ember, our AI companion.\nWe do not collect location, contacts, or advertising identifiers."}
          </Section>

          <Section title="How your data is stored">
            {"Your data is stored in our database (Supabase) and protected by row-level security so that only you can access your own records. We do not sell your data."}
          </Section>

          <Section title="AI processing">
            {"To generate Ember's replies and your insights, the relevant text is sent to our AI provider (Anthropic) through our secure server. Your API credentials are never exposed in the app."}
          </Section>

          <Section title="Not a medical service">
            {"Hearth supports self-reflection and is not therapy, diagnosis, or medical advice. If you are in crisis, contact Befrienders Malaysia at 03-7627 2929 or your local emergency services."}
          </Section>

          <Section title="Your choices">
            {`You can edit your name in the app and sign out at any time. To request access to or deletion of your data, email ${CONTACT_EMAIL}.`}
          </Section>

          <Section title="Children">
            {"Hearth is not intended for children under 13 (or the minimum age required in your country)."}
          </Section>

          <Section title="Changes">
            {"We may update this policy. Material changes will be reflected here with a new effective date."}
          </Section>

          <Section title="Contact">
            {`Questions? Email ${CONTACT_EMAIL}.`}
          </Section>
        </ScrollView>
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
  content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 48 },
  effective: {
    color: Colors.text.muted,
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    marginBottom: 20,
  },
  section: { marginBottom: 24 },
  h2: {
    color: Colors.accent.light,
    fontSize: 17,
    fontFamily: "Literata_600SemiBold",
    marginBottom: 8,
  },
  body: {
    color: Colors.text.secondary,
    fontSize: 15,
    lineHeight: 24,
    fontFamily: "DMSans_400Regular",
  },
});
