
import { supabase } from "./supabaseClient";

// ============================================================
// EMAIL / PASSWORD LOGIN
// ============================================================
export async function login(email, password) {
  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// ============================================================
// EMAIL / PASSWORD SIGN UP
// ============================================================
export async function signUp(email, password) {
  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// ============================================================
// GOOGLE OAUTH
// ============================================================
export async function signInWithGoogle() {
  const { data, error } =
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// ============================================================
// PASSWORD RESET REQUEST
// ============================================================
export async function resetPassword(email) {
  if (!email) {
    throw new Error("Email address is required.");
  }

  const { error } =
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

  if (error) {
    throw new Error(error.message);
  }
}

// ============================================================
// LOGOUT
// ============================================================
export async function logout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

// ============================================================
// GET CURRENT SESSION
// ============================================================
export async function getSession() {
  const { data, error } =
    await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  return data.session;
}

// ============================================================
// AUTH STATE SUBSCRIPTION
// ============================================================
export function subscribeToAuthChanges(callback) {
  return supabase.auth.onAuthStateChange(
    (_event, session) => {
      callback(session);
    },
  );
}