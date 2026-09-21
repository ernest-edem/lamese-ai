import { getAccessToken } from "./authService";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error(
    "VITE_API_URL is not configured.",
  );
}

// ============================================================
// PREDICTION
// ============================================================

export async function predictPatient(patient) {
  // ----------------------------------------------------------
  // Get the current Firebase ID token
  // ----------------------------------------------------------
  let accessToken;

  try {
    accessToken = await getAccessToken();
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Unable to retrieve the authentication token.",
    );
  }

  if (!accessToken) {
    throw new Error(
      "Your session has expired. Please sign in again.",
    );
  }

  // ----------------------------------------------------------
  // Send prediction request
  // ----------------------------------------------------------
  const response = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(patient),
  });

  // ----------------------------------------------------------
  // Parse API response
  // ----------------------------------------------------------
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Prediction request failed.",
    );
  }

  return data;
}