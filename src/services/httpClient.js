import axios from "axios";
import { configInit } from "../components/layout/globalvariable";
import { ensureApiKey, handleApiAuthError } from "./apiKeyManager";

const backendBase = (() => {
  try {
    return new URL(configInit.appBaseUrl);
  } catch (err) {
    console.error("Invalid backend base URL:", configInit.appBaseUrl, err);
    return null;
  }
})();

const normalizeMethod = (value) => (value || "GET").toUpperCase();

const isBackendRequest = (url) => {
  if (!backendBase) return false;
  try {
    const target = new URL(url, backendBase);
    return target.origin === backendBase.origin;
  } catch {
    return false;
  }
};

const shouldSkipApiKey = (url, method) => {
  const normalizedMethod = normalizeMethod(method);
  if (normalizedMethod !== "GET") return false;
  try {
    const target = new URL(url, backendBase);
    const pathname = target.pathname.replace(/\/+$/, "") || "/";
    return pathname === "/" || pathname === "/health";
  } catch {
    return false;
  }
};

const attachApiKeyHeader = async (headers, url, method) => {
  if (!isBackendRequest(url) || shouldSkipApiKey(url, method)) return headers;
  const workingHeaders = headers instanceof Headers ? new Headers(headers) : new Headers(headers || {});
  if (!workingHeaders.has("X-API-Key")) {
    const key = ensureApiKey({ allowPrompt: true });
    workingHeaders.set("X-API-Key", key);
  }
  return workingHeaders;
};

const installFetchInterceptor = () => {
  if (typeof window === "undefined" || !window.fetch || window.__gatewayFetchPatched) return;
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init = {}) => {
    let request = input instanceof Request ? input : new Request(input, init);
    const method = normalizeMethod(request.method || init.method);

    if (isBackendRequest(request.url) && !shouldSkipApiKey(request.url, method)) {
      const headers = await attachApiKeyHeader(request.headers, request.url, method);
      request = new Request(request, { headers });
    }

    const response = await originalFetch(request);
    if (response && (response.status === 401 || response.status === 403)) {
      handleApiAuthError(response.status);
    }
    return response;
  };

  window.__gatewayFetchPatched = true;
};

const installAxiosInterceptor = () => {
  if (axios.__gatewayInterceptorInstalled) return;

  axios.interceptors.request.use(
    async (config) => {
      const url = config.baseURL ? new URL(config.url, config.baseURL).toString() : config.url;
      if (!isBackendRequest(url) || shouldSkipApiKey(url, config.method)) return config;
      const headers = await attachApiKeyHeader(config.headers, url, config.method);
      config.headers = headers instanceof Headers ? Object.fromEntries(headers.entries()) : headers;
      return config;
    },
    (error) => Promise.reject(error)
  );

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        handleApiAuthError(status);
      }
      return Promise.reject(error);
    }
  );

  axios.__gatewayInterceptorInstalled = true;
};

export const installGatewayHttpInterceptors = () => {
  installFetchInterceptor();
  installAxiosInterceptor();
};
