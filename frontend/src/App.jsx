import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  HeartPulse,
  Loader2,
  LogOut,
  WifiOff,
} from "lucide-react";

import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import PatientInput from "./pages/PatientInput";
import ExplainabilityDashboard from "./pages/ExplainabilityDashboard";

import { useAuth } from "./context/AuthContext";
import { checkApiHealth } from "./services/healthService";
import { signInWithGoogle } from "./services/authService";

const PAGES = {
  SPLASH: "splash",
  LOGIN: "login",
  PATIENT_INPUT: "patient-input",
  DASHBOARD: "dashboard",
  RESET_PASSWORD: "reset-password",
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

  const [currentPage, setCurrentPage] = useState(
    PAGES.SPLASH,
  );
  const [result, setResult] = useState(null);
  const [apiStatus, setApiStatus] = useState("checking");

  const isPasswordResetRoute =
    window.location.pathname === "/reset-password";

  // ==========================================================
  // API HEALTH CHECK
  // ==========================================================
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

  // ==========================================================
  // PASSWORD RESET ROUTING
  // ==========================================================
  useEffect(() => {
    if (isPasswordResetRoute) {
      setCurrentPage(PAGES.RESET_PASSWORD);
    }
  }, [isPasswordResetRoute]);

  // ==========================================================
  // SPLASH / INITIAL AUTH ROUTING
  // ==========================================================
  useEffect(() => {
    if (authLoading || isPasswordResetRoute) {
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
  }, [
    authLoading,
    isAuthenticated,
    isPasswordResetRoute,
  ]);

  // ==========================================================
  // AUTHENTICATION STATE GUARD
  // ==========================================================
  useEffect(() => {
    if (isPasswordResetRoute) {
      return;
    }

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
  }, [isAuthenticated, isPasswordResetRoute]);

  // ==========================================================
  // EMAIL / PASSWORD LOGIN
  // ==========================================================
  async function handleLogin(email, password) {
    await signIn(email, password);

    setResult(null);
    setCurrentPage(PAGES.PATIENT_INPUT);
  }

  // ==========================================================
  // GOOGLE LOGIN
  // ==========================================================
  async function handleGoogleLogin() {
    await signInWithGoogle();
  }

  // ==========================================================
  // LOGOUT
  // ==========================================================
  async function handleLogout() {
    try {
      await signOut();
    } finally {
      setResult(null);
      setCurrentPage(PAGES.LOGIN);
    }
  }

  // ==========================================================
  // PASSWORD RESET COMPLETE
  // ==========================================================
  function handlePasswordResetComplete() {
    window.history.replaceState(
      {},
      document.title,
      "/",
    );

    setResult(null);
    setCurrentPage(PAGES.LOGIN);
  }

  // ==========================================================
  // PREDICTION COMPLETE
  // ==========================================================
  function handlePredictionComplete(
    predictionResult,
  ) {
    setResult(predictionResult);
    setCurrentPage(PAGES.DASHBOARD);
  }

  // ==========================================================
  // NEW ASSESSMENT
  // ==========================================================
  function handleNewAssessment() {
    setResult(null);
    setCurrentPage(PAGES.PATIENT_INPUT);
  }

  // ==========================================================
  // APPLICATION NAVIGATION
  // ==========================================================
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

  // ==========================================================
  // PASSWORD RESET
  // ==========================================================
  if (
    isPasswordResetRoute ||
    currentPage === PAGES.RESET_PASSWORD
  ) {
    return (
      <ResetPassword
        onComplete={handlePasswordResetComplete}
      />
    );
  }

  // ==========================================================
  // SPLASH SCREEN
  // ==========================================================
  if (
    currentPage === PAGES.SPLASH ||
    authLoading
  ) {
    return <SplashScreen />;
  }

  // ==========================================================
  // LOGIN
  // ==========================================================
  if (
    !isAuthenticated ||
    currentPage === PAGES.LOGIN
  ) {
    return (
      <Login
        onLogin={handleLogin}
        onGoogleLogin={handleGoogleLogin}
      />
    );
  }

  // ==========================================================
  // AUTHENTICATED APPLICATION
  // ==========================================================
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
          onPredictionComplete={
            handlePredictionComplete
          }
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

// ============================================================
// SPLASH SCREEN
// ============================================================
function SplashScreen() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.16),transparent_45%)]" />

      <div className="relative w-full max-w-md text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-600 text-white shadow-2xl shadow-blue-950/50">
          <HeartPulse
            size={42}
            strokeWidth={1.8}
          />
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

        <p className="mt-8 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-600">
          Explainable AI
        </p>
      </div>
    </main>
  );
}

