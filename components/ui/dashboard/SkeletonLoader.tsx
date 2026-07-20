// components/ui/dashboard/SkeletonLoader.tsx
import { ScrollView, View } from "react-native";
import { useTheme } from "react-native-paper";

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
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
      >
        {/* Hero Card Skeleton */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24, marginTop: 8 }}>
          <View
            style={{
              backgroundColor: theme.colors.surfaceVariant,
              borderRadius: 24,
              padding: 24,
              opacity: 0.4,
            }}
          >
            <SkeletonBox width={160} height={14} style={{ marginBottom: 12 }} />
            <SkeletonBox width={200} height={40} style={{ marginBottom: 24 }} />
            
            <View style={{ height: 1, backgroundColor: "rgba(0,0,0,0.1)", marginBottom: 20 }} />

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                <SkeletonBox width={36} height={36} style={{ borderRadius: 12 }} />
                <View>
                  <SkeletonBox width={40} height={12} style={{ marginBottom: 4 }} />
                  <SkeletonBox width={80} height={16} />
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                <SkeletonBox width={36} height={36} style={{ borderRadius: 12 }} />
                <View>
                  <SkeletonBox width={50} height={12} style={{ marginBottom: 4 }} />
                  <SkeletonBox width={70} height={16} />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Stats Skeleton */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 24,
            gap: 12,
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 999,
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.outline,
                gap: 8,
              }}
            >
              <SkeletonBox width={28} height={28} style={{ borderRadius: 14 }} />
              <SkeletonBox width={24} height={16} />
              <SkeletonBox width={60} height={14} />
            </View>
          ))}
        </ScrollView>

        {/* Chart Skeleton */}
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: 24,
            padding: 24,
            marginBottom: 24,
            marginHorizontal: 20,
            borderWidth: 1,
            borderColor: theme.colors.outline,
          }}
        >
          <View style={{ marginBottom: 16 }}>
            <SkeletonBox width={180} height={20} style={{ marginBottom: 4 }} />
            <SkeletonBox width={220} height={16} />
          </View>

          <View style={{ height: 220, position: "relative" }}>
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
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Applications List Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
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

          {[1, 2, 3].map((i) => (
            <View
              key={i}
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: 20,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: theme.colors.outline,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <SkeletonBox width={48} height={48} style={{ borderRadius: 16, marginRight: 12 }} />
              
              <View style={{ flex: 1, justifyContent: "center", gap: 4 }}>
                <SkeletonBox width={100} height={16} />
                <SkeletonBox width={80} height={14} />
                <SkeletonBox width={60} height={12} />
              </View>

              <View style={{ alignItems: "flex-end", gap: 6 }}>
                <SkeletonBox width={70} height={16} />
                <SkeletonBox width={50} height={18} style={{ borderRadius: 999 }} />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
