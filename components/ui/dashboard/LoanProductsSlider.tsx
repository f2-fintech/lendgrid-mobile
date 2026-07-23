import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LOAN_PRODUCTS, LoanProduct } from '@/app/(tab)/loan-products';

const { width } = Dimensions.get('window');

// We duplicate the array to create a seamless infinite scrolling effect
const INFINITE_DATA = [...LOAN_PRODUCTS, ...LOAN_PRODUCTS, ...LOAN_PRODUCTS];

export default function LoanProductsSlider() {
  const theme = useTheme();
  const isDark = !!theme?.dark;
  const router = useRouter();
  
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  
  // Auto-scroll animation logic
  useEffect(() => {
    if (!isAutoScrolling) return;

    let offset = 0;
    const interval = setInterval(() => {
      offset += 1;
      flatListRef.current?.scrollToOffset({ offset, animated: false });
    }, 30); // 30ms interval for smooth scrolling

    return () => clearInterval(interval);
  }, [isAutoScrolling]);

  const handlePress = () => {
    // Navigate to loan products page when a user clicks a slide
    router.push('/(tab)/loan-products');
  };

  const renderItem = ({ item, index }: { item: LoanProduct; index: number }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      onPressIn={() => setIsAutoScrolling(false)}
      onPressOut={() => setIsAutoScrolling(true)}
      style={[
        styles.slideItem,
        { 
          backgroundColor: isDark ? 'rgba(30, 41, 59, 0.7)' : '#FFFFFF',
          borderColor: isDark ? 'rgba(51, 65, 85, 0.8)' : '#E5E7EB',
        }
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#EEF2FF' }]}>
        <Feather name={item.icon as any} size={16} color={isDark ? '#818CF8' : '#4F46E5'} />
      </View>
      
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: isDark ? '#F8FAFC' : '#1F2937' }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#94A3B8' : '#6B7280' }]} numberOfLines={1}>
          {item.interestRate}
        </Text>
      </View>
      
      <View style={[styles.badge, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#D1FAE5' }]}>
        <Text style={[styles.badgeText, { color: isDark ? '#34D399' : '#059669' }]}>
          {item.maxAmount}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: isDark ? 'rgba(255,255,255,0.92)' : theme.colors.onSurface }]}>
          Featured Loan Products
        </Text>
        <TouchableOpacity onPress={handlePress}>
          <Text style={[styles.viewAllText, { color: isDark ? '#818CF8' : '#4F46E5' }]}>View All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={INFINITE_DATA}
        keyExtractor={(_, index) => `loan-slide-${index}`}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={true}
        onScrollBeginDrag={() => setIsAutoScrolling(false)}
        onScrollEndDrag={() => setIsAutoScrolling(true)}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  slideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    width: 260,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  }
});
