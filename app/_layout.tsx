import React, { useCallback } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import {
  Literata_500Medium,
  Literata_600SemiBold,
  Literata_700Bold,
} from "@expo-google-fonts/literata";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from "@expo-google-fonts/dm-sans";
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
    Literata_500Medium,
    Literata_600SemiBold,
    Literata_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
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