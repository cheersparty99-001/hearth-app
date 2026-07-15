import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Dimensions,
  Alert,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/colors";
import { useAuth } from "../context/AuthContext";

const { width } = Dimensions.get("window");

export default function Onboarding() {
  const router = useRouter();
  const { signIn, signUp, resetPassword, signInWithProvider } = useAuth();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const goTo = (idx: number) => {
    scrollRef.current?.scrollTo({ x: idx * width, animated: true });
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== page) setPage(next);
  };

  const submit = async () => {
    if (!email || !password) {
      Alert.alert("Missing fields", "Please enter both email and password.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Password too short", "Use at least 6 characters.");
      return;
    }
    setSubmitting(true);
    if (mode === "signup") {
      const { error, needsConfirmation } = await signUp(email, password);
      setSubmitting(false);
      if (error) {
        Alert.alert("Sign up failed", error);
        return;
      }
      if (needsConfirmation) {
        Alert.alert(
          "Confirm your email",
          "We sent a confirmation link to your inbox. Confirm it, then sign in."
        );
        setMode("signin");
        setPassword("");
        return;
      }
      router.replace("/(tabs)/home");
      return;
    }

    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      Alert.alert("Sign in failed", error);
      return;
    }
    router.replace("/(tabs)/home");
  };

  const onSocial = async (provider: "google" | "apple") => {
    setSubmitting(true);
    const { error } = await signInWithProvider(provider);
    setSubmitting(false);
    if (error) {
      Alert.alert("Sign-in failed", error);
      return;
    }
    // On success the auth listener updates the session; AuthGate routes in.
    // Navigate explicitly too, in case we're already on an auth screen.
    router.replace("/(tabs)/home");
  };

  const onForgotPassword = async () => {
    if (!email) {
      Alert.alert("Enter your email", "Type your email above, then tap reset.");
      return;
    }
    const { error } = await resetPassword(email);
    Alert.alert(
      error ? "Could not send reset" : "Check your email",
      error ?? "We sent a password reset link to your inbox."
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <StatusBar style="light" />
      <View style={styles.topBar}>
        <View style={{ width: 50 }} />
        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[styles.dot, page === i && styles.dotActive]}
            />
          ))}
        </View>
        <Pressable onPress={() => goTo(2)} hitSlop={12}>
          <Text style={styles.skip}>
            {page < 2 ? "Skip" : ""}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.slide, { width }]}>
          <Ionicons name="trail-sign" size={72} color={Colors.accent.primary} style={{ marginBottom: 24 }} />
          <Text style={styles.slideTitle}>Discover Your Path</Text>
          <Text style={styles.slideBody}>
            Answer fifteen brief questions to map your wellness landscape.
            Quiet insight awaits.
          </Text>
          <Pressable style={styles.nextBtn} onPress={() => goTo(1)}>
            <Text style={styles.nextBtnText}>Next</Text>
          </Pressable>
        </View>

        <View style={[styles.slide, { width }]}>
          <Ionicons name="flame" size={72} color={Colors.accent.primary} style={{ marginBottom: 24 }} />
          <Text style={styles.slideTitle}>Meet Ember</Text>
          <Text style={styles.slideBody}>
            Your always-available companion for reflection and support. Calm,
            unhurried, deeply present.
          </Text>
          <Pressable style={styles.nextBtn} onPress={() => goTo(2)}>
            <Text style={styles.nextBtnText}>Next</Text>
          </Pressable>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={[styles.slide, { width }]}
        >
          <Ionicons name="sparkles" size={72} color={Colors.accent.primary} style={{ marginBottom: 24 }} />
          <Text style={styles.slideTitle}>
            {mode === "signup" ? "Create Account" : "Welcome Back"}
          </Text>
          <Text style={styles.slideBody}>
            {mode === "signup"
              ? "Your reflections stay private to you."
              : "Sign in to continue your journey."}
          </Text>

          <View style={styles.form}>
            <TextInput
              placeholder="Email"
              placeholderTextColor={Colors.text.muted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor={Colors.text.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />

            <Pressable
              style={[styles.cta, submitting && styles.ctaDisabled]}
              onPress={submit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.ctaText}>
                  {mode === "signup" ? "Create Account" : "Sign In"}
                </Text>
              )}
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {Platform.OS === "ios" && (
              <Pressable
                style={[styles.social, styles.socialApple]}
                onPress={() => onSocial("apple")}
                disabled={submitting}
              >
                <Ionicons name="logo-apple" size={20} color="#0D1A0D" />
                <Text style={styles.socialAppleText}>Continue with Apple</Text>
              </Pressable>
            )}

            <Pressable
              style={[styles.social, styles.socialGoogle]}
              onPress={() => onSocial("google")}
              disabled={submitting}
            >
              <Ionicons name="logo-google" size={18} color="#E8F0E8" />
              <Text style={styles.socialGoogleText}>Continue with Google</Text>
            </Pressable>

            <Pressable
              onPress={() => setMode(mode === "signup" ? "signin" : "signup")}
            >
              <Text style={styles.toggle}>
                {mode === "signup"
                  ? "I have an account. Sign in."
                  : "Create an account."}
              </Text>
            </Pressable>

            {mode === "signin" && (
              <Pressable onPress={onForgotPassword}>
                <Text style={styles.forgot}>Forgot password?</Text>
              </Pressable>
            )}
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  dots: { flexDirection: "row", gap: 8 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: { backgroundColor: Colors.accent.primary, width: 22 },
  skip: { color: Colors.text.muted, fontSize: 14, width: 50, textAlign: "right", fontFamily: "DMSans_400Regular" },
  slide: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  slideTitle: {
    color: Colors.text.primary,
    fontSize: 30,
    fontWeight: "400",
    marginBottom: 16,
    textAlign: "center",
    fontFamily: "Literata_700Bold",
  },
  slideBody: {
    color: Colors.text.muted,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 320,
    marginBottom: 32,
    fontFamily: "DMSans_400Regular",
  },
  nextBtn: {
    backgroundColor: Colors.accent.primary,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 50,
    marginTop: 16,
  },
  nextBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600", fontFamily: "DMSans_600SemiBold" },
  form: { width: "100%", maxWidth: 360 },
  input: {
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.text.primary,
    marginBottom: 12,
    fontSize: 15,
    fontFamily: "DMSans_400Regular",
  },
  cta: {
    backgroundColor: Colors.accent.primary,
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: "center",
    marginTop: 8,
  },
  ctaDisabled: { opacity: 0.7 },
  ctaText: { color: "#FFFFFF", fontWeight: "600", fontSize: 15, fontFamily: "DMSans_600SemiBold" },
  toggle: {
    color: Colors.accent.light,
    fontSize: 14,
    textAlign: "center",
    marginTop: 16,
    fontFamily: "DMSans_400Regular",
  },
  forgot: {
    color: Colors.text.muted,
    fontSize: 13,
    textAlign: "center",
    marginTop: 12,
    fontFamily: "DMSans_400Regular",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.text.muted,
    fontSize: 12,
    fontFamily: "DMSans_400Regular",
  },
  social: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 52,
    borderRadius: 50,
    marginBottom: 12,
  },
  socialApple: {
    backgroundColor: "#E8F0E8",
  },
  socialAppleText: {
    color: "#0D1A0D",
    fontSize: 15,
    fontFamily: "DMSans_600SemiBold",
  },
  socialGoogle: {
    backgroundColor: "rgba(30, 58, 30, 0.6)",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  socialGoogleText: {
    color: "#E8F0E8",
    fontSize: 15,
    fontFamily: "DMSans_600SemiBold",
  },
});