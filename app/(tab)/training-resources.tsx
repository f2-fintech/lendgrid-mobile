import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  LayoutAnimation,
  UIManager,
  Dimensions,
  Linking,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { WebView } from "react-native-webview";

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get("window");

interface Lesson {
  title: string;
  videoUrl: string;
  description: string;
}

interface CourseGroup {
  title: string;
  icon: keyof typeof Feather.glyphMap;
  children: Lesson[];
}

const COURSE_GROUPS: CourseGroup[] = [
  {
    title: "Understanding Financial Sector",
    icon: "layers",
    children: [
      {
        title: "Secured Vs Unsecured Loan",
        videoUrl: "https://www.youtube.com/watch?v=BtIX9XFR5Pc",
        description: "Learn the core differences between secured and unsecured loans, collateral requirements, and risk profiles.",
      },
      {
        title: "Cibil Score Fundamentals",
        videoUrl: "https://www.youtube.com/watch?v=UPL1mIHfaak",
        description: "Understanding CIBIL score calculation, its impact on loan approvals, and tips to improve credit health.",
      },
      {
        title: "Difference Between A Term Loan and An Overdraft",
        videoUrl: "https://www.youtube.com/watch?v=VdCq2OyiAoQ",
        description: "A comprehensive guide explaining the structural differences, repayment schedules, and interest calculations of term loans vs overdrafts.",
      },
    ],
  },
  {
    title: "Product Portfolio",
    icon: "briefcase",
    children: [
      {
        title: "Personal Loan",
        videoUrl: "https://www.youtube.com/watch?v=ea2W-k643pc&t=4s",
        description: "Overview of personal loan products, target customers, documentation, and key selling propositions.",
      },
      {
        title: "Personal Loan - Part 2",
        videoUrl: "https://www.youtube.com/watch?v=NG3I38pUvQs",
        description: "Advanced concepts in personal loan underwriting, customer onboarding, and interest rate structures.",
      },
      {
        title: "Business Loan",
        videoUrl: "https://www.youtube.com/watch?v=vvXZPatAQ3I",
        description: "Introduction to business financing, requirements, cash flow analysis, and working capital evaluation.",
      },
      {
        title: "Loan Against Property ( LAP )",
        videoUrl: "https://www.youtube.com/watch?v=F0lxCXHVHzM",
        description: "Understand Loan Against Property (LAP), collateral valuation guidelines, and processing workflows.",
      },
      {
        title: "Bajaj Training - Business Loan",
        videoUrl: "https://www.youtube.com/watch?v=SbyfpPv8zYc",
        description: "Specific training modules for Bajaj business loan offerings, underwriting rules, and payout policies.",
      },
      {
        title: "Professional Loan",
        videoUrl: "https://www.youtube.com/watch?v=P2czJpTjlMc",
        description: "Specialized loan solutions for doctors, chartered accountants, and self-employed professionals.",
      },
      {
        title: "Cash Credit Loan Account vs Bank Overdraft Facility",
        videoUrl: "https://www.youtube.com/watch?v=BjxH_1cnA0o",
        description: "Compare Cash Credit (CC) accounts and Bank Overdraft (OD) facilities, including drawing limits and limits utilization.",
      },
      {
        title: "F2 Fintech Management Trainee Assignment",
        videoUrl: "https://f2fintech.systeme.io/school/course/ok/lecture/3138595",
        description: "Training details and tasks for management trainees joining the F2 Fintech LendGrid platform.",
      },
    ],
  },
  {
    title: "Financial Education",
    icon: "award",
    children: [
      {
        title: "Home Loan",
        videoUrl: "https://www.youtube.com/watch?v=8CUn0o9PBcU",
        description: "Step-by-step training on home loan products, search procedures, property checks, and disbursement stages.",
      },
    ],
  },
  {
    title: "Sales Approach",
    icon: "trending-up",
    children: [
      {
        title: "Psychology Behind Selling",
        videoUrl: "https://www.youtube.com/watch?v=ZlM-5iFerIQ",
        description: "Master the sales funnel by understanding client psychology, handling rejections, and closing deals effectively.",
      },
    ],
  },
  {
    title: "Sales Call Recording.",
    icon: "mic",
    children: [
      {
        title: "Sales Call Analysis (Coming Soon)",
        videoUrl: "",
        description: "Listen to real-world call recordings, pitch analysis, objection handling techniques, and constructive feedback sessions.",
      },
    ],
  },
];

