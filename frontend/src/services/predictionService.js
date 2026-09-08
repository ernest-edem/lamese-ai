import { supabase } from "./supabaseClient";

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
  // Get the current authenticated session
  // ----------------------------------------------------------
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(
      "Unable to retrieve the authentication session.",
    );
  }

  if (!session?.access_token) {
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
      Authorization: `Bearer ${session.access_token}`,
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