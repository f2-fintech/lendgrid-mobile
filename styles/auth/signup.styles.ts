import { StyleSheet } from "react-native";

export const signUpStyles = StyleSheet.create({
  inner: {
    padding: 20,
    paddingTop: 40,
  },

  backText: {
    color: "#FFD600",
    marginBottom: 10,
  },

  logoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  logo: {
    width: 45,
    height: 45,
    marginRight: 8,
  },

  logoText: {
    color: "#FFD600",
    fontWeight: "700",
    fontSize: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 5,
  },

  subtitle: {
    color: "#ccc",
    textAlign: "center",
    marginBottom: 25,
    fontSize: 14,
  },

  label: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 6,
    fontWeight: "500",
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    color: "#000",
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 15,
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    paddingRight: 10,
  },

  passwordInput: {
    flex: 1,
    marginBottom: 0,
  },

  eyeIcon: {
    paddingLeft: 8,
  },

  signUpButton: {
    paddingVertical: 14,
    alignItems: "center",
  },

  signUpButtonText: {
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

  signInLink: {
    color: "#FFD600",
    fontWeight: "600",
  },
  error: {
    color: "#ff4d4d",
    fontSize: 13,
    marginTop: -8,
    marginBottom: 10,
  },
});
