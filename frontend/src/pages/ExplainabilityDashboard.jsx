import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Gauge,
  Info,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

export default function ExplainabilityDashboard({
  result,
  onBack,
}) {
  if (!result) {
    return null;
  }

  const probability = Number(result.probability || 0);
  const threshold = Number(result.threshold || 0);
  const prediction = Number(result.prediction);
  const thresholdPrediction = Number(result.threshold_prediction);

  const heartDiseaseProbability = probability * 100;
  const noDiseaseProbability = 100 - heartDiseaseProbability;

  const explanationEntries = Object.entries(
    result.explanation || {}
  ).sort(
    ([, first], [, second]) =>
      Math.abs(Number(second)) - Math.abs(Number(first))
  );

  const positiveFeatures = explanationEntries.filter(
    ([, value]) => Number(value) > 0
  );

  const negativeFeatures = explanationEntries.filter(
    ([, value]) => Number(value) < 0
  );

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* ==========================================================
            PAGE HEADER
        ========================================================== */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-600">
              <Activity size={18} />
              Explainable AI Dashboard
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Prediction Results
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              Review the model prediction, probability, decision threshold,
              and the features that influenced this prediction.
            </p>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:w-auto"
          >
            <ArrowLeft size={17} />
            New Assessment
          </button>
        </div>

        {/* ==========================================================
            PRIMARY RISK SUMMARY
        ========================================================== */}
        <section className="mb-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            <RiskSummary
              prediction={prediction}
              probability={probability}
            />

            <ProbabilityGauge
              probability={probability}
              threshold={threshold}
            />
          </div>
        </section>

        {/* ==========================================================
            METRICS
        ========================================================== */}
        <section className="grid gap-5 md:grid-cols-3">
          <MetricCard
            icon={<Activity size={21} />}
            label="Heart Disease Probability"
            value={`${heartDiseaseProbability.toFixed(2)}%`}
            description="Model probability for the positive class"
          />

          <MetricCard
            icon={<Gauge size={21} />}
            label="Decision Threshold"
            value={`${(threshold * 100).toFixed(0)}%`}
            description={
              thresholdPrediction === 1
                ? "Probability is above the configured threshold"
                : "Probability is below the configured threshold"
            }
          />

          <MetricCard
            icon={<ShieldCheck size={21} />}
            label="Threshold Prediction"
            value={
              thresholdPrediction === 1
                ? "Heart Disease"
                : "No Heart Disease"
            }
            description="Prediction after applying the configured threshold"
          />
        </section>

        {/* ==========================================================
            PROBABILITY BREAKDOWN
        ========================================================== */}
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              Probability Breakdown
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Distribution of the model's predicted probability between
              the two classes.
            </p>
          </div>

          <div className="space-y-5">
            <ProbabilityRow
              label="Heart Disease"
              value={heartDiseaseProbability}
            />

            <ProbabilityRow
              label="No Heart Disease"
              value={noDiseaseProbability}
            />
          </div>
        </section>

        {/* ==========================================================
            EXPLAINABILITY
        ========================================================== */}
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <Gauge size={20} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Why Did the Model Make This Prediction?
                </h2>

                <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                  Feature contributions indicate how individual input
                  features influenced this particular model prediction.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            {explanationEntries.length === 0 ? (
              <EmptyExplanation />
            ) : (
              <>
                <div className="mb-6 grid gap-4 sm:grid-cols-2">
                  <ContributionSummary
                    type="positive"
                    count={positiveFeatures.length}
                  />

                  <ContributionSummary
                    type="negative"
                    count={negativeFeatures.length}
                  />
                </div>

                <div className="space-y-4">
                  {explanationEntries.map(
                    ([feature, contribution]) => (
                      <ContributionRow
                        key={feature}
                        feature={feature}
                        contribution={Number(contribution)}
                        maxContribution={getMaxContribution(
                          explanationEntries
                        )}
                      />
                    )
                  )}
                </div>
              </>
            )}
          </div>
        </section>

        {/* ==========================================================
            INTERPRETATION NOTE
        ========================================================== */}
        <section className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <Info
              className="mt-0.5 shrink-0 text-blue-600"
              size={19}
            />

            <div>
              <h3 className="text-sm font-bold text-blue-900">
                How to interpret these explanations
              </h3>

              <p className="mt-1 text-sm leading-6 text-blue-800">
                A positive contribution pushes the model toward the
                Heart Disease class, while a negative contribution pushes
                the model away from it. These values describe model
                behavior and do not establish medical causation.
              </p>
            </div>
          </div>
        </section>

        {/* ==========================================================
            MEDICAL DISCLAIMER
        ========================================================== */}
        <section className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <CircleAlert
              className="mt-0.5 shrink-0 text-amber-600"
              size={19}
            />

            <div>
              <h3 className="text-sm font-bold text-amber-900">
                Important Medical Disclaimer
              </h3>

              <p className="mt-1 text-sm leading-6 text-amber-800">
                LAMESE AI provides machine learning predictions for
                informational and research purposes. The prediction is
                not a medical diagnosis and should not replace evaluation
                by a qualified healthcare professional.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ================================================================
   RISK SUMMARY
================================================================ */

function RiskSummary({ prediction, probability }) {
  const positive = prediction === 1;
  const percentage = probability * 100;

  return (
    <div className="border-b border-slate-100 p-6 sm:p-8 lg:border-b-0 lg:border-r">
      <div className="flex items-start gap-4">
        <div
          className={[
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl",
            positive
              ? "bg-red-50 text-red-600"
              : "bg-emerald-50 text-emerald-600",
          ].join(" ")}
        >
          {positive ? (
            <CircleAlert size={28} />
          ) : (
            <CheckCircle2 size={28} />
          )}
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Model Prediction
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            {positive ? "Heart Disease" : "No Heart Disease"}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            The model estimates a{" "}
            <strong className="font-bold text-slate-700">
              {percentage.toFixed(2)}%
            </strong>{" "}
            probability for the Heart Disease class.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-medium text-slate-500">
            Predicted Class
          </p>

          <p className="mt-1 text-sm font-bold text-slate-800">
            {prediction === 1 ? "1 — Positive" : "0 — Negative"}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-medium text-slate-500">
            Model Probability
          </p>

          <p className="mt-1 text-sm font-bold text-slate-800">
            {percentage.toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   PROBABILITY GAUGE
================================================================ */

function ProbabilityGauge({ probability, threshold }) {
  const percentage = Math.min(
    Math.max(probability * 100, 0),
    100
  );

  const thresholdPercentage = Math.min(
    Math.max(threshold * 100, 0),
    100
  );

  const aboveThreshold = probability >= threshold;

  return (
    <div className="flex flex-col justify-center p-6 sm:p-8">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Risk Probability
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Model confidence for Heart Disease
          </p>
        </div>

        <span
          className={[
            "rounded-full px-3 py-1.5 text-xs font-bold",
            aboveThreshold
              ? "bg-red-50 text-red-700"
              : "bg-emerald-50 text-emerald-700",
          ].join(" ")}
        >
          {aboveThreshold ? "Above threshold" : "Below threshold"}
        </span>
      </div>

      <div className="relative pt-8">
        <div className="h-5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-700"
            style={{
              width: `${percentage}%`,
            }}
          />
        </div>

        <div
          className="absolute top-5 h-9 w-0.5 bg-slate-800"
          style={{
            left: `calc(${thresholdPercentage}% - 1px)`,
          }}
          title={`Threshold: ${thresholdPercentage.toFixed(0)}%`}
        />

        <div
          className="absolute top-0 -translate-x-1/2 text-xs font-bold text-slate-600"
          style={{
            left: `${thresholdPercentage}%`,
          }}
        >
          {thresholdPercentage.toFixed(0)}%
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">
            Probability
          </p>

          <p className="mt-1 text-3xl font-bold text-slate-900">
            {percentage.toFixed(2)}%
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs font-medium text-slate-500">
            Threshold
          </p>

          <p className="mt-1 text-lg font-bold text-slate-800">
            {thresholdPercentage.toFixed(0)}%
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   METRIC CARD
================================================================ */

function MetricCard({
  icon,
  label,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-slate-50 p-2.5 text-blue-600">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>

          <p className="mt-1 truncate text-lg font-bold text-slate-900">
            {value}
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* ================================================================
   PROBABILITY ROW
================================================================ */

function ProbabilityRow({ label, value }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="text-sm font-semibold text-slate-700">
          {label}
        </span>

        <span className="text-sm font-bold text-slate-900">
          {value.toFixed(2)}%
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-700"
          style={{
            width: `${Math.min(Math.max(value, 0), 100)}%`,
          }}
        />
      </div>
    </div>
  );
}

/* ================================================================
   CONTRIBUTION SUMMARY
================================================================ */

function ContributionSummary({ type, count }) {
  const positive = type === "positive";

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div
        className={[
          "rounded-lg p-2",
          positive
            ? "bg-blue-50 text-blue-600"
            : "bg-slate-200 text-slate-600",
        ].join(" ")}
      >
        {positive ? (
          <TrendingUp size={18} />
        ) : (
          <TrendingDown size={18} />
        )}
      </div>

      <div>
        <p className="text-xs font-medium text-slate-500">
          {positive
            ? "Features pushing toward Heart Disease"
            : "Features pushing away from Heart Disease"}
        </p>

        <p className="mt-1 text-sm font-bold text-slate-800">
          {count} feature{count === 1 ? "" : "s"}
        </p>
      </div>
    </div>
  );
}

/* ================================================================
   CONTRIBUTION ROW
================================================================ */

function ContributionRow({
  feature,
  contribution,
  maxContribution,
}) {
  const positive = contribution >= 0;

  const magnitude =
    maxContribution > 0
      ? (Math.abs(contribution) / maxContribution) * 100
      : 0;

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:w-48">
          <p className="break-words text-sm font-semibold text-slate-800">
            {feature}
          </p>
        </div>

        <div className="flex-1">
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
            <div
              className={[
                "h-full rounded-full transition-all duration-500",
                positive ? "bg-blue-600" : "bg-slate-500",
              ].join(" ")}
              style={{
                width: `${Math.min(Math.max(magnitude, 0), 100)}%`,
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:w-28 sm:justify-end">
          {positive ? (
            <TrendingUp size={16} className="text-blue-600" />
          ) : (
            <TrendingDown size={16} className="text-slate-500" />
          )}

          <span className="text-sm font-bold text-slate-700">
            {positive ? "+" : ""}
            {contribution.toFixed(4)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   EMPTY STATE
================================================================ */

function EmptyExplanation() {
  return (
    <div className="rounded-xl bg-slate-50 p-8 text-center">
      <Info className="mx-auto text-slate-400" size={24} />

      <p className="mt-3 text-sm font-semibold text-slate-700">
        Explanation data unavailable
      </p>

      <p className="mt-1 text-sm text-slate-500">
        The prediction was completed, but no feature contribution
        information was returned.
      </p>
    </div>
  );
}

/* ================================================================
   HELPERS
================================================================ */

function getMaxContribution(entries) {
  if (!entries.length) {
    return 0;
  }

  return Math.max(
    ...entries.map(([, value]) => Math.abs(Number(value)))
  );
}