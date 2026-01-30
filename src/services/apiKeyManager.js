import { toast } from "react-toastify";

const STORAGE_KEY = "gatewayApiKey";
const ENV_API_KEY = (import.meta.env?.VITE_GATEWAY_API_KEY || "").trim();
const ENV_LOCKED = Boolean(ENV_API_KEY);

let apiKey = ENV_API_KEY;

const readStoredKey = () => {
  if (ENV_LOCKED) return ENV_API_KEY;
  try {
    return localStorage.getItem(STORAGE_KEY) || "";
  } catch (err) {
    console.warn("Failed to read stored API key:", err);
    return "";
  }
};

if (!apiKey && typeof window !== "undefined") {
  apiKey = readStoredKey();
}

const persistKey = (key) => {
  if (ENV_LOCKED) return;
  try {
    if (key) {
      localStorage.setItem(STORAGE_KEY, key);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (err) {
    console.warn("Unable to persist API key:", err);
  }
};

export const getApiKey = () => apiKey;

export const setApiKey = (nextKey) => {
  if (ENV_LOCKED) {
    toast.warn("API key is managed via environment variables; update the deployment config to change it.", {
      toastId: "env-api-key-locked",
    });
    return apiKey;
  }
  apiKey = (nextKey || "").trim();
  persistKey(apiKey);
  return apiKey;
};

export const clearStoredApiKey = () => {
  if (ENV_LOCKED) return;
  apiKey = "";
  persistKey("");
};

export const ensureApiKey = ({ allowPrompt = true, promptMessage } = {}) => {
  if (apiKey) return apiKey;
  if (ENV_LOCKED) return ENV_API_KEY;

  if (allowPrompt && typeof window !== "undefined") {
    const message =
      promptMessage ||
      "Enter the Gateway API key (stored securely in this browser). Contact your administrator if you need one.";
    const userInput = window.prompt(message, "");
    if (userInput && userInput.trim()) {
      setApiKey(userInput.trim());
      return apiKey;
    }
  }

  throw new Error("Gateway API key is required before calling backend services.");
};

export const handleApiAuthError = (status) => {
  if (status !== 401 && status !== 403) return;

  const toastId = status === 401 ? "api-key-missing" : "api-key-invalid";
  const message =
    status === 401
      ? "Gateway rejected the request: API key missing. Please provide your key."
      : "Gateway rejected the request: API key invalid. Please update your key.";

  toast.error(message, { toastId });

  if (ENV_LOCKED) {
    toast.error("The API key is supplied via environment config. Please update VITE_GATEWAY_API_KEY and rebuild.", {
      toastId: "api-key-env-update",
    });
    return;
  }

  clearStoredApiKey();
  try {
    ensureApiKey({ allowPrompt: true, promptMessage: message });
  } catch {
    // User dismissed the prompt; next request will retry.
  }
};

export const isEnvApiKeyLocked = () => ENV_LOCKED;
