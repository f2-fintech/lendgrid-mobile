import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { Card, Surface, Text, useTheme } from "react-native-paper";

import { ROUTES } from "@/assets/constants/routes";
import { lendGridStyles as styles } from "@/styles/components/landing/landingStyles";

const LogoImage = require("@/assets/images/logo.png");

type Props = {
  isSmallScreen: boolean;
};

const LendGridSections: React.FC<Props> = ({ isSmallScreen }) => {
  const router = useRouter();
  const theme = useTheme();

  const handleJoin = () => router.push(ROUTES.signup);
  const handleSignIn = () => router.push(ROUTES.signin);

  return (
    <View
      style={[
        styles.contentSection,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Surface
        style={[
          styles.section,
          styles.heroSection,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        {/* HERO HEADER */}
        <View>
          {/*  Logo (same as previous screens) */}
          <View style={styles.brandWrap}>
            <Image
              source={LogoImage}
              style={styles.brandLogo}
              resizeMode="contain"
            />
            <Text style={styles.brandText}>LendGrid</Text>
          </View>

          {/* ACTION BUTTONS */}
          <View style={styles.joinActionRow}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                isSmallScreen && styles.primaryButtonSmall,
                { backgroundColor: theme.colors.primary },
              ]}
              activeOpacity={0.9}
              onPress={handleJoin}
            >
              <View style={styles.buttonContent}>
                <Text
                  style={[
                    styles.buttonLabel,
                    { color: theme.colors.onPrimary },
                  ]}
                >
                  Join
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                isSmallScreen && styles.secondaryButtonSmall,
                {
                  borderColor: theme.colors.onSurface,
                  backgroundColor: "transparent",
                },
              ]}
              activeOpacity={0.9}
              onPress={handleSignIn}
            >
              <Text
                style={[
                  styles.secondaryButtonText,
                  { color: theme.colors.onSurface },
                ]}
              >
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* WHY CHOOSE SECTION */}
        <View style={{ height: 5 }} />

        <Text
          style={[
            styles.sectionTitleCompact,
            { color: theme.colors.onSurface },
          ]}
        >
          Why Choose F2 Fintech LendGrid?
        </Text>

        <Text
          style={[
            styles.sectionSubtitleCompact,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Empowering lenders and aggregators with smart, seamless tech.
        </Text>

        {/* BENEFIT HEADER */}
        <View style={styles.benefitHeader}>
          <MaterialCommunityIcons
            name="chart-line"
            size={26}
            color={theme.colors.tertiary ?? "#FFD700"}
          />
          <Text
            style={[
              styles.benefitTitle,
              { color: theme.colors.tertiary ?? "#FFD700" },
            ]}
          >
            Aggregator Benefits
          </Text>
        </View>

        {/* BENEFIT CARDS */}
        {[
          {
            icon: "chart-box",
            title: "Higher commission",
            desc: "Earn up to 4% per disbursal with clear, real-time tracking.",
          },
          {
            icon: "shield-check",
            title: "Premium lender access",
            desc: "Work with top banks & NBFCs without juggling multiple portals.",
          },
          {
            icon: "lightning-bolt",
            title: "Automated payouts",
            desc: "Get smart alerts when payouts are due or delayed.",
          },
        ].map((item, idx) => (
          <Card
            key={idx}
            style={[
              styles.benefitCard,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          >
            <Card.Content>
              <View style={styles.benefitItem}>
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={22}
                  color={theme.colors.tertiary ?? "#FFD700"}
                />
                <View style={styles.benefitText}>
                  <Text
                    style={[
                      styles.benefitItemTitle,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.benefitItemDesc,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    {item.desc}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}
      </Surface>
    </View>
  );
};

export default LendGridSections;
