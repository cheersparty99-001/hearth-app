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
          backgroundColor: "rgba(5, 17, 5, 0.95)",
          borderTopColor: "rgba(255,255,255,0.05)",
          borderTopWidth: 1,
          height: 68,
          paddingTop: 8,
          paddingBottom: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: "Inter_500Medium",
          letterSpacing: 0.5,
          marginTop: 2,
        },
        tabBarActiveTintColor: Colors.accent.light,
        tabBarInactiveTintColor: "rgba(157, 190, 152, 0.6)",
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              active="home"
              inactive="home-outline"
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="crossroads"
        options={{
          title: "Journey",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              active="book"
              inactive="book-outline"
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="insight"
        options={{
          title: "Insights",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              active="bulb"
              inactive="bulb-outline"
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Ember",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              active="flame"
              inactive="flame-outline"
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="meditation"
        options={{
          title: "Meditate",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              active="leaf"
              inactive="leaf-outline"
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              active="person"
              inactive="person-outline"
              focused={focused}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
