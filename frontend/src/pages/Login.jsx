import { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";

import {
  resetPassword,
  signInWithGoogle,
  signUp,
} from "../services/authService";

export default function Login({
  onLogin,
  onGoogleLogin,
  onResetPassword,
}) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function clearFeedback() {
    setError("");
    setMessage("");
  }

  function switchMode(nextMode) {
    clearFeedback();
    setMode(nextMode);
    setPassword("");
    setConfirmPassword("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    clearFeedback();

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        await signUp(email.trim(), password);
      } else {
        await onLogin(email.trim(), password);
      }
    } catch (submitError) {
      console.error(
        "Authentication request failed:",
        submitError,
      );

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to complete authentication. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    clearFeedback();
    setLoading(true);

    try {
      if (onGoogleLogin) {
        await onGoogleLogin();
      } else {
        await signInWithGoogle();
      }
    } catch (googleError) {
      console.error(
        "Google authentication failed:",
        googleError,
      );

      setError(
        googleError instanceof Error
          ? googleError.message
          : "Unable to continue with Google. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordReset() {
    clearFeedback();

    if (!email.trim()) {
      setError(
        "Enter your email address first so we can send you a password reset link.",
      );
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email.trim());

      setMessage(
        "Password reset instructions have been sent to your email address.",
      );
    } catch (resetError) {
      console.error(
        "Password reset request failed:",
        resetError,
      );

      setError(
        resetError instanceof Error
          ? resetError.message
          : "Unable to send the password reset email. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleResetPage() {
    clearFeedback();

    if (onResetPassword) {
      onResetPassword();
    } else {
      window.location.assign("/reset-password");
    }
  }

  const isSignup = mode === "signup";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center">
          <img
            src="/lamese-logo.svg"
            alt="LAMESE AI"
            className="mx-auto h-16 w-auto"
          />

          <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
            {isSignup
              ? "Create your account"
              : "Welcome to LAMESE AI"}
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {isSignup
              ? "Create an account to use the heart disease prediction system."
              : "Sign in to access the heart disease prediction system."}
          </p>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

              <p className="text-sm leading-5 text-red-700">
                {error}
              </p>
            </div>
          )}

          {message && (
            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <p className="text-sm leading-5 text-emerald-700">
                {message}
              </p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>

              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                {!isSignup && (
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    disabled={loading}
                    className="text-xs font-medium text-slate-600 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Forgot password?
                  </button>
                )}
              </div>

              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    isSignup
                      ? "new-password"
                      : "current-password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50"
                  placeholder="Enter your password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  disabled={loading}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {isSignup && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value,
                      )
                    }
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50"
                    placeholder="Confirm your password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (current) => !current,
                      )
                    }
                    disabled={loading}
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? isSignup
                  ? "Creating account..."
                  : "Signing in..."
                : isSignup
                  ? "Create account"
                  : "Sign in"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              or
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5"
            >
              <path
                fill="#4285F4"
                d="M21.35 12.27c0-.79-.07-1.55-.23-2.27H12v4.3h5.23a4.47 4.47 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.92-4.18 2.92-7.42Z"
              />
              <path
                fill="#34A853"
                d="M12 21.99c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.99Z"
              />
              <path
                fill="#FBBC05"
                d="M6.54 14.08A5.86 5.86 0 0 1 6.23 12c0-.72.12-1.42.31-2.08V7.39H3.3A10 10 0 0 0 2 12c0 1.66.4 3.23 1.3 4.61l3.24-2.53Z"
              />
              <path
                fill="#EA4335"
                d="M12 5.89c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 2.94 14.63 2 12 2a9.74 9.74 0 0 0-8.7 5.39l3.24 2.53C7.31 7.61 9.46 5.89 12 5.89Z"
              />
            </svg>

            Continue with Google
          </button>

          <div className="mt-6 text-center">
            {isSignup ? (
              <p className="text-sm text-slate-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  disabled={loading}
                  className="font-semibold text-slate-900 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p className="text-sm text-slate-600">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  disabled={loading}
                  className="font-semibold text-slate-900 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Create one
                </button>
              </p>
            )}

            {onResetPassword && (
              <button
                type="button"
                onClick={handleResetPage}
                disabled={loading}
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Password reset page
              </button>
            )}
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-center text-xs leading-5 text-slate-600">
              Your account is securely authenticated through
              Firebase Authentication.
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Lamese-AI · Heart Disease Prediction System
        </p>
      </div>
    </div>
  );
}