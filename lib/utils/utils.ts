import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";
import Constants from "expo-constants";

const extra = (Constants.expoConfig?.extra ?? {}) as any;

const UPLOAD_API_URL = String(extra?.UPLOAD_API_URL).replace(/\/+$/, "");
console.log("UPLOAD_API_URL:", UPLOAD_API_URL);

/* =========================
   Storage helpers (mobile)
   ========================= */

export async function getCookie(name: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(name);
  } catch {
    return null;
  }
}

export async function setCookie(name: string, value: string): Promise<void> {
  await AsyncStorage.setItem(name, value);
}

export async function deleteCookie(name: string): Promise<void> {
  await AsyncStorage.removeItem(name);
}

/* =========================
   JWT decode (mobile)
   ========================= */

export type DecodedJwt = Record<string, any>;

function base64UrlToBase64(input: string) {
  const pad = "=".repeat((4 - (input.length % 4)) % 4);
  return (input + pad).replace(/-/g, "+").replace(/_/g, "/");
}

function safeJsonParse(str: string) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

export function decodeJwt(token: string | null | undefined): DecodedJwt | null {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    // @ts-ignore
    const jsonStr = Buffer.from(base64UrlToBase64(payload), "base64").toString(
      "utf8",
    );
    return safeJsonParse(jsonStr);
  } catch (e) {
    console.log("Failed to decode JWT:", e);
    return null;
  }
}

/* =========================
   File helpers
   ========================= */

export type RNFileAsset = {
  uri: string;
  name?: string;
  type?: string;
  mimeType?: string;
};

export function guessMimeTypeFromName(name?: string) {
  const n = (name || "").toLowerCase();
  if (n.endsWith(".png")) return "image/png";
  if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "image/jpeg";
  if (n.endsWith(".webp")) return "image/webp";
  if (n.endsWith(".gif")) return "image/gif";
  if (n.endsWith(".pdf")) return "application/pdf";
  return "application/octet-stream";
}

export function createPublicFilePath(
  fileName: string,
  folder: string = "uploads",
) {
  const cleanName = (fileName || "file").replace(/\s+/g, "_");
  const time = Date.now();
  return `/${folder}/${time}-${cleanName}`;
}

/* =========================
   General reusable helpers
   ========================= */

export function generateApplicationNumber(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

export function getPrettyError(err: any): string {
  const status = err?.response?.status;
  const msg =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    "Something went wrong";

  const errorsArr = err?.response?.data?.errors;
  const extraMsg =
    Array.isArray(errorsArr) && errorsArr.length
      ? ` (${errorsArr[0]?.message || errorsArr[0]})`
      : "";

  return status ? `(${status}) ${msg}${extraMsg}` : String(msg);
}

export function normalizeString(v?: string | null): string {
  return String(v ?? "").trim();
}

/* =========================
   Upload to S3 (mobile)
   ========================= */

// Same name as website: uploadToS3(file, folder)
// On mobile: file is RNFileAsset (uri-based), folder is string (same backend param)
export const uploadToS3 = async (
  file: RNFileAsset,
  folder: string,
): Promise<string> => {
  if (!file?.uri) throw new Error("Missing file uri");

  const name = file.name || `upload-${Date.now()}.jpg`;
  const type = file.type || guessMimeTypeFromName(name);

  const formData = new FormData();
  formData.append("folder", folder);

  // React Native FormData file object
  // @ts-ignore
  formData.append("document", {
    uri: file.uri,
    name,
    type,
  });

  const response = await fetch(`${UPLOAD_API_URL}/upload-to-s3`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const txt = await response.text().catch(() => "");
    throw new Error(txt || "Failed to upload image");
  }

  const result = await response.json();
  return result.data; // backend returns { data: "S3_URL" }
};

/* =========================
   Simple utils
   ========================= */

export function formatDateIndian(dateString: string): string {
  const dateObj = new Date(dateString);
  if (Number.isNaN(dateObj.getTime())) return "-";
  return dateObj.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
