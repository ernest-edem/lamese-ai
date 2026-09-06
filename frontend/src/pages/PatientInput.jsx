import { useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
} from "lucide-react";

import { predictPatient } from "../services/predictionService";

const STEPS = [
  {
    number: 1,
    title: "Demographics",
    description: "Basic patient information",
  },
  {
    number: 2,
    title: "Symptoms",
    description: "Symptoms and exercise response",
  },
  {
    number: 3,
    title: "Measurements",
    description: "Clinical measurements",
  },
  {
    number: 4,
    title: "Review",
    description: "Review and analyze",
  },
];

const INITIAL_FORM = {
  Age: "",
  Sex: "",
  ChestPainType: "",
  RestingBP: "",
  Cholesterol: "",
  FastingBS: "",
  RestingECG: "",
  MaxHR: "",
  ExerciseAngina: "",
  Oldpeak: "",
  ST_Slope: "",
};

export default function PatientInput({
  apiStatus,
  onPredictionComplete,
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  }

  function validateStep() {
    const requiredFields = {
      1: ["Age", "Sex"],
      2: ["ChestPainType", "ExerciseAngina"],
      3: [
        "RestingBP",
        "Cholesterol",
        "FastingBS",
        "RestingECG",
        "MaxHR",
        "Oldpeak",
        "ST_Slope",
      ],
    };

    const fields = requiredFields[currentStep] || [];

    for (const field of fields) {
      if (
        form[field] === "" ||
        form[field] === null ||
        form[field] === undefined
      ) {
        setError("Please complete all required fields before continuing.");
        return false;
      }
    }

    return true;
  }

  function handleNext() {
    if (!validateStep()) {
      return;
    }

    setCurrentStep((previous) => Math.min(previous + 1, 4));
  }

  function handleBack() {
    setError("");
    setCurrentStep((previous) => Math.max(previous - 1, 1));
  }

  async function handleSubmit() {
    setError("");

    if (!validateStep()) {
      return;
    }

    const patient = {
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
    };

    try {
      setIsSubmitting(true);

      const result = await predictPatient(patient);

      onPredictionComplete(result);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to complete the prediction."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setForm(INITIAL_FORM);
    setCurrentStep(1);
    setError("");
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-600">
            <Activity size={18} />
            Patient Assessment
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Patient Information
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Enter the patient information below to generate an AI-assisted
            heart disease risk assessment.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <StepProgress currentStep={currentStep} />

          <div className="p-5 sm:p-8">
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle className="mt-0.5 shrink-0" size={18} />
                <span>{error}</span>
              </div>
            )}

            {currentStep === 1 && (
              <DemographicsStep
                form={form}
                updateField={updateField}
              />
            )}

            {currentStep === 2 && (
              <SymptomsStep
                form={form}
                updateField={updateField}
              />
            )}

            {currentStep === 3 && (
              <MeasurementsStep
                form={form}
                updateField={updateField}
              />
            )}

            {currentStep === 4 && (
              <ReviewStep
                form={form}
                onEdit={(step) => {
                  setError("");
                  setCurrentStep(step);
                }}
              />
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isSubmitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
                  >
                    <ArrowLeft size={17} />
                    Back
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={isSubmitting}
                    className="w-full rounded-xl px-5 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 sm:w-auto"
                  >
                    Clear form
                  </button>
                )}
              </div>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
                >
                  Continue
                  <ArrowRight size={17} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || apiStatus !== "available"}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={17} />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Activity size={17} />
                      Analyze Patient
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-slate-500">
          <Check size={14} className="text-emerald-600" />
          Your information is processed by the LAMESE AI prediction service.
        </div>
      </div>
    </main>
  );
}

