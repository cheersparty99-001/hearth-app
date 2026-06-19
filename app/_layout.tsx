import React, { useCallback } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Lora_400Regular,
  Lora_600SemiBold,
  Lora_700Bold,
} from "@expo-google-fonts/lora";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { Colors } from "../constants/colors";

SplashScreen.preventAutoHideAsync();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  React.useEffect(() => {
    if (loading) return;
    const first = segments[0] as string | undefined;
    const inTabs = first === "(tabs)";
    const onAuthScreen =
      first === "onboarding" || first === "index" || first === undefined;

    if (!session && inTabs) {
      router.replace("/onboarding");
    } else if (
      session &&
      onAuthScreen &&
      first !== undefined &&
      first !== "index"
    ) {
      router.replace("/(tabs)/home");
    }
  }, [session, loading, segments]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={Colors.accent.primary} size="large" />
      </View>
    );
  }
  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Lora_400Regular,
    Lora_600SemiBold,
    Lora_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <AuthProvider>
        <AuthGate>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "fade",
              contentStyle: { backgroundColor: Colors.bg.primary },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </AuthGate>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});