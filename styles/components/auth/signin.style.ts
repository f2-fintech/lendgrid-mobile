import { StyleSheet } from "react-native";

export const signInStyles = StyleSheet.create({
  container: {
    backgroundColor: "#0c0c0c",
    flex: 1,
  },
  inner: {
    flex: 1,
    padding: 20,
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
    backgroundColor: "#fff",
    borderRadius: 10,
    color: "#000",
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 14,
    marginBottom: 12,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1b1b1b",
    borderRadius: 10,
    marginBottom: 20,
  },
  eyeIcon: {
    paddingHorizontal: 10,
  },
  signInButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  signInText: {
    color: "#FFD600",
    fontWeight: "700",
    fontSize: 16,
  },
  footerText: {
    textAlign: "center",
    color: "#ccc",
    marginTop: 25,
    fontSize: 14,
  },
  signUpText: {
    color: "#FFD600",
    fontWeight: "600",
  },
});