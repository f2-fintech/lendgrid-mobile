import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ThemeState = { mode: "light" | "dark" };

const initialState: ThemeState = {
  mode: "light",
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (s) => {
      s.mode = s.mode === "light" ? "dark" : "light";
    },
    setTheme: (s, a: PayloadAction<"light" | "dark">) => {
      s.mode = a.payload;
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
