import { useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  HeartPulse,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { predictPatient } from "./services/predictionService";
import { checkApiHealth } from "./services/healthService";

const initialForm = {
  Age: "",
  Sex: "",
  ChestPainType: "",
  RestingBP: "",
  Cholesterol: "",
  FastingBS: "0",
  RestingECG: "",
  MaxHR: "",
  ExerciseAngina: "",
  Oldpeak: "",
  ST_Slope: "",
};

function App() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState("checking");

  useEffect(() => {
    let mounted = true;

    const checkHealth = async () => {
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
    };

    checkHealth();

    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await predictPatient({
        Age: Number(form.Age),
        Sex: form.Sex,
        ChestPainType: form.ChestPainType,
        RestingBP: Number(form.RestingBP),
        Cholesterol: Number(form.Cholesterol),
        FastingBS: Number(form.FastingBS),
        RestingECG: form.RestingECG,
        MaxHR: Number(form.MaxHR),
        ExerciseAngina: form.ExerciseAngina,
        Oldpeak: Number(form.Oldpeak),
        ST_Slope: form.ST_Slope,
      });

      setResult(data);

      // Refresh service status after a successful prediction request.
      setApiStatus("available");
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to connect to the prediction service."
      );

      // A failed prediction request may indicate that the API is
      // unavailable. Refresh the health status without changing
      // the existing prediction workflow.
      try {
        await checkApiHealth();
        setApiStatus("available");
      } catch {
        setApiStatus("unavailable");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setResult(null);
    setError("");
  };

  const serviceStatus = {
    checking: {
      label: "Checking prediction API",
      dotClass: "bg-amber-400",
      textClass: "text-slate-600",
    },
    available: {
      label: "Prediction API available",
      dotClass: "bg-emerald-500",
      textClass: "text-emerald-700",
    },
    unavailable: {
      label: "Prediction API unavailable",
      dotClass: "bg-red-500",
      textClass: "text-red-700",
    },
  }[apiStatus];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <HeartPulse size={26} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                LAMESE AI
              </h1>

              <p className="text-sm text-slate-500">
                Heart Disease Prediction System
              </p>
            </div>
          </div>

          <div
            className={`flex items-center gap-2 text-sm font-medium ${serviceStatus.textClass}`}
            aria-live="polite"
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${serviceStatus.dotClass} ${
                apiStatus === "checking" ? "animate-pulse" : ""
              }`}
            />

            {serviceStatus.label}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="mb-8 flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-3 text-xs font-bold tracking-[0.16em] text-blue-600">
              AI-ASSISTED HEALTH ANALYSIS
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Assess heart disease risk with
              <span className="text-blue-600"> explainable AI.</span>
            </h2>

            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Enter the patient information below to generate a
              model-based prediction and review the factors that
              influenced the result.
            </p>
          </div>

          <div className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            <ShieldCheck size={20} />
            Explainable prediction
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(380px,0.85fr)]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-8 flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Patient Information
                </h3>

                <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                  Provide the clinical and demographic inputs used by
                  the prediction model.
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Activity size={22} />
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  label="Age"
                  name="Age"
                  type="number"
                  value={form.Age}
                  onChange={handleChange}
                  min="0"
                  required
                />

                <SelectField
                  label="Sex"
                  name="Sex"
                  value={form.Sex}
                  onChange={handleChange}
                  options={[
                    ["M", "Male"],
                    ["F", "Female"],
                  ]}
                />

                <SelectField
                  label="Chest Pain Type"
                  name="ChestPainType"
                  value={form.ChestPainType}
                  onChange={handleChange}
                  options={[
                    ["ATA", "Atypical Angina"],
                    ["NAP", "Non-Anginal Pain"],
                    ["ASY", "Asymptomatic"],
                    ["TA", "Typical Angina"],
                  ]}
                />

                <FormField
                  label="Resting Blood Pressure"
                  name="RestingBP"
                  type="number"
                  value={form.RestingBP}
                  onChange={handleChange}
                  min="0"
                  required
                />

                <FormField
                  label="Cholesterol"
                  name="Cholesterol"
                  type="number"
                  value={form.Cholesterol}
                  onChange={handleChange}
                  min="0"
                  required
                />

                <SelectField
                  label="Fasting Blood Sugar"
                  name="FastingBS"
                  value={form.FastingBS}
                  onChange={handleChange}
                  options={[
                    ["0", "≤ 120 mg/dl"],
                    ["1", "> 120 mg/dl"],
                  ]}
                />

                <SelectField
                  label="Resting ECG"
                  name="RestingECG"
                  value={form.RestingECG}
                  onChange={handleChange}
                  options={[
                    ["Normal", "Normal"],
                    ["ST", "ST-T Wave Abnormality"],
                    ["LVH", "Left Ventricular Hypertrophy"],
                  ]}
                />

                <FormField
                  label="Maximum Heart Rate"
                  name="MaxHR"
                  type="number"
                  value={form.MaxHR}
                  onChange={handleChange}
                  min="0"
                  required
                />

                <SelectField
                  label="Exercise Angina"
                  name="ExerciseAngina"
                  value={form.ExerciseAngina}
                  onChange={handleChange}
                  options={[
                    ["N", "No"],
                    ["Y", "Yes"],
                  ]}
                />

                <FormField
                  label="Oldpeak"
                  name="Oldpeak"
                  type="number"
                  step="0.1"
                  value={form.Oldpeak}
                  onChange={handleChange}
                  required
                />

                <SelectField
                  label="ST Slope"
                  name="ST_Slope"
                  value={form.ST_Slope}
                  onChange={handleChange}
                  options={[
                    ["Up", "Upsloping"],
                    ["Flat", "Flat"],
                    ["Down", "Downsloping"],
                  ]}
                />
              </div>

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <HeartPulse size={18} />
                      Analyze Patient
                    </>
                  )}
                </button>
              </div>
            </form>

            {error && (
              <div
                role="alert"
                className="mt-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <AlertCircle className="mt-0.5 shrink-0" size={20} />
                <span>{error}</span>
              </div>
            )}
          </section>

          <ResultPanel result={result} />
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 text-center sm:px-6 lg:px-8">
          <p className="text-xs leading-5 text-slate-500">
            LAMESE AI provides model-based predictions for research and
            decision-support purposes. It is not a medical diagnosis.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FormField({
  label,
  name,
  type,
  value,
  onChange,
  min,
  step,
  required,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        min={min}
        step={step}
        required={required}
        className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>

      <select
        name={name}
        value={value}
        onChange={onChange}
        required
        className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        <option value="">Select...</option>

        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function ResultPanel({ result }) {
  if (!result) {
    return (
      <section className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <Activity size={30} />
        </div>

        <h3 className="text-xl font-bold text-slate-900">
          Prediction Results
        </h3>

        <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
          Complete the patient form and select{" "}
          <strong className="font-semibold text-slate-700">
            Analyze Patient
          </strong>{" "}
          to generate a prediction.
        </p>
      </section>
    );
  }

  const hasHeartDisease = result.threshold_prediction === 1;
  const probability = (result.probability * 100).toFixed(2);

  const sortedFeatures = Object.entries(result.explanation).sort(
    ([, first], [, second]) =>
      Math.abs(second) - Math.abs(first)
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Prediction Results
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Model output and explainability.
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <HeartPulse size={22} />
        </div>
      </div>

      <div
        className={`rounded-xl border p-5 ${
          hasHeartDisease
            ? "border-red-200 bg-red-50"
            : "border-emerald-200 bg-emerald-50"
        }`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                hasHeartDisease
                  ? "text-red-600"
                  : "text-emerald-600"
              }`}
            >
              Model prediction
            </span>

            <strong
              className={`mt-1 block text-lg font-bold ${
                hasHeartDisease
                  ? "text-red-800"
                  : "text-emerald-800"
              }`}
            >
              {hasHeartDisease
                ? "Heart Disease Risk Detected"
                : "No Heart Disease Risk Detected"}
            </strong>
          </div>

          <div
            className={`text-3xl font-bold ${
              hasHeartDisease
                ? "text-red-700"
                : "text-emerald-700"
            }`}
          >
            {probability}%
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <span className="block text-xs font-medium text-slate-500">
            Probability
          </span>

          <strong className="mt-1 block text-lg font-bold text-slate-900">
            {probability}%
          </strong>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <span className="block text-xs font-medium text-slate-500">
            Decision threshold
          </span>

          <strong className="mt-1 block text-lg font-bold text-slate-900">
            {result.threshold}
          </strong>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-4">
          <h4 className="text-base font-bold text-slate-900">
            Feature Contributions
          </h4>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Positive values push the model toward heart disease;
            negative values push it away.
          </p>
        </div>

        <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
          {sortedFeatures.map(([feature, contribution]) => (
            <div
              className="flex items-center justify-between gap-4 px-4 py-3"
              key={feature}
            >
              <span className="min-w-0 truncate text-sm font-medium text-slate-700">
                {feature}
              </span>

              <strong
                className={`shrink-0 text-sm font-bold ${
                  contribution >= 0
                    ? "text-red-600"
                    : "text-emerald-600"
                }`}
              >
                {contribution >= 0 ? "+" : ""}
                {contribution.toFixed(4)}
              </strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default App;