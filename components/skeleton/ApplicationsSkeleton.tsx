import SkeletonPlaceholder from "expo-skeleton-placeholder";
import { View } from "react-native";
import { SkeletonWrapper } from "./SkeletonWrapper";

export default function ApplicationsSkeleton() {
  return (
    <SkeletonWrapper>
      <View style={{ paddingHorizontal: 16 }}>
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              backgroundColor: "white",
              padding: 16,
              borderRadius: 20,
              marginBottom: 16,
            }}
          >
            <SkeletonPlaceholder.Item
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <SkeletonPlaceholder.Item
                style={{ width: 100, height: 18, borderRadius: 8 }}
              />
              <SkeletonPlaceholder.Item
                style={{ width: 60, height: 18, borderRadius: 8 }}
              />
            </SkeletonPlaceholder.Item>

            {/* Middle */}
            <SkeletonPlaceholder.Item
              style={{
                marginTop: 14,
                width: "60%",
                height: 18,
                borderRadius: 8,
              }}
            />
            <SkeletonPlaceholder.Item
              style={{
                marginTop: 8,
                width: "40%",
                height: 16,
                borderRadius: 8,
              }}
            />

            {/* Footer */}
            <SkeletonPlaceholder.Item
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 20,
              }}
            >
              {[1, 2, 3].map((j) => (
                <SkeletonPlaceholder.Item
                  key={j}
                  style={{ width: 80, height: 18, borderRadius: 8 }}
                />
              ))}
            </SkeletonPlaceholder.Item>
          </View>
        ))}
      </View>
    </SkeletonWrapper>
  );
}
