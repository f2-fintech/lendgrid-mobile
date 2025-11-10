import { FontAwesome } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

const TabRoot = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          headerShown: true,
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="dashboard" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: true,
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="user-circle-o" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="commissions"
        options={{
          title: "Commissions",
          headerShown: true,
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="money" color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabRoot;
