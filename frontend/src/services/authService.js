import { supabase } from "./supabaseClient";

export async function login(email, password) {
  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  return data.session;
}

export function subscribeToAuthChanges(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}