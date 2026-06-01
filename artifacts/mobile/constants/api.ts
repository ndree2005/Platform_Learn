import Constants from "expo-constants";
import { Platform } from "react-native";

const API_PORT = "5000";
const API_PATH = "/api";

function normalizeBaseUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, "");
  return trimmed.endsWith(API_PATH) ? trimmed : `${trimmed}${API_PATH}`;
}

function getHostFromUri(uri?: string | null): string | undefined {
  if (!uri) return undefined;

  const withoutProtocol = uri.replace(/^[a-z]+:\/\//i, "");
  const host = withoutProtocol.split("/")[0]?.split(":")[0];
  return host || undefined;
}

function getNativeDevApiBaseUrl(): string {
  const expoHost = getHostFromUri(
    Constants.expoConfig?.hostUri ?? Constants.platform?.hostUri,
  );
  const isLocalhost =
    !expoHost || expoHost === "localhost" || expoHost === "127.0.0.1";
  const host = Platform.OS === "android" && isLocalhost
    ? "10.0.2.2"
    : expoHost ?? "localhost";

  return `http://${host}:${API_PORT}${API_PATH}`;
}

function getApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return normalizeBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL);
  }
  if (Platform.OS === "web" && typeof window !== "undefined" && window.location?.hostname) {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return `http://${host}:${API_PORT}${API_PATH}`;
    }
    const apiHost = host.replace(".expo.", ".");
    return `https://${apiHost}${API_PATH}`;
  }
  return getNativeDevApiBaseUrl();
}

export const API_BASE_URL = getApiBaseUrl();

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get:    <T>(path: string) => apiFetch<T>(path),
  post:   <T>(path: string, body: unknown) => apiFetch<T>(path, { method: "POST",   body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown) => apiFetch<T>(path, { method: "PUT",    body: JSON.stringify(body) }),
  delete: <T>(path: string)                => apiFetch<T>(path, { method: "DELETE" }),
};
