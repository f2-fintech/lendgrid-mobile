// components/ui/dashboard/SkeletonLoader.tsx
import { Dimensions, ScrollView, View } from "react-native";
import { useTheme } from "react-native-paper";

const { width: screenWidth } = Dimensions.get("window");

export default function SkeletonLoader() {
  const theme = useTheme();

  const SkeletonBox = ({ width, height, style }: any) => (
    <View
      style={[
        {
          width,
          height,
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: 8,
          opacity: 0.6,
        },
        style,
      ]}
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
      >
        {/* Header Skeleton */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <View>
            <SkeletonBox width={120} height={32} style={{ marginBottom: 4 }} />
            <SkeletonBox width={200} height={16} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <SkeletonBox width={100} height={40} style={{ borderRadius: 12 }} />
            <SkeletonBox width={40} height={40} style={{ borderRadius: 12 }} />
          </View>
        </View>

        {/* Metrics Grid Skeleton - FIXED ICON POSITION */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 0,
            paddingVertical: 8,
            paddingRight: 16,
          }}
          style={{ marginBottom: 24 }}
        >
          {[1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={[
                {
                  width: 160,
                  minWidth: 160,
                  backgroundColor: theme.colors.surface,
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: theme.colors.outline,
                  marginRight: 12,
                  overflow: "hidden",
                },
                i === 4 && {
                  width: 120,
                  minWidth: 120,
                  marginRight: 0,
                },
              ]}
            >
              {/* Title at top left */}
              <SkeletonBox
                width={80}
                height={14}
                style={{ marginBottom: 12 }}
              />

              {/* Value in middle left */}
              <SkeletonBox
                width={100}
                height={24}
                style={{ marginBottom: 8 }}
              />

              {/* Trend indicator at bottom left */}
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <SkeletonBox
                  width={12}
                  height={12}
                  style={{ marginRight: 4, borderRadius: 6 }}
                />
                <SkeletonBox width={40} height={14} />
              </View>

              {/* FIXED: Icon circle position - moved left from edge */}
              <View
                style={{
                  position: "absolute",
                  top: 12, // Slightly lower from top
                  right: 12, // Changed from 16 to 12 (moved left)
                  width: 36, // Slightly smaller
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: `${theme.colors.primary}20`,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <SkeletonBox
                  width={18}
                  height={18}
                  style={{ borderRadius: 9 }}
                />
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Chart Skeleton */}
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: 16,
            padding: 16,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: theme.colors.outline,
            overflow: "hidden",
          }}
        >
          <View style={{ marginBottom: 16 }}>
            <SkeletonBox width={180} height={20} style={{ marginBottom: 4 }} />
            <SkeletonBox width={220} height={16} />
          </View>

          <View style={{ height: 220, position: "relative" }}>
            <View style={{ position: "absolute", left: 0, top: 0 }}>
              <SkeletonBox width={20} height={20} />
            </View>

            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginLeft: 24,
                paddingBottom: 24,
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <View
                  key={i}
                  style={{ flex: 1, alignItems: "center", marginHorizontal: 4 }}
                >
                  <SkeletonBox
                    width={24}
                    height={Math.max(40, 160 * Math.random())}
                    style={{ borderRadius: 4 }}
                  />
                  <SkeletonBox
                    width={30}
                    height={12}
                    style={{ marginTop: 8 }}
                  />
                </View>
              ))}
            </View>
          </View>

          <SkeletonBox
            width={180}
            height={14}
            style={{ alignSelf: "center", marginTop: 16 }}
          />
        </View>

        {/* Applications List Section */}
        <View style={{ marginBottom: 24 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <SkeletonBox width={160} height={24} />
            <SkeletonBox width={60} height={20} />
          </View>

          <View
            style={{
              flexDirection: "row",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <View
              style={{
                flex: 7,
                backgroundColor: theme.colors.surface,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: theme.colors.outline,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <SkeletonBox width={20} height={20} style={{ marginRight: 8 }} />
              <SkeletonBox width={120} height={20} />
            </View>

            <View
              style={{
                flex: 3,
                backgroundColor: theme.colors.primary,
                borderRadius: 12,
                padding: 12,
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <SkeletonBox
                width={16}
                height={16}
                style={{ marginRight: 4, borderRadius: 8 }}
              />
              <SkeletonBox width={40} height={16} />
            </View>
          </View>

          {[1, 2, 3].map((i) => (
            <View
              key={i}
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: theme.colors.outline,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <SkeletonBox width={70} height={20} />
                <SkeletonBox
                  width={60}
                  height={24}
                  style={{ borderRadius: 12 }}
                />
              </View>

              <SkeletonBox
                width={120}
                height={20}
                style={{ marginBottom: 4 }}
              />
              <SkeletonBox
                width={80}
                height={16}
                style={{ marginBottom: 16 }}
              />

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flex: 1 }}>
                  <SkeletonBox
                    width={100}
                    height={14}
                    style={{ marginBottom: 4 }}
                  />
                  <SkeletonBox width={80} height={18} />
                </View>
                <View style={{ flex: 1, paddingHorizontal: 8 }}>
                  <SkeletonBox
                    width={80}
                    height={14}
                    style={{ marginBottom: 4 }}
                  />
                  <SkeletonBox width={100} height={18} />
                </View>
                <View style={{ flex: 1, alignItems: "flex-end" }}>
                  <SkeletonBox
                    width={70}
                    height={14}
                    style={{ marginBottom: 4 }}
                  />
                  <SkeletonBox width={60} height={18} />
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
