import { useState } from "react";
import { FiMic } from "react-icons/fi";

export default function HealthCheckModal({ onClose, setResult, setLoading }) {
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    age: "",
    sex: "",
    symptoms: "",
    smoking: false,
    alcohol: false,
    exercise: "",
    sleep: 6,
    diet: "",
  });

  const [image, setImage] = useState(null);
  const [pdf, setPdf] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const next = () => setStep(step + 1);
  const prev = () => setStep(step - 1);

  // 🎤 Voice input
  const startVoice = () => {
    if (!window.webkitSpeechRecognition) {
      alert("Voice input not supported");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.onresult = (e) => {
      setForm({ ...form, symptoms: e.results[0][0].transcript });
    };
    recognition.start();
  };

  // 🚀 Submit
  const handleSubmit = async () => {
    setLoading(true);
  
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) =>
        formData.append(key, value)
      );
  
      if (image) formData.append("image", image);
      if (pdf) formData.append("pdf", pdf);
  
      // =========================
      // 🧠 STEP 1: STREAMING
      // =========================
      const streamRes = await fetch("http://127.0.0.1:8000/analyze-stream", {
        method: "POST",
        body: formData,
      });
  
      const reader = streamRes.body.getReader();
      const decoder = new TextDecoder();
  
      let streamedText = "";
  
      setResult({ streaming: true, text: "" });
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
  
        streamedText += decoder.decode(value);
  
        setResult({
          streaming: true,
          text: streamedText,
        });
      }
  
      // =========================
      // 🧠 STEP 2: FINAL JSON
      // =========================
      const finalRes = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: formData,
      });
  
      const data = await finalRes.json();
  
      // ✅ IMPORTANT: MERGE, don't replace blindly
      setResult({
        ...data,
        text: streamedText,   // keep streamed explanation
        streaming: false,
      });
  
    } catch (error) {
      setResult({ error: "Backend error" });
    }
  
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg">

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <h2 className="text-xl mb-4">Basic Info</h2>

            <input
              placeholder="Age"
              className="w-full p-2 border mb-3"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
            />

            <div>
              <label>
                <input
                  type="radio"
                  name="sex"
                  onChange={() => setForm({ ...form, sex: "male" })}
                /> Male
              </label>

              <label className="ml-4">
                <input
                  type="radio"
                  name="sex"
                  onChange={() => setForm({ ...form, sex: "female" })}
                /> Female
              </label>
            </div>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <h2 className="mb-2">Symptoms</h2>

            <div className="flex">
              <input
                value={form.symptoms}
                onChange={(e) =>
                  setForm({ ...form, symptoms: e.target.value })
                }
                className="w-full p-2 border rounded-l"
              />

              <button
                onClick={startVoice}
                className="bg-blue-500 text-white px-3 rounded-r"
              >
                <FiMic />
              </button>
            </div>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <h2>Upload</h2>

            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                setImage(file);
                if (file) setImagePreview(URL.createObjectURL(file));
              }}
            />

            <input
              type="file"
              onChange={(e) => setPdf(e.target.files[0])}
              className="mt-2"
            />

            {imagePreview && (
              <img src={imagePreview} className="mt-4 w-40 rounded" />
            )}
          </>
        )}

        {/* STEP 4 - PREMIUM */}
        {step === 4 && (
          <>
            <h2 className="text-xl font-bold mb-6 text-gray-800">
              Lifestyle Analysis
            </h2>

            <div className="flex gap-6 mb-6">
              <div
                onClick={() =>
                  setForm({ ...form, smoking: !form.smoking })
                }
                className={`cursor-pointer px-4 py-2 rounded-full ${
                  form.smoking ? "bg-red-500 text-white" : "bg-gray-200"
                }`}
              >
                🚬 Smoking
              </div>

              <div
                onClick={() =>
                  setForm({ ...form, alcohol: !form.alcohol })
                }
                className={`cursor-pointer px-4 py-2 rounded-full ${
                  form.alcohol ? "bg-purple-500 text-white" : "bg-gray-200"
                }`}
              >
                🍺 Alcohol
              </div>
            </div>

            <div className="mb-4">
              <p>Exercise Level</p>
              <div className="flex gap-2">
                {["low", "moderate", "high"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setForm({ ...form, exercise: level })}
                    className={`px-3 py-2 rounded ${
                      form.exercise === level
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p>Sleep: {form.sleep} hrs</p>
              <input
                type="range"
                min="0"
                max="12"
                value={form.sleep}
                onChange={(e) =>
                  setForm({ ...form, sleep: e.target.value })
                }
                className="w-full"
              />
            </div>

            <div>
              <p>Diet</p>
              <div className="flex gap-2">
                {["poor", "average", "healthy"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setForm({ ...form, diet: d })}
                    className={`px-3 py-2 rounded ${
                      form.diet === d
                        ? "bg-green-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* CONTROLS */}
        <div className="flex justify-between mt-6">
          {step > 1 && <button onClick={prev}>Back</button>}

          {step < 4 ? (
            <button onClick={next}>Next</button>
          ) : (
            <button
              onClick={handleSubmit}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Analyze Health
            </button>
          )}
        </div>

        <button onClick={onClose} className="mt-4 text-red-500">
          Close
        </button>
      </div>
    </div>
  );
}