function StepProgress({ currentStep }) {
  return (
    <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-5 sm:px-8">
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {STEPS.map((step) => {
          const isActive = step.number === currentStep;
          const isComplete = step.number < currentStep;

          return (
            <div key={step.number} className="relative">
              <div className="flex items-center gap-2">
                <div
                  className={[
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition",
                    isComplete
                      ? "bg-emerald-600 text-white"
                      : isActive
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200 text-slate-500",
                  ].join(" ")}
                >
                  {isComplete ? <Check size={15} /> : step.number}
                </div>

                <div className="hidden min-w-0 sm:block">
                  <p
                    className={[
                      "truncate text-sm font-semibold",
                      isActive || isComplete
                        ? "text-slate-900"
                        : "text-slate-500",
                    ].join(" ")}
                  >
                    {step.title}
                  </p>

                  <p className="truncate text-xs text-slate-400">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 h-1 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-300"
          style={{
            width: `${(currentStep / STEPS.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

function DemographicsStep({ form, updateField }) {
  return (
    <StepContainer
      title="Demographics"
      description="Start with the patient's basic demographic information."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Age"
          required
          type="number"
          min="0"
          value={form.Age}
          onChange={(value) => updateField("Age", value)}
          placeholder="e.g. 55"
        />

        <SelectField
          label="Sex"
          required
          value={form.Sex}
          onChange={(value) => updateField("Sex", value)}
          options={[
            { value: "M", label: "Male" },
            { value: "F", label: "Female" },
          ]}
        />
      </div>
    </StepContainer>
  );
}

function SymptomsStep({ form, updateField }) {
  return (
    <StepContainer
      title="Symptoms"
      description="Provide information about symptoms and exercise-related responses."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Chest Pain Type"
          required
          value={form.ChestPainType}
          onChange={(value) => updateField("ChestPainType", value)}
          options={[
            { value: "ATA", label: "Atypical Angina" },
            { value: "NAP", label: "Non-Anginal Pain" },
            { value: "ASY", label: "Asymptomatic" },
            { value: "TA", label: "Typical Angina" },
          ]}
        />

        <SelectField
          label="Exercise Angina"
          required
          value={form.ExerciseAngina}
          onChange={(value) => updateField("ExerciseAngina", value)}
          options={[
            { value: "Y", label: "Yes" },
            { value: "N", label: "No" },
          ]}
        />
      </div>
    </StepContainer>
  );
}

function MeasurementsStep({ form, updateField }) {
  return (
    <StepContainer
      title="Clinical Measurements"
      description="Enter the patient's clinical measurements used by the prediction model."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Resting Blood Pressure"
          required
          type="number"
          min="0"
          value={form.RestingBP}
          onChange={(value) => updateField("RestingBP", value)}
          placeholder="e.g. 140"
          suffix="mmHg"
        />

        <FormField
          label="Cholesterol"
          required
          type="number"
          min="0"
          value={form.Cholesterol}
          onChange={(value) => updateField("Cholesterol", value)}
          placeholder="e.g. 250"
          suffix="mg/dL"
        />

        <SelectField
          label="Fasting Blood Sugar"
          required
          value={form.FastingBS}
          onChange={(value) => updateField("FastingBS", value)}
          options={[
            { value: "0", label: "Normal (≤ 120 mg/dL)" },
            { value: "1", label: "Elevated (> 120 mg/dL)" },
          ]}
        />

        <SelectField
          label="Resting ECG"
          required
          value={form.RestingECG}
          onChange={(value) => updateField("RestingECG", value)}
          options={[
            { value: "Normal", label: "Normal" },
            { value: "ST", label: "ST-T Wave Abnormality" },
            { value: "LVH", label: "Left Ventricular Hypertrophy" },
          ]}
        />

        <FormField
          label="Maximum Heart Rate"
          required
          type="number"
          min="0"
          value={form.MaxHR}
          onChange={(value) => updateField("MaxHR", value)}
          placeholder="e.g. 150"
          suffix="bpm"
        />

        <FormField
          label="Oldpeak"
          required
          type="number"
          step="0.1"
          value={form.Oldpeak}
          onChange={(value) => updateField("Oldpeak", value)}
          placeholder="e.g. 1.2"
        />

        <SelectField
          label="ST Slope"
          required
          value={form.ST_Slope}
          onChange={(value) => updateField("ST_Slope", value)}
          options={[
            { value: "Up", label: "Upsloping" },
            { value: "Flat", label: "Flat" },
            { value: "Down", label: "Downsloping" },
          ]}
        />
      </div>
    </StepContainer>
  );
}

function ReviewStep({ form, onEdit }) {
  return (
    <StepContainer
      title="Review Patient Information"
      description="Review the information before sending it to the prediction service."
    >
      <div className="space-y-5">
        <ReviewSection
          title="Demographics"
          step={1}
          onEdit={onEdit}
          items={[
            ["Age", form.Age],
            ["Sex", form.Sex === "M" ? "Male" : "Female"],
          ]}
        />

        <ReviewSection
          title="Symptoms"
          step={2}
          onEdit={onEdit}
          items={[
            ["Chest Pain Type", getChestPainLabel(form.ChestPainType)],
            [
              "Exercise Angina",
              form.ExerciseAngina === "Y" ? "Yes" : "No",
            ],
          ]}
        />

        <ReviewSection
          title="Clinical Measurements"
          step={3}
          onEdit={onEdit}
          items={[
            ["Resting Blood Pressure", `${form.RestingBP} mmHg`],
            ["Cholesterol", `${form.Cholesterol} mg/dL`],
            [
              "Fasting Blood Sugar",
              form.FastingBS === "1" ? "Elevated" : "Normal",
            ],
            ["Resting ECG", getRestingECGLabel(form.RestingECG)],
            ["Maximum Heart Rate", `${form.MaxHR} bpm`],
            ["Oldpeak", form.Oldpeak],
            ["ST Slope", getSlopeLabel(form.ST_Slope)],
          ]}
        />
      </div>
    </StepContainer>
  );
}

function ReviewSection({ title, step, onEdit, items }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>

        <button
          type="button"
          onClick={() => onEdit(step)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          Edit
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map(([label, value]) => (
          <div key={label}>
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {value || "Not provided"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepContainer({ title, description, children }) {
  return (
    <section>
      <div className="mb-7">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      {children}
    </section>
  );
}

function FormField({
  label,
  required,
  type = "text",
  min,
  step,
  value,
  onChange,
  placeholder,
  suffix,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>

      <div className="relative">
        <input
          type={type}
          min={min}
          step={step}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={[
            "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition",
            "placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10",
            suffix ? "pr-20" : "",
          ].join(" ")}
        />

        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-medium text-slate-400">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

function SelectField({
  label,
  required,
  value,
  onChange,
  options,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
      >
        <option value="">Select an option</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function getChestPainLabel(value) {
  const labels = {
    ATA: "Atypical Angina",
    NAP: "Non-Anginal Pain",
    ASY: "Asymptomatic",
    TA: "Typical Angina",
  };

  return labels[value] || value;
}

function getRestingECGLabel(value) {
  const labels = {
    Normal: "Normal",
    ST: "ST-T Wave Abnormality",
    LVH: "Left Ventricular Hypertrophy",
  };

  return labels[value] || value;
}

function getSlopeLabel(value) {
  const labels = {
    Up: "Upsloping",
    Flat: "Flat",
    Down: "Downsloping",
  };

  return labels[value] || value;
}