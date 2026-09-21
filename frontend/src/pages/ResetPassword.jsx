import { useEffect, useState } from "react";
import {
  confirmPasswordReset,
  signOut,
  verifyPasswordResetCode,
} from "firebase/auth";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import { firebaseAuth } from "../services/firebaseClient";

export default function ResetPassword({ onComplete, onBackToLogin }) {
  const [oobCode, setOobCode] = useState("");
  const [checkingCode, setCheckingCode] = useState(true);
  const [codeValid, setCodeValid] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function verifyResetCode() {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get("mode");
      const actionCode = params.get("oobCode");

      if (mode !== "resetPassword" || !actionCode) {
        setError(
          "This password reset link is invalid or incomplete. Please request a new password reset email.",
        );
        setCheckingCode(false);
        return;
      }

      setOobCode(actionCode);

      try {
        const userEmail = await verifyPasswordResetCode(
          firebaseAuth,
          actionCode,
        );

        setEmail(userEmail);
        setCodeValid(true);
      } catch (verificationError) {
        console.error(
          "Failed to verify password reset code:",
          verificationError,
        );

        setError(
          "This password reset link has expired or is no longer valid. Please request a new password reset email.",
        );
      } finally {
        setCheckingCode(false);
      }
    }

    verifyResetCode();
  }, []);

  function validatePassword() {
    if (!password || !confirmPassword) {
      return "Please enter and confirm your new password.";
    }

    if (password.length < 6) {
      return "Your password must contain at least 6 characters.";
    }

    if (password !== confirmPassword) {
      return "The passwords do not match.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const validationError = validatePassword();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!oobCode || !codeValid) {
      setError(
        "This password reset link is no longer valid. Please request a new password reset email.",
      );
      return;
    }

    setSubmitting(true);

    try {
      await confirmPasswordReset(
        firebaseAuth,
        oobCode,
        password,
      );

      try {
        await signOut(firebaseAuth);
      } catch (signOutError) {
        console.error(
          "Failed to clear the current authentication session:",
          signOutError,
        );
      }

      setSuccess(true);

      window.setTimeout(() => {
        if (onComplete) {
          onComplete();
        } else if (onBackToLogin) {
          onBackToLogin();
        }
      }, 1500);
    } catch (resetError) {
      console.error(
        "Failed to reset password:",
        resetError,
      );

      if (resetError?.code === "auth/expired-action-code") {
        setError(
          "This password reset link has expired. Please request a new password reset email.",
        );
      } else if (
        resetError?.code === "auth/invalid-action-code"
      ) {
        setError(
          "This password reset link is invalid or has already been used. Please request a new password reset email.",
        );
      } else if (
        resetError?.code === "auth/weak-password"
      ) {
        setError(
          "Your password is too weak. Please choose a stronger password.",
        );
      } else {
        setError(
          "Unable to reset your password. Please try again.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (checkingCode) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center">
            <img
              src="/lamese-logo.svg"
              alt="LAMESE AI"
              className="mx-auto h-16 w-auto"
            />

            <div className="mt-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <LockKeyhole className="h-6 w-6 text-slate-600" />
              </div>

              <h1 className="mt-5 text-xl font-semibold text-slate-900">
                Verifying reset link
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Please wait while we verify your password reset
                link.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center">
            <img
              src="/lamese-logo.svg"
              alt="LAMESE AI"
              className="mx-auto h-16 w-auto"
            />

            <div className="mt-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              </div>

              <h1 className="mt-5 text-xl font-semibold text-slate-900">
                Password updated
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Your password has been changed successfully.
                Redirecting you to the login page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            Reset your password
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Create a new password for your LAMESE AI account.
          </p>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          {email && (
            <div className="mb-6 rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Account
              </p>
              <p className="mt-1 truncate text-sm font-medium text-slate-800">
                {email}
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

              <p className="text-sm leading-5 text-red-700">
                {error}
              </p>
            </div>
          )}

          {codeValid ? (
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  New password
                </label>

                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    disabled={submitting}
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50"
                    placeholder="Enter your new password"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Confirm new password
                </label>

                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    disabled={submitting}
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50"
                    placeholder="Confirm your new password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Updating password..."
                  : "Update password"}
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={onBackToLogin}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to login
            </button>
          )}

          <div className="mt-6 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-slate-600" />

            <p className="text-xs leading-5 text-slate-600">
              Your password is securely handled through Firebase
              Authentication. Never share your password with
              anyone.
            </p>
          </div>

          {onBackToLogin && (
            <button
              type="button"
              onClick={onBackToLogin}
              disabled={submitting}
              className="mt-5 flex w-full items-center justify-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </button>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Lamese-AI · Heart Disease Prediction System
        </p>
      </div>
    </div>
  );
}