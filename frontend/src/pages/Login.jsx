import { useState } from "react";
import {
  HeartPulse,
  Loader2,
  LockKeyhole,
  LogIn,
  Mail,
  ShieldCheck,
  User,
  UserPlus,
} from "lucide-react";

import {
  resetPassword,
  signUp,
} from "../services/authService";

export default function Login({
  onLogin,
  onGoogleLogin,
}) {
  const [mode, setMode] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] =
    useState(false);
  const [isResetSubmitting, setIsResetSubmitting] =
    useState(false);

  const isSignUp = mode === "signup";

  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
    setSuccess("");
    setPassword("");
    setConfirmPassword("");
  }

  function handleEmailChange(event) {
    setEmail(event.target.value);
    setError("");
    setSuccess("");
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
    setError("");
    setSuccess("");
  }

  function handleConfirmPasswordChange(event) {
    setConfirmPassword(event.target.value);
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      setError(
        "Please enter your email and password.",
      );
      return;
    }

    if (isSignUp) {
      await handleSignUp(
        normalizedEmail,
        password,
        confirmPassword,
      );

      return;
    }

    try {
      setIsSubmitting(true);

      await onLogin(normalizedEmail, password);
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Unable to sign in. Please check your credentials and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignUp(
    normalizedEmail,
    signupPassword,
    signupConfirmPassword,
  ) {
    if (signupPassword.length < 8) {
      setError(
        "Password must be at least 8 characters long.",
      );
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);

      const data = await signUp(
        normalizedEmail,
        signupPassword,
      );

      if (data.session) {
        setSuccess(
          "Account created successfully. Signing you in...",
        );
        return;
      }

      setSuccess(
        "Account created successfully. Please check your email to confirm your account before signing in.",
      );

      setPassword("");
      setConfirmPassword("");
    } catch (signupError) {
      setError(
        signupError instanceof Error
          ? signupError.message
          : "Unable to create your account. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSubmit() {
    setError("");
    setSuccess("");

    try {
      setIsGoogleSubmitting(true);

      await onGoogleLogin();
    } catch (googleError) {
      setError(
        googleError instanceof Error
          ? googleError.message
          : "Unable to continue with Google. Please try again.",
      );

      setIsGoogleSubmitting(false);
    }
  }

  async function handleForgotPassword() {
    setError("");
    setSuccess("");

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setError(
        "Please enter your email address first.",
      );
      return;
    }

    try {
      setIsResetSubmitting(true);

      await resetPassword(normalizedEmail);

      setSuccess(
        "If an account exists for this email address, a password reset link has been sent. Please check your inbox.",
      );
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : "Unable to send the password reset email. Please try again.",
      );
    } finally {
      setIsResetSubmitting(false);
    }
  }

  const isBusy =
    isSubmitting ||
    isGoogleSubmitting ||
    isResetSubmitting;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 sm:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.08),transparent_40%)]" />

      <div className="relative w-full max-w-md">
        {/* ======================================================
            BRANDING
        ====================================================== */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
            <HeartPulse
              size={34}
              strokeWidth={1.8}
            />
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
            Welcome to LAMESE AI
          </h1>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            {isSignUp
              ? "Create an account to access the heart disease prediction system."
              : "Sign in to access the heart disease prediction system."}
          </p>
        </div>

        {/* ======================================================
            AUTHENTICATION CARD
        ====================================================== */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
          {/* ====================================================
              MODE HEADER
          ==================================================== */}
          <div className="mb-7">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-info-surface px-3 py-1.5 text-xs font-semibold text-info-text-muted">
              <ShieldCheck size={14} />
              Secure access
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              {isSignUp
                ? "Create your account"
                : "Sign in"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isSignUp
                ? "Enter your details to create your LAMESE AI account."
                : "Enter your account details to continue."}
            </p>
          </div>

          {/* ====================================================
              ERROR
          ==================================================== */}
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />

              <span>{error}</span>
            </div>
          )}

          {/* ====================================================
              SUCCESS
          ==================================================== */}
          {success && (
            <div
              role="status"
              aria-live="polite"
              className="mb-5 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
            >
              <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />

              <span>{success}</span>
            </div>
          )}

          {/* ====================================================
              EMAIL / PASSWORD FORM
          ==================================================== */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Email */}
            <div>
              <label
                htmlFor="auth-email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email address
              </label>

              <div className="relative">
                <User
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />

                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="you@example.com"
                  disabled={isBusy}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-primary-focus focus:ring-4 focus:ring-primary-focus/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="auth-password"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                {!isSignUp && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isBusy}
                    className="text-xs font-semibold text-primary transition hover:text-primary-hover focus:outline-none focus:underline disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isResetSubmitting
                      ? "Sending..."
                      : "Forgot password?"}
                  </button>
                )}
              </div>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />

                <input
                  id="auth-password"
                  name="password"
                  type="password"
                  autoComplete={
                    isSignUp
                      ? "new-password"
                      : "current-password"
                  }
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder={
                    isSignUp
                      ? "At least 8 characters"
                      : "Enter your password"
                  }
                  disabled={isBusy}
                  required
                  minLength={isSignUp ? 8 : undefined}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-primary-focus focus:ring-4 focus:ring-primary-focus/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>

              {isSignUp && (
                <p className="mt-2 text-xs text-slate-400">
                  Password must contain at least 8
                  characters.
                </p>
              )}
            </div>

            {/* Confirm Password */}
            {isSignUp && (
              <div>
                <label
                  htmlFor="auth-confirm-password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />

                  <input
                    id="auth-confirm-password"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={
                      handleConfirmPasswordChange
                    }
                    placeholder="Re-enter your password"
                    disabled={isBusy}
                    required
                    minLength={8}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-primary-focus focus:ring-4 focus:ring-primary-focus/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isBusy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-primary-focus/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                    aria-hidden="true"
                  />

                  {isSignUp
                    ? "Creating account..."
                    : "Signing in..."}
                </>
              ) : (
                <>
                  {isSignUp ? (
                    <UserPlus
                      size={18}
                      aria-hidden="true"
                    />
                  ) : (
                    <LogIn
                      size={18}
                      aria-hidden="true"
                    />
                  )}

                  {isSignUp
                    ? "Create account"
                    : "Sign in"}
                </>
              )}
            </button>
          </form>

          {/* ====================================================
              MODE SWITCH
          ==================================================== */}
          <div className="mt-5 text-center text-sm">
            <span className="text-slate-500">
              {isSignUp
                ? "Already have an account?"
                : "Don't have an account?"}
            </span>{" "}
            <button
              type="button"
              onClick={() =>
                switchMode(
                  isSignUp ? "login" : "signup",
                )
              }
              disabled={isBusy}
              className="font-semibold text-primary transition hover:text-primary-hover focus:outline-none focus:underline disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSignUp
                ? "Sign in"
                : "Create account"}
            </button>
          </div>

          {/* ====================================================
              SOCIAL AUTH
          ==================================================== */}
          {!isSignUp && (
            <>
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />

                <span className="text-xs font-medium text-slate-400">
                  OR
                </span>

                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <div>
                {/* Google */}
                <button
                  type="button"
                  onClick={handleGoogleSubmit}
                  disabled={isBusy}
                  className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-primary-focus/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isGoogleSubmitting ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                        aria-hidden="true"
                      />

                      Connecting to Google...
                    </>
                  ) : (
                    <>
                      <GoogleIcon />

                      Continue with Google
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {/* ====================================================
              SECURITY NOTICE
          ==================================================== */}
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <ShieldCheck
              size={18}
              className="mt-0.5 shrink-0 text-primary"
              aria-hidden="true"
            />

            <p className="text-xs leading-5 text-slate-500">
              Your account is securely authenticated
              through Supabase Authentication.
            </p>
          </div>
        </div>

        {/* ======================================================
            FOOTER
        ====================================================== */}
        <p className="mt-6 text-center text-xs text-slate-400">
          LAMESE AI · Heart Disease Prediction System
        </p>
      </div>
    </main>
  );
}

// ============================================================
// GOOGLE ICON
// ============================================================
function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.23c0-.79-.07-1.55-.22-2.27H12v4.3h5.23a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.69 2.92-4.18 2.92-7.39Z"
      />

      <path
        fill="#34A853"
        d="M12 21.65c2.63 0 4.84-.87 6.45-2.36l-3.14-2.43c-.87.58-1.98.93-3.31.93-2.54 0-4.69-1.72-5.46-4.03H3.3v2.51A9.74 9.74 0 0 0 12 21.65Z"
      />

      <path
        fill="#FBBC05"
        d="M6.54 13.76A5.85 5.85 0 0 1 6.23 12c0-.61.11-1.2.31-1.76V7.73H3.3A9.74 9.74 0 0 0 2.27 12c0 1.57.38 3.06 1.03 4.27l3.24-2.51Z"
      />

      <path
        fill="#EA4335"
        d="M12 6.21c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.83 3.32 14.63 2.35 12 2.35a9.74 9.74 0 0 0-8.7 5.38l3.24 2.51C7.31 7.93 9.46 6.21 12 6.21Z"
      />
    </svg>
  );
}