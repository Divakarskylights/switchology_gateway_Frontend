import { configInit } from "../components/layout/globalvariable";

export const parseProfilesPayload = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.profiles)) return payload.profiles;
  if (Array.isArray(payload?.nodes)) return payload.nodes;
  if (Array.isArray(payload?.allProfiles?.nodes)) return payload.allProfiles.nodes;
  return [payload];
};

let cachedProfiles = null;
let inflightRequest = null;

const fetchProfilesFromApi = async () => {
  const response = await fetch(`${configInit.appBaseUrl}/api/profiles`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const payload = await response.json();
  return parseProfilesPayload(payload);
};

export const fetchProfilesList = async ({ force = false } = {}) => {
  if (!force && cachedProfiles) {
    return cachedProfiles;
  }
  if (!force && inflightRequest) {
    return inflightRequest;
  }

  inflightRequest = fetchProfilesFromApi()
    .then((profiles) => {
      cachedProfiles = profiles;
      inflightRequest = null;
      return profiles;
    })
    .catch((error) => {
      inflightRequest = null;
      throw error;
    });

  return inflightRequest;
};

export const fetchFirstProfile = async (options) => {
  const profiles = await fetchProfilesList(options);
  return profiles[0] || null;
};

export const invalidateProfilesCache = () => {
  cachedProfiles = null;
  inflightRequest = null;
};
