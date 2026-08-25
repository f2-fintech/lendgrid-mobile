import React, { useState, useMemo } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Dimensions,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import {
  Text,
  useTheme,
  TextInput as PaperInput,
  HelperText,
} from "react-native-paper";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { useProfile, useRegisterUser } from "@/hooks/useAuth";
import {
  useAggregatorDetails,
  useAddTeamMember,
  useRemoveTeamMember,
} from "@/hooks/useAggregator";

const { width } = Dimensions.get("window");

function getInitials(name: string) {
  return (name || "U")
    .split(" ")
    .map((s) => s.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

function capitalizeName(name: string) {
  if (!name) return "—";
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function TeamManagementScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const isDark = theme.dark;

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  
  // Dialog visibility states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<any | null>(null);
  const [zoomedMember, setZoomedMember] = useState<any | null>(null);

  // Add Member Form States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ---------------- AUTHENTICATED USER DATA ----------------
  const { data: userProfile, isLoading: loadingUserProfile } = useProfile();
  const profileId = userProfile?.profileId || "";

  // ---------------- AGGREGATOR DETAILS DATA ----------------
  const {
    data: profileData,
    isLoading: loadingAggregator,
    refetch: refetchProfile,
  } = useAggregatorDetails(profileId);

  // ---------------- MUTATIONS ----------------
  const registerUserMutation = useRegisterUser();
  const addTeamMemberMutation = useAddTeamMember();
  const removeTeamMemberMutation = useRemoveTeamMember();

  const isSubmitting = registerUserMutation.isPending || addTeamMemberMutation.isPending;

  // Colors & Design Tokens
  const teamPalette = useMemo(() => {
    return {
      screenGradient: isDark
        ? (["#060818", "#0B0F2A", "#080D20"] as const)
        : (["#F8FAFF", "#EDF4FF", "#FFFFFF"] as const),
      cardGradient: isDark
        ? (["rgba(255,255,255,0.06)", "rgba(255,255,255,0.02)"] as const)
        : (["rgba(255,255,255,0.96)", "rgba(239,246,255,0.84)"] as const),
      cardBorder: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.06)",
      text: colors.onSurface,
      mutedText: colors.onSurfaceVariant,
      faintText: isDark ? "rgba(255,255,255,0.4)" : "rgba(51,65,85,0.5)",
      divider: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
      primaryGradient: ["#6366F1", "#4F46E5"] as const,
      primaryGlow: isDark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.08)",
      activeGlow: isDark ? "rgba(34, 197, 94, 0.18)" : "rgba(34, 197, 94, 0.08)",
      errorGlow: isDark ? "rgba(239, 68, 68, 0.18)" : "rgba(239, 68, 68, 0.08)",
    };
  }, [isDark, colors]);

  // Deriving lists and counts
  const teamMembers = useMemo(() => {
    return profileData?.teamMemberUsers || [];
  }, [profileData]);

  const activeMembers = useMemo(() => {
    return teamMembers.filter((m) => m.status === "ACTIVE");
  }, [teamMembers]);

  const inactiveMembers = useMemo(() => {
    return teamMembers.filter((m) => m.status === "INACTIVE");
  }, [teamMembers]);

  const filteredMembers = useMemo(() => {
    const list = filterStatus === "ACTIVE" ? activeMembers : inactiveMembers;
    if (!searchTerm.trim()) return list;
    const query = searchTerm.toLowerCase();
    return list.filter(
      (m) =>
        m.username?.toLowerCase().includes(query) ||
        m.email?.toLowerCase().includes(query) ||
        m.contact?.toLowerCase().includes(query)
    );
  }, [filterStatus, activeMembers, inactiveMembers, searchTerm]);

  // Confirm delete handler
  const handleConfirmRemove = async () => {
    if (!memberToRemove || !profileData?._id) return;
    try {
      await removeTeamMemberMutation.mutateAsync({
        id: profileData._id,
        userId: memberToRemove._id,
      });
      setMemberToRemove(null);
      refetchProfile();
      Alert.alert("Success", "Team member removed successfully.");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to remove member.");
    }
  };

  // Restore handler
  const handleRestore = async (member: any) => {
    if (!profileData?._id) return;
    try {
      await addTeamMemberMutation.mutateAsync({
        id: profileData._id,
        userId: member._id,
      });
      refetchProfile();
      Alert.alert("Success", "Team member restored successfully.");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to restore member.");
    }
  };

  // Add Member Dialog validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    else if (!/^[a-zA-Z\s]+$/.test(fullName)) newErrors.fullName = "Name can only contain letters";

    if (!email.trim()) newErrors.email = "Email address is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email format";

    if (!contact.trim()) newErrors.contact = "Contact number is required";
    else if (!/^[0-9]{9,15}$/.test(contact)) newErrors.contact = "Contact must be between 9 and 15 digits";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 8) newErrors.password = "Password must be at least 8 characters";

    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Add Team Member
  const handleAddMember = async () => {
    if (!validateForm()) return;
    try {
      // 1. Create/register user
      const registerRes = await registerUserMutation.mutateAsync({
        username: fullName,
        email: email.toLowerCase().trim(),
        contact: contact,
        password: password,
        role: "AGGREGATOR_MEMBER",
        parentAggregatorId: profileData?.user?._id,
      });

      if (!registerRes?.success || !registerRes?.user?._id) {
        Alert.alert("Signup failed", registerRes?.message || "Could not register user.");
        return;
      }

      // 2. Add as team member on the aggregator profile
      await addTeamMemberMutation.mutateAsync({
        id: profileData!._id,
        userId: registerRes.user._id,
      });

      Alert.alert("Success", `${fullName} has been added to the team.`);
      setIsAddDialogOpen(false);
      resetForm();
      refetchProfile();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to add team member.");
    }
  };

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setContact("");
    setPassword("");
    setConfirmPassword("");
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  if (loadingUserProfile || loadingAggregator) {
    return (
      <View style={[styles.loadingCenter, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.onSurfaceVariant, fontWeight: "600" }}>Loading team details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Background Gradient */}
      <LinearGradient
        colors={teamPalette.screenGradient}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER BLOCK */}
        <View style={styles.headerBlock}>
          <Text style={[styles.titleText, { color: teamPalette.text }]}>My Team</Text>
          <Text style={[styles.subtitleText, { color: teamPalette.mutedText }]}>
            Manage members for{" "}
            <Text style={styles.companyHighlight}>
              {profileData?.companyName || "your agency"}
            </Text>
          </Text>
        </View>

        {/* METRICS DASHBOARD */}
        <View style={styles.metricsRow}>
          {/* Total */}
          <View style={[styles.metricCard, { borderColor: teamPalette.cardBorder }]}>
            <LinearGradient colors={teamPalette.cardGradient} style={StyleSheet.absoluteFillObject} />
            <View style={styles.metricContent}>
              <View style={[styles.metricIconBox, { backgroundColor: teamPalette.primaryGlow }]}>
                <Ionicons name="people" size={18} color={isDark ? "#818CF8" : "#6366F1"} />
              </View>
              <View style={styles.metricTexts}>
                <Text style={[styles.metricLabel, { color: teamPalette.faintText }]}>Total</Text>
                <Text style={[styles.metricValue, { color: teamPalette.text }]}>{teamMembers.length}</Text>
              </View>
            </View>
          </View>

          {/* Active */}
          <View style={[styles.metricCard, { borderColor: teamPalette.cardBorder }]}>
            <LinearGradient colors={teamPalette.cardGradient} style={StyleSheet.absoluteFillObject} />
            <View style={styles.metricContent}>
              <View style={[styles.metricIconBox, { backgroundColor: teamPalette.activeGlow }]}>
                <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
              </View>
              <View style={styles.metricTexts}>
                <Text style={[styles.metricLabel, { color: teamPalette.faintText }]}>Active</Text>
                <Text style={[styles.metricValue, { color: "#22C55E" }]}>{activeMembers.length}</Text>
              </View>
            </View>
          </View>

          {/* Deleted */}
          <View style={[styles.metricCard, { borderColor: teamPalette.cardBorder }]}>
            <LinearGradient colors={teamPalette.cardGradient} style={StyleSheet.absoluteFillObject} />
            <View style={styles.metricContent}>
              <View style={[styles.metricIconBox, { backgroundColor: teamPalette.errorGlow }]}>
                <Ionicons name="close-circle" size={18} color="#EF4444" />
              </View>
              <View style={styles.metricTexts}>
                <Text style={[styles.metricLabel, { color: teamPalette.faintText }]}>Deleted</Text>
                <Text style={[styles.metricValue, { color: "#EF4444" }]}>{inactiveMembers.length}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* SEARCH BAR */}
        <View style={[styles.searchContainer, { borderColor: teamPalette.cardBorder }]}>
          <LinearGradient colors={teamPalette.cardGradient} style={StyleSheet.absoluteFillObject} />
          <Feather name="search" size={16} color={teamPalette.faintText} style={{ marginLeft: 14 }} />
          <TextInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search team..."
            placeholderTextColor={teamPalette.faintText}
            style={[styles.searchField, { color: teamPalette.text }]}
          />
          {searchTerm ? (
            <TouchableOpacity onPress={() => setSearchTerm("")} style={{ padding: 8, marginRight: 6 }}>
              <Feather name="x" size={16} color={teamPalette.faintText} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* CUSTOM TABS SEGMENT */}
        <View style={[styles.toggleRow, { borderColor: teamPalette.cardBorder }]}>
          <LinearGradient colors={teamPalette.cardGradient} style={StyleSheet.absoluteFillObject} />
          
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setFilterStatus("ACTIVE")}
            style={styles.toggleButton}
          >
            {filterStatus === "ACTIVE" && (
              <LinearGradient
                colors={teamPalette.primaryGradient}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            )}
            <Text
              style={[
                styles.toggleText,
                { color: filterStatus === "ACTIVE" ? "white" : teamPalette.text },
              ]}
            >
              Active ({activeMembers.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setFilterStatus("INACTIVE")}
            style={styles.toggleButton}
          >
            {filterStatus === "INACTIVE" && (
              <LinearGradient
                colors={teamPalette.primaryGradient}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            )}
            <Text
              style={[
                styles.toggleText,
                { color: filterStatus === "INACTIVE" ? "white" : teamPalette.text },
              ]}
            >
              Deleted ({inactiveMembers.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* TEAM MEMBER CARDS LISTING */}
        {filteredMembers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconBox, { borderColor: teamPalette.cardBorder }]}>
              <Feather name="users" size={32} color={teamPalette.faintText} />
            </View>
            <Text style={[styles.emptyTitle, { color: teamPalette.text }]}>No members found</Text>
            <Text style={[styles.emptySubtitle, { color: teamPalette.mutedText }]}>
              {searchTerm 
                ? "Try searching for a different name or email" 
                : filterStatus === "ACTIVE" 
                  ? "Get started by tapping the + button to add a member" 
                  : "No deleted team members found"}
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredMembers.map((item) => (
              <View key={item._id} style={[styles.memberCard, { borderColor: teamPalette.cardBorder }]}>
                <LinearGradient colors={teamPalette.cardGradient} style={StyleSheet.absoluteFillObject} />
                
                <View style={styles.memberCardContent}>
                  <View style={styles.memberMain}>
                    {/* Initials Avatar or Profile Image */}
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => setZoomedMember(item)}
                    >
                      {item.photoUrl ? (
                        <Image
                          source={{ uri: item.photoUrl }}
                          style={styles.avatar}
                        />
                      ) : (
                        <LinearGradient
                          colors={["#4F46E5", "#06B6D4"]}
                          style={styles.avatar}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <Text style={styles.avatarText}>
                            {getInitials(item.username)}
                          </Text>
                        </LinearGradient>
                      )}
                    </TouchableOpacity>
                    
                    {/* Member Information */}
                    <View style={styles.memberInfo}>
                      <Text style={[styles.memberName, { color: teamPalette.text }]} numberOfLines={1}>
                        {capitalizeName(item.username)}
                      </Text>
                      
                      <View style={styles.infoLine}>
                        <Feather name="mail" size={11} color={teamPalette.faintText} style={styles.infoIcon} />
                        <Text style={[styles.infoText, { color: teamPalette.mutedText }]} numberOfLines={1}>
                          {item.email}
                        </Text>
                      </View>
                      
                      <View style={styles.infoLine}>
                        <Feather name="phone" size={11} color={teamPalette.faintText} style={styles.infoIcon} />
                        <Text style={[styles.infoText, { color: teamPalette.mutedText }]}>
                          {item.contact || "—"}
                        </Text>
                      </View>

                      {/* Badges */}
                      <View style={styles.badgeRow}>
                        <View style={[styles.roleBadge, { backgroundColor: teamPalette.primaryGlow }]}>
                          <Text style={[styles.roleBadgeText, { color: isDark ? "#FFFFFF" : "#6366F1" }]}>
                            Agent
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor:
                                item.status === "ACTIVE"
                                  ? "rgba(34, 197, 94, 0.12)"
                                  : "rgba(239, 68, 68, 0.12)",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusBadgeText,
                              {
                                color: item.status === "ACTIVE" ? "#22C55E" : "#EF4444",
                              },
                            ]}
                          >
                            {item.status || "—"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Actions Column */}
                  <View style={styles.actionColumn}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={[styles.actionBtn, { borderColor: teamPalette.cardBorder }]}
                      onPress={() => setSelectedMember(item)}
                    >
                      <Feather name="eye" size={14} color={teamPalette.text} />
                    </TouchableOpacity>

                    {item.status === "INACTIVE" ? (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={[
                          styles.actionBtn,
                          {
                            borderColor: "rgba(34, 197, 94, 0.25)",
                            backgroundColor: "rgba(34, 197, 94, 0.05)",
                          },
                        ]}
                        onPress={() => handleRestore(item)}
                      >
                        <Feather name="rotate-ccw" size={14} color="#22C55E" />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={[
                          styles.actionBtn,
                          {
                            borderColor: "rgba(239, 68, 68, 0.25)",
                            backgroundColor: "rgba(239, 68, 68, 0.05)",
                          },
                        ]}
                        onPress={() => setMemberToRemove(item)}
                      >
                        <Feather name="trash-2" size={14} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Sleek Floating Action Button (FAB) */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setIsAddDialogOpen(true)}
        style={styles.fab}
      >
        <LinearGradient
          colors={teamPalette.primaryGradient}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <Feather name="plus" size={24} color="white" />
      </TouchableOpacity>

      {/* ------------------- BOTTOM MODALS ------------------- */}
      {/* ADD MEMBER MODAL */}
      <Modal
        visible={isAddDialogOpen}
        transparent
        animationType="slide"
        onRequestClose={() => !isSubmitting && setIsAddDialogOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() => !isSubmitting && setIsAddDialogOpen(false)}
          />
          <View style={[styles.bottomSheet, { backgroundColor: colors.surface }]}>
            {/* Handle Bar */}
            <View style={[styles.bottomSheetHandle, { backgroundColor: teamPalette.divider }]} />
            
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: teamPalette.text }]}>Add Team Member</Text>
              <TouchableOpacity
                disabled={isSubmitting}
                onPress={() => { setIsAddDialogOpen(false); resetForm(); }}
                style={[styles.modalCloseBtn, { borderColor: teamPalette.cardBorder }]}
              >
                <Feather name="x" size={18} color={teamPalette.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalDivider} />

            <ScrollView 
              showsVerticalScrollIndicator={false} 
              style={styles.modalScroll}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {/* Full Name */}
              <PaperInput
                label="Full Name"
                value={fullName}
                onChangeText={setFullName}
                mode="outlined"
                error={!!errors.fullName}
                outlineColor={teamPalette.cardBorder}
                activeOutlineColor={colors.primary}
                textColor={teamPalette.text}
                style={styles.inputStyle}
              />
              {errors.fullName ? <HelperText type="error">{errors.fullName}</HelperText> : null}

              {/* Email */}
              <PaperInput
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                error={!!errors.email}
                outlineColor={teamPalette.cardBorder}
                activeOutlineColor={colors.primary}
                textColor={teamPalette.text}
                style={styles.inputStyle}
              />
              {errors.email ? <HelperText type="error">{errors.email}</HelperText> : null}

              {/* Contact */}
              <PaperInput
                label="Contact Number"
                value={contact}
                onChangeText={setContact}
                mode="outlined"
                keyboardType="phone-pad"
                error={!!errors.contact}
                outlineColor={teamPalette.cardBorder}
                activeOutlineColor={colors.primary}
                textColor={teamPalette.text}
                style={styles.inputStyle}
              />
              {errors.contact ? <HelperText type="error">{errors.contact}</HelperText> : null}

              {/* Password */}
              <PaperInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                right={
                  <PaperInput.Icon 
                    icon={showPassword ? "eye-off" : "eye"} 
                    onPress={() => setShowPassword(!showPassword)} 
                    color={teamPalette.faintText}
                  />
                }
                error={!!errors.password}
                outlineColor={teamPalette.cardBorder}
                activeOutlineColor={colors.primary}
                textColor={teamPalette.text}
                style={styles.inputStyle}
              />
              {errors.password ? <HelperText type="error">{errors.password}</HelperText> : null}

              {/* Confirm Password */}
              <PaperInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                mode="outlined"
                secureTextEntry={!showConfirmPassword}
                right={
                  <PaperInput.Icon 
                    icon={showConfirmPassword ? "eye-off" : "eye"} 
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
                    color={teamPalette.faintText}
                  />
                }
                error={!!errors.confirmPassword}
                outlineColor={teamPalette.cardBorder}
                activeOutlineColor={colors.primary}
                textColor={teamPalette.text}
                style={styles.inputStyle}
              />
              {errors.confirmPassword ? <HelperText type="error">{errors.confirmPassword}</HelperText> : null}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                disabled={isSubmitting} 
                onPress={() => { setIsAddDialogOpen(false); resetForm(); }}
                style={[styles.modalSecondaryBtn, { borderColor: teamPalette.cardBorder }]}
              >
                <Text style={[styles.modalSecondaryBtnText, { color: teamPalette.mutedText }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                disabled={isSubmitting} 
                onPress={handleAddMember}
                style={styles.modalPrimaryBtn}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.modalPrimaryBtnText}>Add Member</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* DETAILS VIEW MODAL */}
      <Modal
        visible={!!selectedMember}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedMember(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() => setSelectedMember(null)}
          />
          <View style={[styles.bottomSheet, { backgroundColor: colors.surface }]}>
            <View style={[styles.bottomSheetHandle, { backgroundColor: teamPalette.divider }]} />
            
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: teamPalette.text }]}>Member Details</Text>
              <TouchableOpacity
                onPress={() => setSelectedMember(null)}
                style={[styles.modalCloseBtn, { borderColor: teamPalette.cardBorder }]}
              >
                <Feather name="x" size={18} color={teamPalette.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalDivider} />

            {selectedMember ? (
              <View style={{ gap: 16, marginVertical: 10 }}>
                <View style={styles.detailsHeader}>
                  <View style={{ position: "relative" }}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => setZoomedMember(selectedMember)}
                    >
                       {selectedMember.photoUrl ? (
                        <Image
                          source={{ uri: selectedMember.photoUrl }}
                          style={styles.avatarBig}
                        />
                      ) : (
                        <LinearGradient
                          colors={["#4F46E5", "#06B6D4"]}
                          style={styles.avatarBig}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <Text style={styles.avatarTextBig}>
                            {getInitials(selectedMember.username)}
                          </Text>
                        </LinearGradient>
                      )}
                    </TouchableOpacity>

                    {/* Maximize Icon Overlay */}
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setZoomedMember(selectedMember)}
                      style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        backgroundColor: colors.primary,
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 1.5,
                        borderColor: colors.surface,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 2,
                        elevation: 3,
                      }}
                    >
                      <Feather name="maximize-2" size={12} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.detailMemberName, { color: teamPalette.text }]}>
                      {capitalizeName(selectedMember.username)}
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.primary, fontWeight: "700", marginTop: 2 }}>
                      Aggregator Member
                    </Text>
                  </View>
                </View>

                <View style={[styles.detailsDivider, { backgroundColor: teamPalette.divider }]} />

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: teamPalette.mutedText }]}>Email</Text>
                  <Text style={[styles.detailValue, { color: teamPalette.text }]} numberOfLines={1}>
                    {selectedMember.email}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: teamPalette.mutedText }]}>Contact</Text>
                  <Text style={[styles.detailValue, { color: teamPalette.text }]}>
                    {selectedMember.contact || "—"}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: teamPalette.mutedText }]}>Status</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          selectedMember.status === "ACTIVE"
                            ? "rgba(34, 197, 94, 0.12)"
                            : "rgba(239, 68, 68, 0.12)",
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 6,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        {
                          color: selectedMember.status === "ACTIVE" ? "#22C55E" : "#EF4444",
                          fontWeight: "800",
                          fontSize: 12,
                        },
                      ]}
                    >
                      {selectedMember.status}
                    </Text>
                  </View>
                </View>
              </View>
            ) : null}

            <View style={[styles.modalActions, { marginTop: 14 }]}>
              <TouchableOpacity 
                onPress={() => setSelectedMember(null)}
                style={styles.modalPrimaryBtnFull}
              >
                <Text style={styles.modalPrimaryBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ZOOM MEMBER AVATAR MODAL */}
      <Modal
        visible={!!zoomedMember}
        transparent
        animationType="fade"
        onRequestClose={() => setZoomedMember(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.75)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() => setZoomedMember(null)}
          />
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <View
              style={{
                width: 280,
                height: 280,
                borderRadius: 140,
                borderWidth: 3,
                borderColor: "#ffffff",
                overflow: "hidden",
                backgroundColor: colors.surface,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
                elevation: 12,
              }}
            >
              {zoomedMember?.photoUrl ? (
                <Image
                  source={{ uri: zoomedMember.photoUrl }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: colors.primaryContainer,
                  }}
                >
                  <Text
                    style={{
                      color: colors.onPrimaryContainer,
                      fontSize: 110,
                      fontWeight: "800",
                    }}
                  >
                    {zoomedMember ? getInitials(zoomedMember.username) : ""}
                  </Text>
                </View>
              )}
            </View>

            {/* Close button below the image */}
            <TouchableOpacity
              onPress={() => setZoomedMember(null)}
              activeOpacity={0.8}
              style={{
                marginTop: 20,
                backgroundColor: colors.surface,
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 24,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontWeight: "800",
                  fontSize: 14,
                }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* REMOVE CONFIRMATION MODAL */}
      <Modal
        visible={!!memberToRemove}
        transparent
        animationType="slide"
        onRequestClose={() => !removeTeamMemberMutation.isPending && setMemberToRemove(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() => !removeTeamMemberMutation.isPending && setMemberToRemove(null)}
          />
          <View style={[styles.bottomSheet, { backgroundColor: colors.surface }]}>
            <View style={[styles.bottomSheetHandle, { backgroundColor: teamPalette.divider }]} />
            
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: teamPalette.text }]}>Remove Member</Text>
              <TouchableOpacity
                disabled={removeTeamMemberMutation.isPending}
                onPress={() => setMemberToRemove(null)}
                style={[styles.modalCloseBtn, { borderColor: teamPalette.cardBorder }]}
              >
                <Feather name="x" size={18} color={teamPalette.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalDivider} />

            <View style={{ gap: 12, marginVertical: 10 }}>
              <Text style={{ fontSize: 15, color: teamPalette.text, lineHeight: 22 }}>
                Are you sure you want to remove{" "}
                <Text style={{ fontWeight: "800" }}>{capitalizeName(memberToRemove?.username)}</Text> from the team?
              </Text>
              <Text style={{ color: colors.error, fontSize: 12, fontWeight: "600" }}>
                This action soft-deletes the user. You can restore them anytime from the "Deleted" tab.
              </Text>
            </View>

            <View style={[styles.modalActions, { marginTop: 14 }]}>
              <TouchableOpacity 
                disabled={removeTeamMemberMutation.isPending} 
                onPress={() => setMemberToRemove(null)}
                style={[styles.modalSecondaryBtn, { borderColor: teamPalette.cardBorder }]}
              >
                <Text style={[styles.modalSecondaryBtnText, { color: teamPalette.mutedText }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                disabled={removeTeamMemberMutation.isPending} 
                onPress={handleConfirmRemove}
                style={[styles.modalPrimaryBtn, { backgroundColor: colors.error }]}
              >
                {removeTeamMemberMutation.isPending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.modalPrimaryBtnText}>Remove Member</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 120,
    gap: 16,
  },
  loadingCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  
  // Header
  headerBlock: {
    gap: 2,
    marginBottom: 4,
  },
  titleText: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.75,
  },
  subtitleText: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 18,
  },
  companyHighlight: {
    fontWeight: "800",
    textDecorationLine: "underline",
  },

  // Metrics
  metricsRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  metricCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  metricContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  metricIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  metricTexts: {
    gap: 1,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "900",
  },

  // Search
  searchContainer: {
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  searchField: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    paddingHorizontal: 10,
    height: "100%",
  },

  // Toggles / Segment Control
  toggleRow: {
    flexDirection: "row",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    padding: 3,
    height: 46,
  },
  toggleButton: {
    flex: 1,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  toggleText: {
    fontSize: 13,
    fontWeight: "800",
  },

  // Empty State
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    gap: 12,
  },
  emptyIconBox: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    borderStyle: "dashed",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  emptySubtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    paddingHorizontal: 48,
    fontWeight: "500",
  },

  // Member Listing
  listContainer: {
    gap: 12,
  },
  memberCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  memberCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  memberMain: {
    flexDirection: "row",
    gap: 14,
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "800",
    color: "white",
    letterSpacing: -0.5,
  },
  memberInfo: {
    gap: 3,
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  infoLine: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    marginRight: 6,
  },
  infoText: {
    fontSize: 12,
    fontWeight: "600",
  },
  badgeRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  actionColumn: {
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  actionBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  // FAB
  fab: {
    position: "absolute",
    bottom: 120,
    right: 24,
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },

  // Bottom Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingTop: 10,
    width: "100%",
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalDivider: {
    height: 1,
    backgroundColor: "transparent",
    marginBottom: 10,
  },
  modalScroll: {
    maxHeight: 320,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  modalSecondaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSecondaryBtnText: {
    fontSize: 14,
    fontWeight: "800",
  },
  modalPrimaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
  },
  modalPrimaryBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "white",
  },
  modalPrimaryBtnFull: {
    width: "100%",
    height: 48,
    borderRadius: 10,
    backgroundColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
  },
  inputStyle: {
    backgroundColor: "transparent",
    marginBottom: 2,
    height: 52,
    fontSize: 14,
  },

  // View Details
  detailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarBig: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTextBig: {
    fontSize: 28,
    fontWeight: "800",
    color: "white",
  },
  detailMemberName: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  detailsDivider: {
    height: 1,
    marginVertical: 4,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "800",
    maxWidth: "70%",
  },
});