// ============================================================
// HEADER
// ============================================================
function Header({
  currentPage,
  apiStatus,
  hasResult,
  userEmail,
  onNavigate,
  onLogout,
}) {
  const userInitial =
    userEmail?.charAt(0)?.toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() =>
            onNavigate(PAGES.PATIENT_INPUT)
          }
          className="flex min-w-0 shrink-0 items-center gap-3 rounded-xl text-left outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20"
          aria-label="Go to patient assessment"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <HeartPulse size={22} />
          </div>

          <div className="min-w-0">
            <h1 className="text-base font-bold tracking-tight text-slate-900">
              LAMESE AI
            </h1>

            <p className="hidden truncate text-xs text-slate-500 sm:block">
              Heart Disease Prediction System
            </p>
          </div>
        </button>

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Main navigation"
        >
          <NavigationButton
            active={
              currentPage === PAGES.PATIENT_INPUT
            }
            onClick={() =>
              onNavigate(PAGES.PATIENT_INPUT)
            }
            icon={<Activity size={16} />}
          >
            Patient Assessment
          </NavigationButton>

          <NavigationButton
            active={
              currentPage === PAGES.DASHBOARD
            }
            disabled={!hasResult}
            onClick={() =>
              onNavigate(PAGES.DASHBOARD)
            }
            icon={<BarChart3 size={16} />}
          >
            Results Dashboard
          </NavigationButton>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <ApiStatus status={apiStatus} />

          <div
            className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-1.5 pr-3 lg:flex"
            title={
              userEmail || "Authenticated user"
            }
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
              {userInitial}
            </span>

            <span className="max-w-32 truncate text-xs font-semibold text-slate-600">
              {userEmail}
            </span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
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
          className="mx-auto flex max-w-7xl gap-1"
          aria-label="Mobile navigation"
        >
          <MobileNavigationButton
            active={
              currentPage === PAGES.PATIENT_INPUT
            }
            onClick={() =>
              onNavigate(PAGES.PATIENT_INPUT)
            }
            icon={<Activity size={15} />}
          >
            Assessment
          </MobileNavigationButton>

          <MobileNavigationButton
            active={
              currentPage === PAGES.DASHBOARD
            }
            disabled={!hasResult}
            onClick={() =>
              onNavigate(PAGES.DASHBOARD)
            }
            icon={<BarChart3 size={15} />}
          >
            Results
          </MobileNavigationButton>
        </nav>
      </div>
    </header>
  );
}

// ============================================================
// DESKTOP NAVIGATION BUTTON
// ============================================================
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
        "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-blue-500/10",
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

// ============================================================
// MOBILE NAVIGATION BUTTON
// ============================================================
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
        "inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition focus:outline-none focus:ring-4 focus:ring-blue-500/10",
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

// ============================================================
// API STATUS
// ============================================================
function ApiStatus({ status }) {
  if (status === "checking") {
    return (
      <div
        className="flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600"
        role="status"
        aria-live="polite"
      >
        <Loader2
          size={14}
          className="animate-spin"
        />

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
      <div
        className="flex shrink-0 items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700"
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 size={14} />

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
    <div
      className="flex shrink-0 items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
      role="alert"
      aria-live="assertive"
    >
      <WifiOff size={14} />

      <span className="hidden lg:inline">
        Prediction API unavailable
      </span>

      <span className="lg:hidden">
        API unavailable
      </span>
    </div>
  );
}