function isYouTubeUrl(url: string) {
  if (!url) return false;
  return url.includes("youtube.com") || url.includes("youtu.be");
}

function getYouTubeVideoId(url: string) {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : "";
}

function getPlayerHtml(videoUrl: string) {
  const videoId = getYouTubeVideoId(videoUrl);
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        body, html {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          background-color: #000;
          overflow: hidden;
        }
        .container {
          position: relative;
          width: 100%;
          height: 100%;
        }
        iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <iframe 
          src="https://www.youtube.com/embed/${videoId}?autoplay=0&modestbranding=1&rel=0&showinfo=0&fs=1&playsinline=1&enablejsapi=1&origin=https://f2fintech.com" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowfullscreen>
        </iframe>
      </div>
    </body>
    </html>
  `;
}

export default function TrainingResourcesScreen() {
  const theme = useTheme();
  const isDark = theme.dark;

  // Set the first lesson of the first category as the default active lesson
  const [activeLesson, setActiveLesson] = useState<Lesson>(
    COURSE_GROUPS[0].children[0]
  );
  const [activeCategoryTitle, setActiveCategoryTitle] = useState<string>(
    COURSE_GROUPS[0].title
  );

  // Track expanded categories (expand the first one by default)
  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({
    0: true,
  });

  const toggleGroup = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedGroups((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleSelectLesson = (lesson: Lesson, categoryTitle: string) => {
    setActiveLesson(lesson);
    setActiveCategoryTitle(categoryTitle);
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      {/* 1. TOP VIDEO PLAYER VIEW */}
      <View
        style={[
          styles.playerCard,
          {
            backgroundColor: isDark ? "#12182F" : "#FFFFFF",
            borderBottomColor: theme.colors.outlineVariant,
          },
        ]}
      >
        <View style={styles.videoContainer}>
          {activeLesson.videoUrl ? (
            <WebView
              source={
                isYouTubeUrl(activeLesson.videoUrl)
                  ? { 
                      html: getPlayerHtml(activeLesson.videoUrl),
                      baseUrl: "https://f2fintech.com"
                    }
                  : { uri: activeLesson.videoUrl }
              }
              style={styles.webView}
              allowsFullscreenVideo
              javaScriptEnabled
              domStorageEnabled
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={isYouTubeUrl(activeLesson.videoUrl)}
              mixedContentMode="always"
              thirdPartyCookiesEnabled={true}
              userAgent="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36"
            />
          ) : (
            <View style={styles.thumbnailButton}>
              <LinearGradient
                colors={
                  isDark
                    ? ["#1e293b", "#0f172a"]
                    : ["#3b82f6", "#1d4ed8"]
                }
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <View style={styles.comingSoonBox}>
                <Feather name="video-off" size={32} color="#ffffff" style={{ opacity: 0.8 }} />
                <Text style={styles.comingSoonText}>Video Coming Soon</Text>
              </View>

              {/* Category Badge overlay */}
              <View style={styles.categoryBadgeContainer}>
                <Text style={styles.categoryBadgeText}>
                  {activeCategoryTitle.toUpperCase()}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Video Information Area */}
        <View style={styles.infoArea}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={[styles.videoTitle, { color: theme.colors.onSurface, flex: 1 }]} numberOfLines={2}>
              {activeLesson.title}
            </Text>
            {activeLesson.videoUrl ? (
              <TouchableOpacity
                onPress={() => Linking.openURL(activeLesson.videoUrl)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: isYouTubeUrl(activeLesson.videoUrl)
                    ? "rgba(239, 68, 68, 0.1)"
                    : "rgba(50, 56, 243, 0.1)",
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 6,
                  gap: 4,
                  marginLeft: 10,
                }}
              >
                <Feather 
                  name={isYouTubeUrl(activeLesson.videoUrl) ? "youtube" : "external-link"} 
                  size={14} 
                  color={isYouTubeUrl(activeLesson.videoUrl) ? "#EF4444" : theme.colors.primary} 
                />
                <Text 
                  style={{ 
                    fontSize: 11, 
                    fontWeight: "700", 
                    color: isYouTubeUrl(activeLesson.videoUrl) ? "#EF4444" : theme.colors.primary 
                  }}
                >
                  {isYouTubeUrl(activeLesson.videoUrl) ? "Open App" : "Open Link"}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <Text style={[styles.videoDesc, { color: theme.colors.onSurfaceVariant }]} numberOfLines={2}>
            {activeLesson.description}
          </Text>
        </View>
      </View>

      {/* 2. BOTTOM ACCORDION LIST */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Course Chapters
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Expand chapters below to play the video training
          </Text>
        </View>

        <View style={styles.accordionContainer}>
          {COURSE_GROUPS.map((group, groupIndex) => {
            const isExpanded = !!expandedGroups[groupIndex];
            return (
              <View
                key={group.title}
                style={[
                  styles.groupCard,
                  {
                    borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                  },
                ]}
              >
                {/* Accordion Parent Button */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => toggleGroup(groupIndex)}
                  style={styles.parentButton}
                >
                  <View style={styles.parentContent}>
                    <Feather
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={18}
                      color="#0F2D69"
                      style={styles.chevronIcon}
                    />
                    <Text
                      style={[
                        styles.parentTitle,
                        { color: "#0F2D69" },
                      ]}
                    >
                      {group.title}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Accordion Child Buttons */}
                {isExpanded && (
                  <View style={styles.childrenList}>
                    {group.children.map((child) => {
                      const isSelected = activeLesson.title === child.title;
                      return (
                        <TouchableOpacity
                          key={child.title}
                          activeOpacity={0.7}
                          onPress={() => handleSelectLesson(child, group.title)}
                          style={[
                            styles.childButton,
                            isSelected && {
                              backgroundColor: isDark
                                ? "rgba(50,56,243,0.1)"
                                : "rgba(50,56,243,0.05)",
                            },
                          ]}
                        >
                          <Feather
                            name="circle"
                            size={14}
                            color={isSelected ? "#00A3FF" : "#0F2D69"}
                            style={styles.bulletIcon}
                          />
                          <Text
                            style={[
                              styles.childTitle,
                              {
                                color: isSelected
                                  ? "#00A3FF"
                                  : "#0F2D69",
                                fontWeight: isSelected ? "700" : "500",
                              },
                            ]}
                          >
                            {child.title}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  // Video Player Layout
  playerCard: {
    width: "100%",
    borderBottomWidth: 1,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  videoContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000000",
    overflow: "hidden",
  },
  webView: {
    flex: 1,
    backgroundColor: "#000000",
  },
  thumbnailButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  playIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  comingSoonBox: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  comingSoonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  categoryBadgeContainer: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  infoArea: {
    padding: 16,
    gap: 4,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 22,
  },
  videoDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  // Scroll List layout
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  sectionSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  accordionContainer: {
    gap: 12,
  },
  groupCard: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  parentButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  parentContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chevronIcon: {
    marginRight: 2,
  },
  parentTitle: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  childrenList: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.03)",
  },
  childButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingLeft: 30,
    paddingRight: 16,
    gap: 10,
  },
  bulletIcon: {
    marginRight: 2,
  },
  childTitle: {
    fontSize: 14,
    lineHeight: 19,
    flex: 1,
  },
});
