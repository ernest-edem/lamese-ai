import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  HeartPulse,
  Loader2,
  LockKeyhole,
  LogIn,
  LogOut,
  ShieldCheck,
  User,
} from "lucide-react";

import PatientInput from "./pages/PatientInput";
import ExplainabilityDashboard from "./pages/ExplainabilityDashboard";

import { useAuth } from "./context/AuthContext";
import { checkApiHealth } from "./services/healthService";

const PAGES = {
  SPLASH: "splash",
  LOGIN: "login",
  PATIENT_INPUT: "patient-input",
  DASHBOARD: "dashboard",
};

const SPLASH_DURATION = 1800;

export default function App() {
  const {
    user,
    isAuthenticated,
    loading: authLoading,
    signIn,
    signOut,
  } = useAuth();

  const [currentPage, setCurrentPage] = useState(PAGES.SPLASH);
  const [result, setResult] = useState(null);
  const [apiStatus, setApiStatus] = useState("checking");

  useEffect(() => {
    let mounted = true;

    async function checkHealth() {
      try {
        await checkApiHealth();

        if (mounted) {
          setApiStatus("available");
        }
      } catch {
        if (mounted) {
          setApiStatus("unavailable");
        }
      }
    }

    checkHealth();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (authLoading) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      if (isAuthenticated) {
        setCurrentPage(PAGES.PATIENT_INPUT);
      } else {
        setCurrentPage(PAGES.LOGIN);
      }
    }, SPLASH_DURATION);

    return () => {
      window.clearTimeout(timer);
    };
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setResult(null);

      setCurrentPage((page) => {
        if (
          page === PAGES.SPLASH ||
          page === PAGES.LOGIN
        ) {
          return page;
        }

        return PAGES.LOGIN;
      });
    }
  }, [isAuthenticated]);

  async function handleLogin(email, password) {
    await signIn(email, password);

    setResult(null);
    setCurrentPage(PAGES.PATIENT_INPUT);
  }

  async function handleLogout() {
    try {
      await signOut();
    } finally {
      setResult(null);
      setCurrentPage(PAGES.LOGIN);
    }
  }

  function handlePredictionComplete(predictionResult) {
    setResult(predictionResult);
    setCurrentPage(PAGES.DASHBOARD);
  }

  function handleNewAssessment() {
    setResult(null);
    setCurrentPage(PAGES.PATIENT_INPUT);
  }

  function handleNavigation(page) {
    if (!isAuthenticated) {
      setCurrentPage(PAGES.LOGIN);
      return;
    }

    if (page === PAGES.DASHBOARD && !result) {
      return;
    }

    setCurrentPage(page);
  }

  if (currentPage === PAGES.SPLASH || authLoading) {
    return <SplashScreen />;
  }

  if (!isAuthenticated || currentPage === PAGES.LOGIN) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header
        currentPage={currentPage}
        apiStatus={apiStatus}
        hasResult={Boolean(result)}
        userEmail={user?.email}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
      />

      {currentPage === PAGES.PATIENT_INPUT && (
        <PatientInput
          apiStatus={apiStatus}
          onPredictionComplete={handlePredictionComplete}
        />
      )}

      {currentPage === PAGES.DASHBOARD && (
        <ExplainabilityDashboard
          result={result}
          onBack={handleNewAssessment}
        />
      )}
    </div>
  );
}

function SplashScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-600 text-white shadow-2xl shadow-blue-950/40">
          <HeartPulse size={42} strokeWidth={1.8} />
        </div>

        <h1 className="mt-7 text-4xl font-bold tracking-tight text-white">
          LAMESE AI
        </h1>

        <p className="mt-3 text-sm font-medium tracking-wide text-slate-400">
          Heart Disease Prediction System
        </p>

        <div className="mx-auto mt-10 flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
          <Loader2
            size={15}
            className="animate-spin text-blue-500"
          />
          Initializing system
        </div>

        <div className="mx-auto mt-5 h-1 w-48 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full w-full origin-left animate-[pulse_1.8s_ease-in-out] rounded-full bg-blue-600" />
        </div>
      </div>
    </main>
  );
}

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password.trim()) {
      setError("Please enter your email and password.");
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

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 sm:px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <HeartPulse size={34} strokeWidth={1.8} />
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
            Welcome to LAMESE AI
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Sign in to access the heart disease prediction system.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-7">
            <h2 className="text-xl font-bold text-slate-900">
              Sign in
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter your account details to continue.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email address
              </label>

              <div className="relative">
                <User
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                  placeholder="you@example.com"
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign in
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-start gap-3 rounded-xl bg-slate-50 p-4">
            <ShieldCheck
              size={18}
              className="mt-0.5 shrink-0 text-blue-600"
            />

            <p className="text-xs leading-5 text-slate-500">
              Your account is securely authenticated through
              Supabase Authentication.
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          LAMESE AI · Heart Disease Prediction System
        </p>
      </div>
    </main>
  );
}

