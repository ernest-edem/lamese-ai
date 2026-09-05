import { useState } from "react";
import {
  Activity,
  AlertCircle,
  HeartPulse,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { predictPatient } from "./services/predictionService";
import "./App.css";

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
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to connect to the prediction service."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setResult(null);
    setError("");
  };

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="brand-icon">
            <HeartPulse size={26} />
          </div>

          <div>
            <h1>LAMESE AI</h1>
            <p>Heart Disease Prediction System</p>
          </div>
        </div>

        <div className="status">
          <span className="status-dot" />
          Prediction service
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <div>
            <p className="eyebrow">AI-ASSISTED HEALTH ANALYSIS</p>

            <h2>
              Assess heart disease risk with
              <span> explainable AI.</span>
            </h2>

            <p className="hero-text">
              Enter the patient information below to generate a
              model-based prediction and review the factors that
              influenced the result.
            </p>
          </div>

          <div className="hero-badge">
            <ShieldCheck size={20} />
            Explainable prediction
          </div>
        </section>

        <div className="content-grid">
          <section className="card">
            <div className="card-header">
              <div>
                <h3>Patient Information</h3>
                <p>
                  Provide the clinical and demographic inputs used by
                  the prediction model.
                </p>
              </div>

              <Activity size={22} />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
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

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleReset}
                  disabled={loading}
                >
                  Reset
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="spinner" size={18} />
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
              <div className="error-alert">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}
          </section>

          <ResultPanel result={result} />
        </div>
      </main>

      <footer>
        <p>
          LAMESE AI provides model-based predictions for research and
          decision-support purposes. It is not a medical diagnosis.
        </p>
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
    <label className="field">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        min={min}
        step={step}
        required={required}
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
    <label className="field">
      <span>{label}</span>

      <select
        name={name}
        value={value}
        onChange={onChange}
        required
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
      <section className="card result-card empty-result">
        <div className="empty-icon">
          <Activity size={30} />
        </div>

        <h3>Prediction Results</h3>

        <p>
          Complete the patient form and select{" "}
          <strong>Analyze Patient</strong> to generate a prediction.
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
    <section className="card result-card">
      <div className="card-header">
        <div>
          <h3>Prediction Results</h3>
          <p>Model output and explainability.</p>
        </div>

        <HeartPulse size={22} />
      </div>

      <div
        className={`prediction ${
          hasHeartDisease ? "risk" : "normal"
        }`}
      >
        <div>
          <span className="prediction-label">
            Model prediction
          </span>

          <strong>
            {hasHeartDisease
              ? "Heart Disease Risk Detected"
              : "No Heart Disease Risk Detected"}
          </strong>
        </div>

        <div className="probability">
          {probability}%
        </div>
      </div>

      <div className="result-details">
        <div>
          <span>Probability</span>
          <strong>{probability}%</strong>
        </div>

        <div>
          <span>Decision threshold</span>
          <strong>{result.threshold}</strong>
        </div>
      </div>

      <div className="explanation">
        <div className="explanation-header">
          <div>
            <h4>Feature Contributions</h4>
            <p>
              Positive values push the model toward heart disease;
              negative values push it away.
            </p>
          </div>
        </div>

        <div className="feature-list">
          {sortedFeatures.map(([feature, contribution]) => (
            <div className="feature-row" key={feature}>
              <span>{feature}</span>

              <strong
                className={
                  contribution >= 0 ? "positive" : "negative"
                }
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