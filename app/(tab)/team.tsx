import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert,
  FlatList,
} from "react-native";
import {
  Text,
  useTheme,
  Card,
  Button,
  Dialog,
  Portal,
  TextInput as PaperInput,
  IconButton,
  Badge,
  HelperText,
} from "react-native-paper";
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";

import { useProfile, useRegisterUser } from "@/hooks/useAuth";
import {
  useAggregatorDetails,
  useAddTeamMember,
  useRemoveTeamMember,
} from "@/hooks/useAggregator";

function getInitials(name: string) {
  return (name || "U")
    .split(" ")
    .map((s) => s.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

export default function TeamManagementScreen() {
  const theme = useTheme();
  const { colors } = theme;

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  
  // Dialog visibility states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<any | null>(null);

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
        <Text style={{ marginTop: 10, color: colors.onSurfaceVariant }}>Loading team details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.root, { backgroundColor: colors.background }]} contentContainerStyle={styles.container}>
      {/* HEADER SUMMARY */}
      <View style={styles.headerBlock}>
        <Text variant="headlineMedium" style={styles.titleText}>Team Management</Text>
        <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant, marginBottom: 8 }}>
          Manage your active team members for{" "}
          <Text style={{ color: colors.primary, fontWeight: "700" }}>
            {profileData?.companyName || "your company"}
          </Text>
        </Text>

        <Button
          mode="contained"
          onPress={() => setIsAddDialogOpen(true)}
          icon={() => <Feather name="user-plus" size={16} color="white" />}
          style={styles.addButton}
          contentStyle={{ height: 42 }}
        >
          Add Member
        </Button>
      </View>

      {/* METRICS */}
      <View style={styles.metricsRow}>
        <Card style={[styles.metricCard, { backgroundColor: colors.surfaceVariant }]}>
          <Card.Content style={styles.metricContent}>
            <View style={styles.metricIconBox}>
              <Ionicons name="people" size={20} color={colors.primary} />
            </View>
            <View>
              <Text variant="labelMedium" style={{ opacity: 0.7 }}>Total</Text>
              <Text variant="titleLarge" style={{ fontWeight: "700" }}>{teamMembers.length}</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={[styles.metricCard, { backgroundColor: colors.surfaceVariant }]}>
          <Card.Content style={styles.metricContent}>
            <View style={[styles.metricIconBox, { backgroundColor: "rgba(34, 197, 94, 0.15)" }]}>
              <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
            </View>
            <View>
              <Text variant="labelMedium" style={{ opacity: 0.7 }}>Active</Text>
              <Text variant="titleLarge" style={{ fontWeight: "700", color: "#22C55E" }}>{activeMembers.length}</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={[styles.metricCard, { backgroundColor: colors.surfaceVariant }]}>
          <Card.Content style={styles.metricContent}>
            <View style={[styles.metricIconBox, { backgroundColor: "rgba(239, 68, 68, 0.15)" }]}>
              <Ionicons name="trash-bin" size={20} color="#EF4444" />
            </View>
            <View>
              <Text variant="labelMedium" style={{ opacity: 0.7 }}>Deleted</Text>
              <Text variant="titleLarge" style={{ fontWeight: "700", color: "#EF4444" }}>{inactiveMembers.length}</Text>
            </View>
          </Card.Content>
        </Card>
      </View>



      {/* SEARCH AND TOGGLE VIEW */}
      <View style={styles.controlsBlock}>
        {/* Toggle buttons */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            onPress={() => setFilterStatus("ACTIVE")}
            style={[
              styles.toggleButton,
              filterStatus === "ACTIVE" && { backgroundColor: colors.primary },
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                { color: filterStatus === "ACTIVE" ? "white" : colors.onSurface },
              ]}
            >
              Active ({activeMembers.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterStatus("INACTIVE")}
            style={[
              styles.toggleButton,
              filterStatus === "INACTIVE" && { backgroundColor: colors.primary },
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                { color: filterStatus === "INACTIVE" ? "white" : colors.onSurface },
              ]}
            >
              Deleted ({inactiveMembers.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Input */}
        <PaperInput
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search by name, email, or phone..."
          mode="outlined"
          left={<PaperInput.Icon icon="magnify" />}
          right={searchTerm ? <PaperInput.Icon icon="close" onPress={() => setSearchTerm("")} /> : null}
          style={styles.searchInput}
        />
      </View>

      {/* MEMBER LISTING */}
      {filteredMembers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconButton icon="account-group-outline" size={48} style={{ opacity: 0.4 }} />
          <Text variant="titleMedium" style={{ opacity: 0.6 }}>No team members found</Text>
          <Text variant="bodySmall" style={{ opacity: 0.4, textAlign: "center", paddingHorizontal: 40 }}>
            {searchTerm ? "Adjust your search filters" : filterStatus === "ACTIVE" ? "Get started by adding a team member" : "No deleted members in your team"}
          </Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {filteredMembers.map((item) => (
            <Card key={item._id} style={styles.memberCard}>
              <Card.Content style={styles.memberCardContent}>
                <View style={styles.memberMain}>
                  <View style={[styles.avatar, { backgroundColor: colors.primaryContainer }]}>
                    <Text style={[styles.avatarText, { color: colors.onPrimaryContainer }]}>
                      {getInitials(item.username)}
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text variant="titleMedium" style={{ fontWeight: "700" }}>{item.username || "—"}</Text>
                    <View style={styles.infoLine}>
                      <Ionicons name="mail" size={12} color={colors.onSurfaceVariant} style={{ marginRight: 4 }} />
                      <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>{item.email}</Text>
                    </View>
                    <View style={styles.infoLine}>
                      <Ionicons name="call" size={12} color={colors.onSurfaceVariant} style={{ marginRight: 4 }} />
                      <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>{item.contact || "—"}</Text>
                    </View>

                    {/* BADGES */}
                    <View style={styles.badgeRow}>
                      <Badge style={styles.roleBadge}>Aggregator Member</Badge>
                      <Badge
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              item.status === "ACTIVE" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                            color: item.status === "ACTIVE" ? "#22C55E" : "#EF4444",
                          },
                        ]}
                      >
                        {item.status || "—"}
                      </Badge>
                    </View>
                  </View>
                </View>

                {/* MEMBER ACTIONS */}
                <View style={styles.actionRow}>
                  <IconButton
                    icon="eye"
                    size={20}
                    onPress={() => setSelectedMember(item)}
                  />
                  {item.status === "INACTIVE" ? (
                    <IconButton
                      icon="refresh"
                      size={20}
                      iconColor="#22C55E"
                      onPress={() => handleRestore(item)}
                    />
                  ) : (
                    <IconButton
                      icon="trash-can"
                      size={20}
                      iconColor={colors.error}
                      onPress={() => setMemberToRemove(item)}
                    />
                  )}
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      )}

      {/* ------------------- DIALOGS & PORTALS ------------------- */}
      <Portal>
        {/* ADD MEMBER DIALOG */}
        <Dialog visible={isAddDialogOpen} onDismiss={() => !isSubmitting && setIsAddDialogOpen(false)} style={styles.dialogStyle}>
          <Dialog.Title>Add Team Member</Dialog.Title>
          <Dialog.Content style={{ gap: 10 }}>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 350 }}>
              {/* Full Name */}
              <PaperInput
                label="Full Name"
                value={fullName}
                onChangeText={setFullName}
                mode="outlined"
                error={!!errors.fullName}
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
              />
              {errors.contact ? <HelperText type="error">{errors.contact}</HelperText> : null}

              {/* Password */}
              <PaperInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                right={<PaperInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />}
                error={!!errors.password}
              />
              {errors.password ? <HelperText type="error">{errors.password}</HelperText> : null}

              {/* Confirm Password */}
              <PaperInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                mode="outlined"
                secureTextEntry={!showConfirmPassword}
                right={<PaperInput.Icon icon={showConfirmPassword ? "eye-off" : "eye"} onPress={() => setShowConfirmPassword(!showConfirmPassword)} />}
                error={!!errors.confirmPassword}
              />
              {errors.confirmPassword ? <HelperText type="error">{errors.confirmPassword}</HelperText> : null}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button disabled={isSubmitting} onPress={() => { setIsAddDialogOpen(false); resetForm(); }}>Cancel</Button>
            <Button loading={isSubmitting} disabled={isSubmitting} onPress={handleAddMember}>Add</Button>
          </Dialog.Actions>
        </Dialog>

        {/* DETAILS VIEW DIALOG */}
        <Dialog visible={!!selectedMember} onDismiss={() => setSelectedMember(null)} style={styles.dialogStyle}>
          <Dialog.Title>Member Details</Dialog.Title>
          <Dialog.Content>
            {selectedMember ? (
              <View style={{ gap: 12 }}>
                <View style={styles.detailsHeader}>
                  <View style={[styles.avatarBig, { backgroundColor: colors.primaryContainer }]}>
                    <Text style={[styles.avatarTextBig, { color: colors.onPrimaryContainer }]}>
                      {getInitials(selectedMember.username)}
                    </Text>
                  </View>
                  <View>
                    <Text variant="titleMedium" style={{ fontWeight: "700" }}>{selectedMember.username}</Text>
                    <Text variant="bodySmall" style={{ color: colors.primary }}>Aggregator Member</Text>
                  </View>
                </View>

                <View style={styles.detailsDivider} />

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailValue}>{selectedMember.email}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Contact</Text>
                  <Text style={styles.detailValue}>{selectedMember.contact || "—"}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <Badge
                    style={[
                      styles.statusBadgeDetails,
                      {
                        backgroundColor:
                          selectedMember.status === "ACTIVE" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                        color: selectedMember.status === "ACTIVE" ? "#22C55E" : "#EF4444",
                      },
                    ]}
                  >
                    {selectedMember.status}
                  </Badge>
                </View>
              </View>
            ) : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSelectedMember(null)}>Close</Button>
          </Dialog.Actions>
        </Dialog>

        {/* REMOVE CONFIRMATON DIALOG */}
        <Dialog visible={!!memberToRemove} onDismiss={() => !removeTeamMemberMutation.isPending && setMemberToRemove(null)} style={styles.dialogStyle}>
          <Dialog.Title>Remove Member</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to remove{" "}
              <Text style={{ fontWeight: "700" }}>{memberToRemove?.username}</Text> from the team?
            </Text>
            <Text variant="bodySmall" style={{ color: colors.error, marginTop: 8 }}>
              This action soft-deletes the user. You can restore them anytime from the "Deleted" tab.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button disabled={removeTeamMemberMutation.isPending} onPress={() => setMemberToRemove(null)}>Cancel</Button>
            <Button
              loading={removeTeamMemberMutation.isPending}
              disabled={removeTeamMemberMutation.isPending}
              textColor={colors.error}
              onPress={handleConfirmRemove}
            >
              Remove
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  loadingCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerBlock: {
    gap: 4,
    marginBottom: 4,
  },
  titleText: {
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  addButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  metricCard: {
    flex: 1,
    borderRadius: 12,
    elevation: 1,
  },
  metricContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  metricIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "rgba(50, 56, 243, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  referralCard: {
    borderRadius: 12,
    elevation: 2,
  },
  referralHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  referralHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  codeBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 14,
    paddingRight: 4,
    borderRadius: 8,
    height: 44,
  },
  codeText: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "monospace",
    letterSpacing: 1,
  },
  controlsBlock: {
    gap: 10,
  },
  toggleRow: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  toggleButton: {
    flex: 1,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  toggleText: {
    fontSize: 13,
    fontWeight: "600",
  },
  searchInput: {
    height: 42,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 4,
  },
  listContainer: {
    gap: 12,
  },
  memberCard: {
    borderRadius: 12,
    elevation: 1,
  },
  memberCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  memberMain: {
    flexDirection: "row",
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
  },
  memberInfo: {
    gap: 2,
    flex: 1,
  },
  infoLine: {
    flexDirection: "row",
    alignItems: "center",
  },
  badgeRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  roleBadge: {
    backgroundColor: "rgba(50, 56, 243, 0.1)",
    color: "#3238F3",
    fontSize: 10,
    height: 18,
    borderRadius: 4,
  },
  statusBadge: {
    fontSize: 10,
    height: 18,
    borderRadius: 4,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dialogStyle: {
    borderRadius: 16,
  },
  detailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarBig: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTextBig: {
    fontSize: 20,
    fontWeight: "700",
  },
  detailsDivider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    marginVertical: 4,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontWeight: "600",
    opacity: 0.6,
  },
  detailValue: {
    fontWeight: "700",
  },
  statusBadgeDetails: {
    borderRadius: 4,
  },
});