function Header({
  currentPage,
  apiStatus,
  hasResult,
  userEmail,
  onNavigate,
  onLogout,
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-[73px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => onNavigate(PAGES.PATIENT_INPUT)}
          className="flex shrink-0 items-center gap-3 text-left"
          aria-label="Go to patient assessment"
        >
          <div className="rounded-xl bg-blue-600 p-2 text-white shadow-sm">
            <HeartPulse size={22} />
          </div>

          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900">
              LAMESE AI
            </h1>

            <p className="hidden text-xs text-slate-500 sm:block">
              Heart Disease Prediction System
            </p>
          </div>
        </button>

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Main navigation"
        >
          <NavigationButton
            active={currentPage === PAGES.PATIENT_INPUT}
            onClick={() => onNavigate(PAGES.PATIENT_INPUT)}
            icon={<Activity size={16} />}
          >
            Patient Assessment
          </NavigationButton>

          <NavigationButton
            active={currentPage === PAGES.DASHBOARD}
            disabled={!hasResult}
            onClick={() => onNavigate(PAGES.DASHBOARD)}
            icon={<BarChart3 size={16} />}
          >
            Results Dashboard
          </NavigationButton>
        </nav>

        <div className="flex items-center gap-2">
          <ApiStatus status={apiStatus} />

          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 lg:flex">
            <User size={14} />

            <span className="max-w-32 truncate">
              {userEmail}
            </span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={15} />

            <span className="hidden sm:inline">
              Sign out
            </span>
          </button>
        </div>
      </div>

      <div className="border-t border-slate-100 px-4 py-2 md:hidden">
        <nav
          className="flex gap-1"
          aria-label="Mobile navigation"
        >
          <MobileNavigationButton
            active={currentPage === PAGES.PATIENT_INPUT}
            onClick={() => onNavigate(PAGES.PATIENT_INPUT)}
            icon={<Activity size={15} />}
          >
            Assessment
          </MobileNavigationButton>

          <MobileNavigationButton
            active={currentPage === PAGES.DASHBOARD}
            disabled={!hasResult}
            onClick={() => onNavigate(PAGES.DASHBOARD)}
            icon={<BarChart3 size={15} />}
          >
            Results
          </MobileNavigationButton>
        </nav>
      </div>
    </header>
  );
}

function NavigationButton({
  active,
  disabled,
  onClick,
  icon,
  children,
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition",
        active
          ? "bg-blue-50 text-blue-700"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
        disabled
          ? "cursor-not-allowed opacity-40 hover:bg-transparent hover:text-slate-500"
          : "",
      ].join(" ")}
    >
      {icon}
      {children}
    </button>
  );
}

function MobileNavigationButton({
  active,
  disabled,
  onClick,
  icon,
  children,
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition",
        active
          ? "bg-blue-50 text-blue-700"
          : "text-slate-500 hover:bg-slate-50",
        disabled
          ? "cursor-not-allowed opacity-40"
          : "",
      ].join(" ")}
    >
      {icon}
      {children}
    </button>
  );
}

function ApiStatus({ status }) {
  if (status === "checking") {
    return (
      <div className="flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
        <Loader2 size={14} className="animate-spin" />

        <span className="hidden lg:inline">
          Checking prediction API
        </span>

        <span className="lg:hidden">
          Checking API
        </span>
      </div>
    );
  }

  if (status === "available") {
    return (
      <div className="flex shrink-0 items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
        <ShieldCheck size={14} />

        <span className="hidden lg:inline">
          Prediction API available
        </span>

        <span className="lg:hidden">
          API available
        </span>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
      <span className="h-2 w-2 rounded-full bg-red-500" />

      <span className="hidden lg:inline">
        Prediction API unavailable
      </span>

      <span className="lg:hidden">
        API unavailable
      </span>
    </div>
  );
}