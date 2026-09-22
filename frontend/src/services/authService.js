import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
} from "firebase/auth";

import { firebaseAuth } from "./firebaseClient";

const googleProvider = new GoogleAuthProvider();

// ============================================================
// SESSION HELPERS
// ============================================================

function createSession(user) {
  if (!user) {
    return null;
  }

  return {
    user,
  };
}

// ============================================================
// EMAIL / PASSWORD LOGIN
// ============================================================
export async function login(email, password) {
  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  try {
    await setPersistence(
      firebaseAuth,
      browserLocalPersistence,
    );

    const credential =
      await signInWithEmailAndPassword(
        firebaseAuth,
        email,
        password,
      );

    return {
      session: createSession(credential.user),
      user: credential.user,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Unable to sign in. Please check your credentials and try again.",
      { cause: error },
    );
  }
}

// ============================================================
// EMAIL / PASSWORD SIGN UP
// ============================================================
export async function signUp(email, password) {
  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  try {
    await setPersistence(
      firebaseAuth,
      browserLocalPersistence,
    );

    const credential =
      await createUserWithEmailAndPassword(
        firebaseAuth,
        email,
        password,
      );

    return {
      session: createSession(credential.user),
      user: credential.user,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Unable to create your account. Please try again.",
      { cause: error },
    );
  }
}

// ============================================================
// GOOGLE AUTH
// ============================================================
export async function signInWithGoogle() {
  try {
    await setPersistence(
      firebaseAuth,
      browserLocalPersistence,
    );

    const credential = await signInWithPopup(
      firebaseAuth,
      googleProvider,
    );

    return {
      session: createSession(credential.user),
      user: credential.user,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Unable to continue with Google. Please try again.",
      { cause: error },
    );
  }
}

// ============================================================
// PASSWORD RESET REQUEST
// ============================================================
export async function resetPassword(email) {
  if (!email) {
    throw new Error("Email address is required.");
  }

  try {
    await sendPasswordResetEmail(
      firebaseAuth,
      email,
      {
        url: `${window.location.origin}/reset-password`,
        handleCodeInApp: true,
      },
    );
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Unable to send the password reset email. Please try again.",
      { cause: error },
    );
  }
}

// ============================================================
// LOGOUT
// ============================================================
export async function logout() {
  try {
    await signOut(firebaseAuth);
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Unable to sign out. Please try again.",
      { cause: error },
    );
  }
}

// ============================================================
// GET CURRENT SESSION
// ============================================================
export async function getSession() {
  return createSession(firebaseAuth.currentUser);
}

// ============================================================
// AUTH STATE SUBSCRIPTION
// ============================================================
export function subscribeToAuthChanges(callback) {
  const unsubscribe = onAuthStateChanged(
    firebaseAuth,
    (user) => {
      callback(createSession(user));
    },
  );

  return {
    data: {
      subscription: {
        unsubscribe,
      },
    },
  };
}

// ============================================================
// UPDATE PASSWORD
// ============================================================
export async function updateUserPassword(password) {
  if (!password) {
    throw new Error("Password is required.");
  }

  const user = firebaseAuth.currentUser;

  if (!user) {
    throw new Error(
      "Your session has expired. Please sign in again.",
    );
  }

  try {
    await updatePassword(user, password);
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Unable to update your password. Please try again.",
      { cause: error },
    );
  }
}

// ============================================================
// GET CURRENT USER ID TOKEN
// ============================================================
export async function getAccessToken() {
  const user = firebaseAuth.currentUser;

  if (!user) {
    throw new Error(
      "Your session has expired. Please sign in again.",
    );
  }

  try {
    return await user.getIdToken();
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Unable to retrieve the authentication token.",
      { cause: error },
    );
  }
}