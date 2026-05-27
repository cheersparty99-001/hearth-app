import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { config } from "./config";

const webStorage = {
  getItem: (k: string) =>
    Promise.resolve(
      typeof localStorage !== "undefined" ? localStorage.getItem(k) : null
    ),
  setItem: (k: string, v: string) =>
    Promise.resolve(
      typeof localStorage !== "undefined" ? localStorage.setItem(k, v) : undefined
    ),
  removeItem: (k: string) =>
    Promise.resolve(
      typeof localStorage !== "undefined" ? localStorage.removeItem(k) : undefined
    ),
};

const nativeStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

const storageAdapter = Platform.OS === "web" ? webStorage : nativeStorage;

export const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
  auth: {
    storage: storageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});