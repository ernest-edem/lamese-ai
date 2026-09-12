import { Loader2 } from "lucide-react";

export default function SplashScreen() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.12),transparent_45%)]" />

      <div className="relative w-full max-w-md text-center">
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-3xl bg-primary/10" />

          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-primary shadow-2xl shadow-primary/30">
            <img
              src="/lamese-logo.svg"
              alt="Lamese-AI logo"
              className="h-16 w-16 object-contain"
            />
          </div>
        </div>

        <h1 className="mt-7 text-4xl font-bold tracking-tight text-text">
          Lamese-AI
        </h1>

        <p className="mt-3 text-sm font-medium tracking-wide text-text-muted">
          Heart Disease Prediction System
        </p>

        <div className="mx-auto mt-10 flex items-center justify-center gap-2 text-xs font-medium text-text-muted">
          <Loader2
            size={15}
            className="animate-spin text-primary-focus"
          />

          <span>Initializing system</span>
        </div>

        <div className="mx-auto mt-5 h-1 w-48 overflow-hidden rounded-full bg-text/10">
          <div className="h-full w-full origin-left animate-[pulse_1.8s_ease-in-out] rounded-full bg-primary" />
        </div>

        <p className="mt-8 text-[11px] font-medium uppercase tracking-[0.2em] text-text-muted">
          Explainable AI
        </p>
      </div>
    </main>
  );
}
