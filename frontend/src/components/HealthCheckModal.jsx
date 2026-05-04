import { useState } from "react";
import { FiMic } from "react-icons/fi";

export default function HealthCheckModal({ onClose, setResult, setLoading }) {
  const [step, setStep] = useState(1);
  const [imagePreview, setImagePreview] = useState(null);
  const [symptoms, setSymptoms] = useState("");

  const next = () => setStep(step + 1);
  const prev = () => setStep(step - 1);

  const startVoice = () => {
    if (!window.webkitSpeechRecognition) {
      alert("Voice input not supported in this browser");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.onresult = (event) => {
      setSymptoms(event.results[0][0].transcript);
    };
    recognition.start();
  };

  const handleSubmit = () => {
    setLoading(true);
    onClose();

    setTimeout(() => {
      setResult({
        disease: "Flu",
        health_score: 78,
        explanation: "Symptoms match a viral infection",
        recommendation: "Rest, hydrate, consult a doctor if symptoms persist",
      });
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg">

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <h2 className="text-xl mb-4">Basic Info</h2>
            <input placeholder="Age" className="w-full p-2 border mb-3" />
            <div>
              <label><input type="radio" name="sex" /> Male</label>
              <label className="ml-4"><input type="radio" name="sex" /> Female</label>
            </div>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <h2 className="text-lg font-bold mb-2">Symptoms</h2>

            <div className="flex">
              <input
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full p-2 border rounded-l"
                placeholder="Enter symptoms"
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
            <h2 className="text-lg font-bold mb-2">Upload</h2>

            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setImagePreview(URL.createObjectURL(file));
                }
              }}
            />

            {imagePreview && (
              <img
                src={imagePreview}
                alt="preview"
                className="mt-4 w-40 rounded"
              />
            )}
          </>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <>
            <h2 className="text-lg font-bold mb-2">Lifestyle</h2>
            <label><input type="checkbox" /> Smoking</label>
            <label className="ml-4"><input type="checkbox" /> Alcohol</label>
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