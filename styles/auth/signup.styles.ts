import { StyleSheet } from "react-native";

export const signUpStyles = StyleSheet.create({
  inner: {
    padding: 20,
    paddingTop: 40,
  },

  backText: {
    color: "#FFD600",
    marginBottom: 10,
    fontSize: 14,
    fontWeight: "600",
  },

  // Optional subtitle (used in your screen)
  subtitle: {
    color: "#A7B3C7",
    textAlign: "center",
    marginBottom: 16,
    fontSize: 15,
  },

  label: {
    color: "#ffffff",
    fontSize: 14,
    marginBottom: 6,
    fontWeight: "600",
  },

  // 🔹 Two column row layout
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  colLeft: {
    flex: 1,
    marginRight: 8,
  },

  colRight: {
    flex: 1,
    marginLeft: 8,
  },

  // 🔹 Input Styling (Dark modern)
  input: {
    backgroundColor: "#0E1626",
    borderRadius: 14,
    color: "#EAF0FF",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },

  // 🔹 Password container (with eye icon)
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0E1626",
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    color: "#EAF0FF",
    fontSize: 14,
  },

  eyeIcon: {
    paddingLeft: 8,
  },

  // 🔹 Button
  signUpButton: {
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },

  signUpButtonText: {
    color: "#FFD600",
    fontWeight: "700",
    fontSize: 16,
  },

  // 🔹 Footer text
  footerText: {
    textAlign: "center",
    color: "#ccc",
    marginTop: 10,
    fontSize: 14,
  },

  signInLink: {
    color: "#FFD600",
    fontWeight: "600",
  },

  // 🔹 Error text
  error: {
    color: "#ff4d4d",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 6,
  },
});
