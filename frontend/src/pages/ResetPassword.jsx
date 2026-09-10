import { useEffect, useState } from "react";
import {
  CheckCircle2,
  HeartPulse,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import { supabase } from "../services/supabaseClient";

export default function ResetPassword({
  onComplete,
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function initializeRecoverySession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) {
          return;
        }

        if (!session) {
          setError(
            "This password reset link is invalid or has expired. Please request a new password reset link.",
          );
          setIsReady(false);
          return;
        }

        setIsReady(true);
      } catch (sessionError) {
        if (!mounted) {
          return;
        }

        setError(
          sessionError instanceof Error
            ? sessionError.message
            : "Unable to verify the password reset session.",
        );
      }
    }

    initializeRecoverySession();

    return () => {
      mounted = false;
    };
  }, []);

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

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters long.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);

      const { error: updateError } =
        await supabase.auth.updateUser({
          password,
        });

      if (updateError) {
        throw new Error(updateError.message);
      }

      setPassword("");
      setConfirmPassword("");

      setSuccess(
        "Your password has been updated successfully. You can now sign in with your new password.",
      );

      await supabase.auth.signOut();

      if (onComplete) {
        setTimeout(() => {
          onComplete();
        }, 1500);
      }
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update your password. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

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
            LAMESE AI
          </h1>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Securely update your account password.
          </p>
        </div>

        {/* ======================================================
            RESET CARD
        ====================================================== */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
          <div className="mb-7">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-info-surface px-3 py-1.5 text-xs font-semibold text-info-text-muted">
              <ShieldCheck size={14} />
              Secure password reset
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              Set a new password
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Choose a new password for your LAMESE AI
              account.
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
              <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />

              <span>{success}</span>
            </div>
          )}

          {isReady ? (
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* New Password */}
              <div>
                <label
                  htmlFor="reset-password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  New password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />

                  <input
                    id="reset-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="At least 8 characters"
                    disabled={isSubmitting}
                    required
                    minLength={8}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-primary-focus focus:ring-4 focus:ring-primary-focus/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Password must contain at least 8
                  characters.
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="reset-confirm-password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Confirm new password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />

                  <input
                    id="reset-confirm-password"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={
                      handleConfirmPasswordChange
                    }
                    placeholder="Re-enter your new password"
                    disabled={isSubmitting}
                    required
                    minLength={8}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-primary-focus focus:ring-4 focus:ring-primary-focus/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={
                  isSubmitting || Boolean(success)
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-primary-focus/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                      aria-hidden="true"
                    />

                    Updating password...
                  </>
                ) : (
                  <>
                    <CheckCircle2
                      size={18}
                      aria-hidden="true"
                    />

                    Update password
                  </>
                )}
              </button>
            </form>
          ) : (
            !success && (
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-500">
                Please request a new password reset link
                from the LAMESE AI sign-in page.
              </div>
            )
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
              Your password is securely managed through
              Supabase Authentication.
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
