/**
 * Production backend API configuration
 * Base URL: https://madhubani-pallete-backend.onrender.com
 * API URL:  https://madhubani-pallete-backend.onrender.com/api
 */

const PRODUCTION_API_BASE_URL = "https://madhubani-pallete-backend.onrender.com";

export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;

  if (!envUrl || typeof envUrl !== "string") {
    return PRODUCTION_API_BASE_URL;
  }

  const cleanUrl = envUrl
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\/+$/, "");

  // Guard against unconfigured templates or local dev fallbacks
  if (
    !cleanUrl ||
    cleanUrl.includes("<") ||
    cleanUrl.includes(">") ||
    cleanUrl.includes("localhost") ||
    cleanUrl.includes("127.0.0.1")
  ) {
    return PRODUCTION_API_BASE_URL;
  }

  // Remove trailing /api if user supplied it in env var so base URL remains root
  return cleanUrl.replace(/\/api$/, "");
};

// Base origin URL (https://madhubani-pallete-backend.onrender.com)
export const API_BASE_URL = getApiBaseUrl();

// Full API endpoint prefix (https://madhubani-pallete-backend.onrender.com/api)
// Ensures no duplicate /api/api
export const API_URL = `${API_BASE_URL}/api`;

export default API_URL;
