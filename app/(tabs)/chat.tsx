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
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { chatWithEmber } from "../../lib/openrouter";

interface Msg {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "I'm feeling stuck in my current situation",
  "Help me understand my patterns",
  "What should I reflect on today?",
];

const WELCOME: Msg = {
  id: "welcome",
  role: "assistant",
  content:
    "Welcome back. I sense you have been carrying something. Take your time — what's stirring for you right now?",
};

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
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const showSuggestions = useMemo(
    () => messages.length <= 1 && !sending,
    [messages.length, sending]
  );

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="flame" size={18} color={Colors.accent.primary} />
        </View>
        <View>
          <Text style={styles.name}>Ember</Text>
          <Text style={styles.role}>Your companion</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubbleRow,
                item.role === "user" ? styles.rowEnd : styles.rowStart,
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  item.role === "user" ? styles.bubbleUser : styles.bubbleEmber,
                ]}
              >
                <Text
                  style={
                    item.role === "user"
                      ? styles.bubbleUserText
                      : styles.bubbleEmberText
                  }
                >
                  {item.content}
                </Text>
              </View>
            </View>
          )}
          ListFooterComponent={
            <View>
              {sending && (
                <View style={[styles.bubbleRow, styles.rowStart]}>
                  <View style={[styles.bubble, styles.bubbleEmber]}>
                    <ActivityIndicator color={Colors.accent.primary} />
                  </View>
                </View>
              )}
              {showSuggestions && (
                <View style={styles.suggestions}>
                  {SUGGESTIONS.map((s) => (
                    <Pressable
                      key={s}
                      style={styles.suggestion}
                      onPress={() => send(s)}
                    >
                      <Text style={styles.suggestionText}>{s}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          }
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Share what's on your mind..."
            placeholderTextColor={Colors.text.muted}
            value={input}
            onChangeText={setInput}
            multiline
            editable={!sending}
          />
          <Pressable
            style={[styles.sendBtn, (!input.trim() || sending) && styles.sendDisabled]}
            disabled={!input.trim() || sending}
            onPress={() => send(input)}
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Lora_600SemiBold",
  },
  role: { color: Colors.text.muted, fontSize: 12, fontFamily: "Inter_400Regular" },
  body: { flex: 1 },
  list: { padding: 16, paddingBottom: 24 },
  bubbleRow: { flexDirection: "row", marginBottom: 10 },
  rowStart: { justifyContent: "flex-start" },
  rowEnd: { justifyContent: "flex-end" },
  bubble: {
    maxWidth: "82%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  bubbleUser: {
    backgroundColor: Colors.accent.primary,
    borderBottomRightRadius: 4,
  },
  bubbleEmber: {
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 4,
  },
  bubbleUserText: { color: "#FFFFFF", fontSize: 15, lineHeight: 22, fontFamily: "Inter_400Regular" },
  bubbleEmberText: { color: Colors.text.primary, fontSize: 15, lineHeight: 22, fontFamily: "Inter_400Regular" },
  suggestions: { marginTop: 14, gap: 8 },
  suggestion: {
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 14,
  },
  suggestionText: { color: Colors.text.secondary, fontSize: 14, fontFamily: "Inter_400Regular" },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: Colors.text.primary,
    fontSize: 15,
    maxHeight: 120,
    fontFamily: "Inter_400Regular",
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.accent.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendDisabled: { opacity: 0.5 },
});
