import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

export default function Profile() {
  const { user, signOut } = useAuth();
  const [name, setName] = useState<string>("");
  const [crossroadsCount, setCrossroadsCount] = useState(0);
  const [chatCount, setChatCount] = useState(0);
  const [insightCount, setInsightCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: profile }, answers, chats, insights] = await Promise.all([
        supabase.from("profiles").select("name").eq("id", user.id).maybeSingle(),
        supabase
          .from("crossroads_answers")
          .select("question_id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("chat_messages")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("insights")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
      ]);
      if (profile?.name) setName(profile.name);
      else if (user.email) setName(user.email.split("@")[0]);
      setCrossroadsCount(Math.floor((answers.count ?? 0) / 5));
      setChatCount(chats.count ?? 0);
      setInsightCount(insights.count ?? 0);
    })();
  }, [user]);

  const confirmSignOut = () => {
    Alert.alert("Sign out?", "You can sign back in anytime.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => signOut() },
    ]);
  };

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Profile</Text>

        <View style={styles.card}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={28} color={Colors.accent.primary} />
          </View>
          <Text style={styles.name}>{name || "Friend"}</Text>
          <Text style={styles.email}>{user?.email ?? ""}</Text>
        </View>

        <Text style={styles.sectionLabel}>YOUR JOURNEY</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{crossroadsCount}</Text>
            <Text style={styles.statLabel}>Crossroads</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{insightCount}</Text>
            <Text style={styles.statLabel}>Insights</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{chatCount}</Text>
            <Text style={styles.statLabel}>Messages</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>ABOUT</Text>
        <View style={styles.card}>
          <Text style={styles.aboutText}>
            Hearth is a quiet space for reflection. Your conversations and
            insights remain private to you.
          </Text>
        </View>

        <Pressable style={styles.signOutBtn} onPress={confirmSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
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
  },
  card: {
    backgroundColor: Colors.bg.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.bg.elevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  name: {
    color: Colors.text.primary,
    fontSize: 20,
    fontWeight: "500",
    marginBottom: 4,
  },
  email: { color: Colors.text.muted, fontSize: 13 },
  sectionLabel: {
    color: Colors.text.muted,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: "600",
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
  },
  stat: {
    flex: 1,
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
  },
  statValue: {
    color: Colors.accent.primary,
    fontSize: 26,
    fontWeight: "500",
    marginBottom: 4,
  },
  statLabel: { color: Colors.text.muted, fontSize: 12 },
  aboutText: {
    color: Colors.text.secondary,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
  signOutBtn: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    marginTop: 8,
  },
  signOutText: { color: Colors.text.muted, fontSize: 15, fontWeight: "500" },
});
