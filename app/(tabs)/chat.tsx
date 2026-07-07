import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { chatWithEmber } from "../../lib/claude";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

interface Msg {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

const WELCOME: Msg = {
  id: "welcome",
  role: "assistant",
  content: "I'm here for you. How are you feeling today?",
  createdAt: new Date(),
};

type QuickAction = {
  label: string;
  icon: IoniconName;
  iconColor: string;
  prompt: string;
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "Reflect",
    icon: "body",
    iconColor: "#aecfa8",
    prompt: "Help me reflect on what I'm carrying today.",
  },
  {
    label: "Encourage Me",
    icon: "heart",
    iconColor: "#ffb876",
    prompt: "I could use some encouragement right now.",
  },
  {
    label: "Help Me Calm",
    icon: "leaf",
    iconColor: "#fcba65",
    prompt: "Help me find calm. Let's breathe together.",
  },
];

function formatTime(d: Date): string {
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const h = hours % 12 || 12;
  const m = minutes.toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  return `${h}:${m} ${ampm}`;
}

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<Msg>>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("id, role, content, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(100);
      if (data && data.length > 0) {
        const loaded: Msg[] = data.map((d: any) => ({
          id: d.id,
          role: d.role as "user" | "assistant",
          content: d.content,
          createdAt: new Date(d.created_at),
        }));
        setMessages([WELCOME, ...loaded]);
      }
    })();
  }, [user]);

  useEffect(() => {
    const t = setTimeout(
      () => listRef.current?.scrollToEnd({ animated: true }),
      100
    );
    return () => clearTimeout(t);
  }, [messages]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setInput("");

    const userMsg: Msg = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
      createdAt: new Date(),
    };
    setMessages((m) => [...m, userMsg]);
    setSending(true);

    if (user) {
      supabase
        .from("chat_messages")
        .insert({ user_id: user.id, role: "user", content: trimmed })
        .then(() => undefined);
    }

    try {
      const history = [...messages, userMsg]
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));
      const reply = await chatWithEmber(history);

      const emberMsg: Msg = {
        id: `e-${Date.now()}`,
        role: "assistant",
        content: reply,
        createdAt: new Date(),
      };
      setMessages((m) => [...m, emberMsg]);

      if (user) {
        supabase
          .from("chat_messages")
          .insert({ user_id: user.id, role: "assistant", content: reply })
          .then(() => undefined);
      }
    } catch (e: any) {
      setMessages((m) => [
        ...m,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content:
            "I'm having trouble hearing you right now. Take a breath, and try again in a moment.",
          createdAt: new Date(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const isLastEmber = useMemo(() => {
    if (messages.length === 0) return -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return i;
    }
    return -1;
  }, [messages]);

  const renderItem = ({ item, index }: { item: Msg; index: number }) => {
    if (item.role === "assistant") {
      const focus = index === isLastEmber && index === messages.length - 1;
      return (
        <View style={styles.emberRow}>
          <View style={styles.emberAvatar}>
            <Ionicons
              name="flame"
              size={16}
              color={Colors.accent.light}
            />
          </View>
          <View
            style={[
              styles.bubbleEmber,
              focus && styles.bubbleEmberFocus,
            ]}
          >
            <Text style={styles.bubbleText}>{item.content}</Text>
            <View style={styles.emberMeta}>
              {focus && (
                <Ionicons
                  name="heart"
                  size={12}
                  color={Colors.accent.light}
                />
              )}
              <View style={{ flex: 1 }} />
              <Text style={styles.timestamp}>
                {formatTime(item.createdAt)}
              </Text>
            </View>
          </View>
        </View>
      );
    }
    return (
      <View style={styles.userRow}>
        <View style={styles.bubbleUser}>
          <Text style={styles.bubbleText}>{item.content}</Text>
          <View style={styles.userMeta}>
            <Text style={styles.timestamp}>
              {formatTime(item.createdAt)}
            </Text>
            <Ionicons
              name="checkmark-done"
              size={12}
              color={Colors.accent.light}
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable hitSlop={10}>
              <Ionicons
                name="arrow-back"
                size={24}
                color={Colors.text.primary}
              />
            </Pressable>
            <View>
              <View style={styles.headerNameRow}>
                <Ionicons
                  name="flame"
                  size={20}
                  color={Colors.accent.light}
                />
                <Text style={styles.headerName}>Ember</Text>
              </View>
              <Text style={styles.headerRole}>Your AI Companion</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Pressable hitSlop={10}>
              <Ionicons
                name="settings-outline"
                size={22}
                color={Colors.text.secondary}
              />
            </Pressable>
            <View style={styles.headerAvatar}>
              <Ionicons name="person" size={14} color={Colors.accent.light} />
            </View>
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.body}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.list}
            renderItem={renderItem}
            ListFooterComponent={
              sending ? (
                <View style={styles.emberRow}>
                  <View style={styles.emberAvatar}>
                    <Ionicons
                      name="flame"
                      size={16}
                      color={Colors.accent.light}
                    />
                  </View>
                  <View style={styles.bubbleEmber}>
                    <ActivityIndicator color={Colors.accent.light} />
                  </View>
                </View>
              ) : null
            }
          />

          <View style={styles.bottomArea}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickActions}
            >
              {QUICK_ACTIONS.map((a) => (
                <Pressable
                  key={a.label}
                  style={styles.quickBtn}
                  onPress={() => send(a.prompt)}
                  disabled={sending}
                >
                  <Ionicons name={a.icon} size={18} color={a.iconColor} />
                  <Text style={styles.quickLabel}>{a.label}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.inputShell}>
              <View style={styles.inputBar}>
                <TextInput
                  style={styles.input}
                  placeholder="Message Ember..."
                  placeholderTextColor="rgba(215, 195, 179, 0.5)"
                  value={input}
                  onChangeText={setInput}
                  multiline
                  editable={!sending}
                />
                <Pressable
                  style={[
                    styles.sendBtn,
                    (!input.trim() || sending) && styles.sendDisabled,
                  ]}
                  disabled={!input.trim() || sending}
                  onPress={() => send(input)}
                >
                  <Ionicons
                    name="arrow-up"
                    size={20}
                    color={Colors.accent.onPrimary}
                  />
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerName: {
    color: Colors.text.primary,
    fontSize: 24,
    lineHeight: 28,
    fontFamily: "Lora_600SemiBold",
  },
  headerRole: {
    color: Colors.text.secondary,
    fontSize: 14,
    opacity: 0.8,
    fontFamily: "Inter_500Medium",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
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
  body: { flex: 1 },
  list: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 32,
  },
  emberRow: {
    flexDirection: "row",
    gap: 16,
    maxWidth: "85%",
    marginBottom: 32,
  },
  userRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 32,
  },
  emberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.bg.secondary,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  bubbleEmber: {
    backgroundColor: Colors.chatBubbleEmber,
    borderTopWidth: 1,
    borderTopColor: "rgba(212, 232, 212, 0.05)",
    borderRadius: 12,
    borderTopLeftRadius: 0,
    padding: 16,
    flex: 1,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 15,
    shadowOffset: { width: 4, height: 4 },
  },
  bubbleEmberFocus: {
    borderWidth: 1,
    borderColor: "rgba(255, 184, 118, 0.2)",
  },
  bubbleUser: {
    backgroundColor: Colors.chatBubbleUser,
    borderTopWidth: 1,
    borderTopColor: "rgba(212, 232, 212, 0.08)",
    borderRadius: 12,
    borderTopRightRadius: 0,
    padding: 16,
    maxWidth: "85%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 15,
    shadowOffset: { width: -4, height: 4 },
  },
  bubbleText: {
    color: Colors.text.primary,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "Inter_400Regular",
  },
  emberMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 4,
  },
  userMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 8,
    gap: 4,
  },
  timestamp: {
    color: Colors.text.secondary,
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },
  bottomArea: {
    paddingBottom: 8,
  },
  quickActions: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 12,
  },
  quickBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: Colors.bg.low,
    borderWidth: 1,
    borderColor: "rgba(82, 68, 56, 0.3)",
  },
  quickLabel: {
    color: Colors.text.primary,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.7,
  },
  inputShell: {
    backgroundColor: Colors.glassPanel,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSoft,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bg.lowest,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 8,
    minHeight: 48,
  },
  input: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    paddingVertical: 6,
    maxHeight: 120,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.accent.light,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.accent.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  sendDisabled: { opacity: 0.5 },
});
