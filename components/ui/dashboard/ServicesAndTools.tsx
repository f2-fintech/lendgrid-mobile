import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAppConfig } from '@/contexts/ConfigContext';
import { decodeJwt } from '@/lib/utils/utils';
import { DRAWER_ITEMS, DrawerRoute } from '@/app/(tab)/_layout';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
// Calculate item width accounting for padding on the sides
const ITEM_WIDTH = (width - 40) / COLUMN_COUNT; 

export default function ServicesAndTools() {
  const theme = useTheme();
  const isDark = !!theme?.dark;
  const router = useRouter();
  const { config } = useAppConfig();
  const [role, setRole] = useState("");

  useEffect(() => {
    const loadRole = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const claims = decodeJwt(token);
        const userRole = String(claims?.role || claims?.user?.role || "").toLowerCase();
        setRole(userRole);
      } catch (e) {
        console.error("Failed to load role", e);
      }
    };
    loadRole();
  }, []);

  const isAggregatorAdmin = role === "aggregator_admin";

  const visibleItems = useMemo(() => {
    let items = DRAWER_ITEMS.filter(
      (item) => (item.route !== "/invite" && item.route !== "/team") || isAggregatorAdmin
    );

    if (!config.showEmiCalculator) {
      items = items.filter(item => item.route !== "/emi-calculator");
    }
    if (!config.showCibilCheck) {
      items = items.filter(item => item.route !== "external-cibil-score");
    }

    if (config.isReviewMode) {
      items = items.filter(item => 
        item.route !== "/training-resources" && 
        item.route !== "/loan-products"
      );

      items = items.map(item => {
        if (item.route === "/banker-list") {
          return { ...item, label: `${config.terminology.bankerWord} Lists` };
        }
        if (item.route === "external-eligibility") {
          return { ...item, label: `Check ${config.terminology.eligibilityWord}` };
        }
        return item;
      });
    }

    return items;
  }, [isAggregatorAdmin, config]);

  const openWebsite = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url, {
        toolbarColor: theme.colors.background,
        controlsColor: theme.colors.primary,
        enableBarCollapsing: true,
        showTitle: true,
      });
    } catch {
      Alert.alert("Error", "Could not open this page.");
    }
  };

  const handleNavigate = (route: DrawerRoute) => {
    if (route === "external-cibil-score") {
      openWebsite("https://f2fintech.com/check-cibil-score");
      return;
    }
    if (route === "external-eligibility") {
      openWebsite("https://finwise-eligibility.netlify.app/");
      return;
    }
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.sectionTitle,
          { color: isDark ? "rgba(255,255,255,0.92)" : theme.colors.onSurface }
        ]}
      >
        Services and Tools
      </Text>

      <View style={styles.grid}>
        {visibleItems.map((item, index) => (
          <TouchableOpacity 
            key={`${item.route}-${index}`} 
            style={[styles.itemContainer, { width: ITEM_WIDTH }]}
            activeOpacity={0.7}
            onPress={() => handleNavigate(item.route)}
          >
            <View style={[styles.iconWrapper, { 
              backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#F3F4F6' 
            }]}>
              {item.iconFamily === "fontawesome" ? (
                <FontAwesome 
                  name={item.icon as any} 
                  size={24} 
                  color={isDark ? '#818CF8' : '#4B5563'} 
                />
              ) : (
                <Feather 
                  name={item.icon as any} 
                  size={24} 
                  color={isDark ? '#818CF8' : '#4B5563'} 
                />
              )}
            </View>
            <Text 
              style={[
                styles.itemTitle, 
                { color: isDark ? "rgba(255,255,255,0.7)" : "#4B5563" }
              ]}
              numberOfLines={2}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  itemContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
    paddingHorizontal: 2,
    lineHeight: 16,
  },
});
