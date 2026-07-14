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

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

type StatItem = { value: number; label: string; icon: IoniconName };

export default function Profile() {
  const { user, signOut } = useAuth();
  const [name, setName] = useState<string>("Friend");
  const [crossroadsCount, setCrossroadsCount] = useState(0);
  const [chatCount, setChatCount] = useState(0);
  const [insightCount, setInsightCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: profile }, answers, chats, insights] = await Promise.all([
        supabase
          .from("profiles")
          .select("name")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("profiler_answers")
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
      setCrossroadsCount(answers.count ?? 0);
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

  const stats: StatItem[] = [
    { value: crossroadsCount, label: "Questions", icon: "book" },
    { value: insightCount, label: "Insights", icon: "bulb" },
    { value: chatCount, label: "Messages", icon: "chatbubbles" },
  ];

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <Pressable hitSlop={10}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={Colors.accent.light}
            />
          </Pressable>
          <Text style={styles.headerBrand}>Hearth</Text>
          <Pressable hitSlop={10}>
            <Ionicons
              name="settings-outline"
              size={22}
              color={Colors.text.secondary}
            />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileBlock}>
            <View style={styles.avatarOuter}>
              <View style={styles.avatarInner}>
                <Ionicons
                  name="person"
                  size={40}
                  color={Colors.accent.light}
                />
              </View>
            </View>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.email}>{user?.email ?? ""}</Text>
          </View>

          <View style={styles.sectionLabelRow}>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionLabel}>YOUR JOURNEY</Text>
            <View style={styles.sectionLine} />
          </View>

          <View style={styles.statsRow}>
            {stats.map((s) => (
              <View key={s.label} style={styles.statCard}>
                <Ionicons
                  name={s.icon}
                  size={18}
                  color={Colors.accent.light}
                />
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.menuCard}>
            <MenuRow icon="notifications-outline" label="Notifications" />
            <Divider />
            <MenuRow icon="shield" label="Privacy" />
            <Divider />
            <MenuRow icon="leaf" label="Environment" trailing="Fireside" />
            <Divider />
            <MenuRow icon="bulb" label="About Hearth" />
          </View>

          <View style={styles.aboutCard}>
            <Ionicons
              name="flame"
              size={24}
              color={Colors.accent.light}
              style={{ marginBottom: 12 }}
            />
            <Text style={styles.aboutText}>
              Hearth is a quiet space for reflection. Your conversations and
              insights remain private to you.
            </Text>
          </View>

          <Pressable style={styles.signOutBtn} onPress={confirmSignOut}>
            <Ionicons name="log-out-outline" size={20} color={Colors.text.secondary} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function MenuRow({
  icon,
  label,
  trailing,
}: {
  icon: IoniconName;
  label: string;
  trailing?: string;
}) {
  return (
    <Pressable style={styles.menuRow}>
      <View style={styles.menuIcon}>
        <Ionicons name={icon} size={18} color={Colors.accent.light} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <View style={{ flex: 1 }} />
      {trailing && <Text style={styles.menuTrailing}>{trailing}</Text>}
      <Ionicons
        name="chevron-forward"
        size={18}
        color={Colors.text.secondary}
      />
    </Pressable>
  );
}

function Divider() {
  return <View style={styles.divider} />;
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
    fontFamily: "Literata_700Bold",
    letterSpacing: -0.5,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 140,
    gap: 24,
  },
  profileBlock: {
    alignItems: "center",
    paddingVertical: 24,
  },
  avatarOuter: {
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 2,
    borderColor: "rgba(255, 184, 118, 0.2)",
    padding: 4,
    marginBottom: 16,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: Colors.bg.card,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.accent.primary,
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  name: {
    color: Colors.text.primary,
    fontSize: 28,
    lineHeight: 36,
    fontFamily: "Literata_700Bold",
    letterSpacing: -0.5,
  },
  email: {
    color: Colors.text.secondary,
    fontSize: 14,
    marginTop: 4,
    fontFamily: "DMSans_400Regular",
    opacity: 0.8,
  },
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
    fontFamily: "DMSans_500Medium",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.glassPanel,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSoft,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: "center",
    gap: 6,
  },
  statValue: {
    color: Colors.accent.light,
    fontSize: 28,
    lineHeight: 32,
    fontFamily: "Literata_700Bold",
  },
  statLabel: {
    color: Colors.text.secondary,
    fontSize: 12,
    fontFamily: "DMSans_500Medium",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  sectionTitle: {
    color: Colors.text.primary,
    fontSize: 24,
    lineHeight: 32,
    fontFamily: "Literata_600SemiBold",
  },
  menuCard: {
    backgroundColor: Colors.glassPanel,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSoft,
    borderRadius: 16,
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(200, 129, 58, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    color: Colors.text.primary,
    fontSize: 16,
    fontFamily: "DMSans_500Medium",
  },
  menuTrailing: {
    color: Colors.text.secondary,
    fontSize: 14,
    fontFamily: "DMSans_400Regular",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginLeft: 64,
  },
  aboutCard: {
    backgroundColor: Colors.bg.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 184, 118, 0.05)",
    alignItems: "center",
  },
  aboutText: {
    color: Colors.text.secondary,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    fontFamily: "DMSans_400Regular",
  },
  signOutBtn: {
    height: 56,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "rgba(82, 68, 56, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  signOutText: {
    color: Colors.text.secondary,
    fontSize: 15,
    fontFamily: "DMSans_500Medium",
    letterSpacing: 0.5,
  },
});
