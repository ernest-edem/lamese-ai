console.log("NEW UI LOADED");
import { useState } from "react";

export default function App() {
  const [symptoms, setSymptoms] = useState("");
  const [result, setResult] = useState(null); // changed to null
  const [loading, setLoading] = useState(false);

  const analyzeHealth = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symptoms }),
      });

      const data = await response.json();

      console.log("RAW API RESPONSE:", data);

      // ✅ Handle both JSON and string responses safely
     
      setResult(data);

    } catch (error) {
      setResult({ error: "Error connecting to backend" });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">LAMESE AI Health Check</h1>

      <textarea
        className="w-full max-w-md p-3 rounded bg-gray-800 border border-gray-700"
        placeholder="Enter your symptoms..."
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value)}
      />

      <button
        onClick={analyzeHealth}
        className="mt-4 px-6 py-2 bg-cyan-500 rounded hover:bg-cyan-600"
      >
        {loading ? "Analyzing..." : "Check Health"}
      </button>

      {/* ✅ Structured Result UI */}
      {result && (
        <div className="mt-6 w-full max-w-md space-y-4">

          {/* Error */}
          {result.error && (
            <div className="bg-red-500/20 border border-red-500 p-4 rounded">
              {result.error}
            </div>
          )}

          {/* Disease */}
          {result.disease && (
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <h2 className="font-bold text-cyan-400 mb-2">Possible Condition</h2>
              <p>{result.disease}</p>
            </div>
          )}

          {/* Health Score */}
          {result.health_score && (
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <h2 className="font-bold text-green-400 mb-2">Health Score</h2>
              <p>{result.health_score}</p>
            </div>
          )}

          {/* Explanation */}
          {result.explanation && (
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <h2 className="font-bold text-yellow-400 mb-2">Explanation</h2>
              <p>{result.explanation}</p>
            </div>
          )}

          {/* Recommendation */}
          {result.recommendation && (
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <h2 className="font-bold text-purple-400 mb-2">Recommendation</h2>
              <p>{result.recommendation}</p>
            </div>
          )}

        </div>
      )}

    </div>
  );
}