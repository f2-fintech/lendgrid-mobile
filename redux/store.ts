import { configureStore } from '@reduxjs/toolkit';
import counter from './features/counterSlice';
import theme from "./features/themeSlice";


export const store = configureStore({
  reducer: { counter, theme },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
