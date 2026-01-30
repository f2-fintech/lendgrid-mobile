import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";

type IconLib = "feather" | "fa5";

export type StepConfig = {
  id: string;
  title: string;
  iconLib?: IconLib;
  icon: string;
};

type Props = {
  steps: StepConfig[];
  currentStep: number;
  maxStepAllowed?: number;
  skippedSteps?: Record<number, boolean>;
  onStepPress?: (index: number) => void;
};

export default function HorizontalStepper({
  steps,
  currentStep,
  maxStepAllowed,
  skippedSteps,
  onStepPress,
}: Props) {
  const theme = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: currentStep * 90,
        animated: true,
      });
    }
  }, [currentStep]);

  const renderIcon = ({
    iconLib,
    icon,
    size,
    color,
  }: {
    iconLib?: IconLib;
    icon: string;
    size: number;
    color: string;
  }) => {
    if (iconLib === "fa5") {
      return <FontAwesome5 name={icon as any} size={size} color={color} />;
    }
    // default feather
    return <Feather name={icon as any} size={size} color={color} />;
  };

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.outlineVariant,
      }}
    >
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          alignItems: "center",
        }}
      >
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isLast = index === steps.length - 1;
          const isSkipped = !!skippedSteps?.[index];

          const canPress =
            typeof onStepPress === "function" &&
            (index <= currentStep ||
              (typeof maxStepAllowed === "number" && index <= maxStepAllowed));

          return (
            <View
              key={step.id}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={!canPress}
                onPress={() => onStepPress?.(index)}
                style={{ alignItems: "center" }}
              >
                <View
                  style={{
                    width: isActive ? 48 : 40,
                    height: isActive ? 48 : 40,
                    borderRadius: 24,
                    backgroundColor: isActive
                      ? theme.colors.primary
                      : isCompleted
                        ? isSkipped
                          ? theme.colors.tertiaryContainer
                          : theme.colors.primaryContainer
                        : theme.colors.surfaceVariant,
                    justifyContent: "center",
                    alignItems: "center",
                    shadowColor: isActive ? theme.colors.primary : "#000",
                    shadowOffset: { width: 0, height: isActive ? 4 : 2 },
                    shadowOpacity: isActive ? 0.3 : 0.1,
                    shadowRadius: isActive ? 8 : 4,
                    elevation: isActive ? 8 : 2,
                    opacity: canPress ? 1 : 0.9,
                  }}
                >
                  {isCompleted ? (
                    isSkipped ? (
                      <Feather
                        name="skip-forward"
                        size={20}
                        color={theme.colors.onPrimaryContainer}
                      />
                    ) : (
                      <Feather
                        name="check"
                        size={20}
                        color={theme.colors.onPrimaryContainer}
                      />
                    )
                  ) : (
                    renderIcon({
                      iconLib: step.iconLib,
                      icon: step.icon,
                      size: isActive ? 20 : 17,
                      color: isActive
                        ? theme.colors.onPrimary
                        : theme.colors.onSurfaceVariant,
                    })
                  )}
                </View>

                <Text
                  numberOfLines={2}
                  style={{
                    marginTop: 6,
                    fontSize: isActive ? 11 : 10,
                    fontWeight: isActive ? "700" : "600",
                    color: isActive
                      ? theme.colors.primary
                      : theme.colors.onSurfaceVariant,
                    textAlign: "center",
                    width: 70,
                    opacity: canPress ? 1 : 0.75,
                  }}
                >
                  {step.title}
                </Text>
              </TouchableOpacity>

              {!isLast && (
                <View
                  style={{
                    width: 32,
                    height: 2,
                    backgroundColor: isCompleted
                      ? theme.colors.primary
                      : theme.colors.outlineVariant,
                    marginHorizontal: 4,
                    marginBottom: 30,
                  }}
                />
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
