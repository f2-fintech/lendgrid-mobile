import { Feather, FontAwesome5 } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { MD3Theme, useTheme } from "react-native-paper";

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

/** Animated segment bar for a single step */
const StepSegment = ({
  isActive,
  isCompleted,
  isSkipped,
  canPress,
  onPress,
  theme,
}: {
  isActive: boolean;
  isCompleted: boolean;
  isSkipped: boolean;
  canPress: boolean;
  onPress: () => void;
  theme: MD3Theme;
}) => {
  const fillAnim = useRef(new Animated.Value(isActive || isCompleted ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(fillAnim, {
      toValue: isActive || isCompleted ? 1 : 0,
      friction: 7,
      tension: 50,
      useNativeDriver: false,
    }).start();
  }, [isActive, isCompleted, fillAnim]);

  const segmentBase = theme.colors.surfaceVariant;
  let fillColor = theme.colors.primary;
  if (isSkipped) fillColor = "#F59E0B"; // amber for skipped

  const fillWidth = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <TouchableOpacity
      activeOpacity={canPress ? 0.7 : 1}
      disabled={!canPress}
      onPress={onPress}
      style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: segmentBase, overflow: "hidden" }}
    >
      <Animated.View
        style={{
          height: "100%",
          width: fillWidth,
          borderRadius: 3,
          backgroundColor: fillColor,
        }}
      />
    </TouchableOpacity>
  );
};

/** Mini dot indicator for each step */
const StepDot = ({
  index,
  isActive,
  isCompleted,
  isSkipped,
  canPress,
  onPress,
  step,
  theme,
}: {
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  isSkipped: boolean;
  canPress: boolean;
  onPress: () => void;
  step: StepConfig;
  theme: MD3Theme;
}) => {
  const scaleAnim = useRef(new Animated.Value(isActive ? 1 : 0.8)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isActive ? 1.15 : isCompleted ? 1 : 0.8,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [isActive, isCompleted, scaleAnim]);

  const bgColor = isActive
    ? theme.colors.primary
    : isCompleted
    ? isSkipped
      ? "#F59E0B"
      : theme.colors.primary
    : theme.colors.surfaceVariant;

  const renderIcon = () => {
    if (isCompleted && !isActive) {
      return <Feather name="check" size={11} color="#fff" />;
    }
    if (step.iconLib === "fa5") {
      return (
        <FontAwesome5
          name={step.icon as any}
          size={10}
          color={isActive ? "#fff" : isCompleted ? "#fff" : theme.colors.onSurfaceVariant}
        />
      );
    }
    return (
      <Feather
        name={step.icon as any}
        size={10}
        color={isActive ? "#fff" : isCompleted ? "#fff" : theme.colors.onSurfaceVariant}
      />
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={canPress ? 0.7 : 1}
      disabled={!canPress}
      onPress={onPress}
    >
      <Animated.View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: bgColor,
          alignItems: "center",
          justifyContent: "center",
          transform: [{ scale: scaleAnim }],
          borderWidth: isActive ? 0 : 1.5,
          borderColor: isActive
            ? "transparent"
            : isCompleted
            ? isSkipped
              ? "#F59E0B"
              : theme.colors.primary
            : theme.colors.outline,
          shadowColor: isActive ? theme.colors.primary : "transparent",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.5,
          shadowRadius: 4,
          elevation: isActive ? 4 : 0,
        }}
      >
        {renderIcon()}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function HorizontalStepper({
  steps,
  currentStep,
  maxStepAllowed,
  skippedSteps,
  onStepPress,
}: Props) {
  const theme = useTheme();
  const currentStepData = steps[currentStep];

  const renderMainIcon = ({
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
    return <Feather name={icon as any} size={size} color={color} />;
  };

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        paddingTop: 14,
        paddingBottom: 14,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.outlineVariant ?? theme.colors.outline,
        // subtle bottom shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      {/* ── Step dots row ─────────────────────────────────── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          marginBottom: 10,
        }}
      >
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isSkipped = !!skippedSteps?.[index];
          const canPress =
            typeof onStepPress === "function" &&
            (index <= currentStep ||
              (typeof maxStepAllowed === "number" && index <= maxStepAllowed));

          return (
            <React.Fragment key={step.id}>
              <StepDot
                index={index}
                isActive={isActive}
                isCompleted={isCompleted}
                isSkipped={isSkipped}
                canPress={canPress}
                onPress={() => onStepPress?.(index)}
                step={step}
                theme={theme}
              />
              {/* Connecting segment between dots */}
              {index < steps.length - 1 && (
                <StepSegment
                  isActive={false}
                  isCompleted={index < currentStep}
                  isSkipped={!!skippedSteps?.[index]}
                  canPress={canPress}
                  onPress={() => onStepPress?.(index)}
                  theme={theme}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* ── Current step info ─────────────────────────────── */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        {/* Icon badge */}
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: `${theme.colors.primary}18`,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1.5,
            borderColor: `${theme.colors.primary}30`,
          }}
        >
          {currentStepData &&
            renderMainIcon({
              iconLib: currentStepData.iconLib,
              icon: currentStepData.icon,
              size: 20,
              color: theme.colors.primary,
            })}
        </View>

        {/* Title + step counter chip */}
        <View style={{ flex: 1 }}>
          <View
            style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 }}
          >
            {/* Step counter chip */}
            <View
              style={{
                backgroundColor: `${theme.colors.primary}14`,
                borderRadius: 999,
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}
            >
              <Text
                style={{
                  color: theme.colors.primary,
                  fontSize: 10,
                  fontWeight: "800",
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                }}
              >
                Step {currentStep + 1} / {steps.length}
              </Text>
            </View>
            {/* Skipped badge */}
            {!!skippedSteps?.[currentStep] && (
              <View
                style={{
                  backgroundColor: "#F59E0B20",
                  borderRadius: 999,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ color: "#F59E0B", fontSize: 10, fontWeight: "700" }}>
                  Skipped
                </Text>
              </View>
            )}
          </View>
          <Text
            style={{
              color: theme.colors.onSurface,
              fontSize: 18,
              fontWeight: "800",
              letterSpacing: -0.2,
            }}
          >
            {currentStepData?.title ?? "Details"}
          </Text>
        </View>
      </View>
    </View>
  );
}
