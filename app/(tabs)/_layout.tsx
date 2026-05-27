import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { ColorValue } from "react-native";
import { Colors } from "../../constants/colors";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

function TabIcon({
  active,
  inactive,
  focused,
  color,
}: {
  active: IconName;
  inactive: IconName;
  focused: boolean;
  color: ColorValue;
}) {
  return (
    <Ionicons
      name={focused ? active : inactive}
      size={22}
      color={color as string}
    />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.bg.primary,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "500" },
        tabBarActiveTintColor: Colors.accent.primary,
        tabBarInactiveTintColor: Colors.text.muted,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon active="home" inactive="home-outline" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="crossroads"
        options={{
          title: "Crossroads",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon active="compass" inactive="compass-outline" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="insight"
        options={{
          title: "Insight",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon active="eye" inactive="eye-outline" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Ember",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon active="flame" inactive="flame-outline" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon active="person" inactive="person-outline" focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
