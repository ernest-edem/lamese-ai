import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Loader2,
  LogOut,
  WifiOff,
} from "lucide-react";

import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import PatientInput from "./pages/PatientInput";
import ExplainabilityDashboard from "./pages/ExplainabilityDashboard";
import SplashScreen from "./components/SplashScreen";

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

const SPLASH_DURATION = 3500;

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
        setCurrentPage((page) => {
          if (
            page === PAGES.DASHBOARD &&
            result
          ) {
            return page;
          }

          return PAGES.PATIENT_INPUT;
        });
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
    result,
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
          className="flex min-w-0 shrink-0 items-center gap-3 rounded-xl text-left outline-none focus-visible:ring-4 focus-visible:ring-primary-focus/20"
          aria-label="Go to patient assessment"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
            <img
              src="/lamese-logo.svg"
              alt="Lamese-AI logo"
              className="h-8 w-8 object-contain"
            />
          </div>

          <div className="min-w-0">
            <h1 className="text-base font-bold tracking-tight text-slate-900">
              Lamese-AI
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
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-focus/10"
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
        "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-primary-focus/10",
        active
          ? "bg-info-surface text-info-text-muted"
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
        "inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition focus:outline-none focus:ring-4 focus:ring-primary-focus/10",
        active
          ? "bg-info-surface text-info-text-muted"
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
          Prediction API ready
        </span>

        <span className="lg:hidden">
          API ready
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