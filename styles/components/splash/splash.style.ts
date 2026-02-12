import { StyleSheet } from "react-native";
import { COLORS, SIZES, SPACING } from "./token";

export const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.brandBg,
    justifyContent: "center",
    alignItems: "center",
  },

  //  NEW BRANDING
  brandWrap: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING(1),
  },
  brandLogo: {
    width: 130,
    height: 130,
    marginBottom: 0,
  },
  brandText: {
    color: "#4c7dff",
    fontWeight: "800",
    fontSize: 36,
    marginTop: -25,
  },

  iconContainer: {
    width: SIZES.icon + 20,
    height: SIZES.icon + 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING(2),
  },

  subtitle: {
    fontSize: SIZES.subtitle,
    color: COLORS.textMuted,
    marginTop: SPACING(1.25),
    height: 25,
  },

  // (optional) old styles — can keep or delete
  logo: {
    width: SIZES.logo,
    height: SIZES.logo,
    marginBottom: SPACING(2.5),
  },
  title: {
    fontSize: SIZES.title,
    fontWeight: "bold",
    color: COLORS.brandAccent,
    marginBottom: SPACING(1.25),
    paddingVertical: 5,
  },
});
