import axios from "axios";

const effectiveProtocol = 'http:';

const isProd = window.location.hostname.endsWith('switchology.in');
const appBaseUrl = isProd 
  ? 'https://' + window.location.hostname   // Cloudflare Tunnel → HTTPS
  : window.location.protocol + '//' + window.location.hostname; // localhost/dev

// const appBaseUrl = 'http://192.168.1.28'
console.log(appBaseUrl, isProd);

export const configInit = {
  gatewayName: "",
  appProtocol: effectiveProtocol,
  accessURL: window.location.hostname, // Hostname of the frontend
  appBaseUrl,
  hasuraUrl: `${appBaseUrl}/query/graphql`,
  hasuraAdminSecret: import.meta.env.VITE_HASURA_ADMIN_SECRET,
  orgName: "",
  buildingName: "",
  address: "",
  formatDates: (dateStr) => {
    let date = new Date(dateStr);
    return date
      .toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
      .replace(",", "");
  },

  formatDatesInTariff: (dateStr) => {
    // First check if the input is falsy or empty
    if (!dateStr) return 'Invalid Date';

    // Create Date object (handles both string timestamps and ISO formats)
    const date = new Date(dateStr);

    // Check if the date is invalid
    if (isNaN(date.getTime())) {
      console.error('Invalid date string:', dateStr);
      return 'Invalid Date';
    }

    try {
      // Format for IST timezone (Asia/Kolkata)
      return new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(date).replace(/\s*,\s*/, ' ');
    } catch (e) {
      console.error('Date formatting failed:', e);
      return 'Format Error';
    }
  },

  formatDateInReport: (date) => date ? `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}` : "",

  gatewayToken: async function () {
    try {
      let token = localStorage.getItem('accessToken');
      let refreshToken = localStorage.getItem('refreshToken');
      if (!token) {
        // Uses this.appBaseUrl which is now correctly https://...
        const loginResponse = await axios.post(`${this.appBaseUrl}/v2/api/login`, {
          username: import.meta.env.VITE_GATEWAY_USERNAME,
          password: import.meta.env.VITE_GATEWAY_PASSWORD
        });
        token = loginResponse.data.accessToken;
        refreshToken = loginResponse.data.refreshToken;
        localStorage.setItem('accessToken', token);
        localStorage.setItem('refreshToken', refreshToken);
      }
      console.log(configInit.appBaseUrl);
      return token;

    } catch (error) {
      if (error.response && error.response.status === 403) {
        try {
          let refreshTokenValue = localStorage.getItem('refreshToken');
          // Uses this.appBaseUrl which is now correctly https://...
          const refreshResponse = await axios.post(`${this.appBaseUrl}/v2/token`, {
            token: refreshTokenValue
          });
          const newAccessToken = refreshResponse.data.accessToken;
          localStorage.setItem('accessToken', newAccessToken);

          // Re-login after token refresh
          // Uses this.appBaseUrl which is now correctly https://...
          const loginResponse = await axios.post(`${this.appBaseUrl}/v2/api/login`, {
            username: import.meta.env.VITE_GATEWAY_USERNAME,
            password: import.meta.env.VITE_GATEWAY_PASSWORD
          });
          const newToken = loginResponse.data.accessToken;
          const newRefreshToken = loginResponse.data.refreshToken;
          localStorage.setItem('accessToken', newToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          return newToken;
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
          return refreshError;
        }
      } else {
        console.error('Failed to fetch data for gatewayToken:', error);
        return error;
      }
    }
  },
};