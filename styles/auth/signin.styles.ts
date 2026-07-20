import { StyleSheet } from "react-native";

export const signInStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    justifyContent: "center",
  },
  label: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 6,
    marginTop: 15,
    fontWeight: "500",
  },
  input: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 15,
    marginBottom: 12,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    marginBottom: 6,
  },
  eyeIcon: {
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  signInButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  signInText: {
    color: "#FFD600",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  footerText: {
    textAlign: "center",
    color: "#ccc",
    marginTop: 24,
    fontSize: 14,
  },
  signUpText: {
    color: "#FFD600",
    fontWeight: "700",
  },
});
