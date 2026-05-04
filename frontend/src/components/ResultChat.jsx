import HealthScoreRing from "./HealthScoreRing";

export default function ResultChat({ result }) {
  // 🧠 Streaming mode (ChatGPT-style)
  if (result?.streaming) {
    return (
      <div className="mt-6 max-w-2xl">
        <div className="bg-blue-500 text-white p-4 rounded-lg whitespace-pre-wrap">
          {result.text}
          <span className="typing-cursor">|</span>
        </div>
      </div>
    );
  }

  // ❌ Error state
  if (result?.error) {
    return (
      <div className="mt-6 text-red-500 bg-red-100 p-4 rounded">
        {result.error}
      </div>
    );
  }

  // 🛑 If no structured result yet
  if (!result) return null;

  const isHighRisk = result.risk_level === "High";

  return (
    <div className="mt-6 space-y-4 max-w-2xl">

      {/* 🚑 Emergency Alert */}
      {isHighRisk && (
        <div className="bg-red-600 text-white p-4 rounded-lg animate-pulse">
          🚨 HIGH RISK DETECTED – Seek medical attention immediately
        </div>
      )}

      {/* ⚠️ Red Flags */}
      {result.red_flags?.length > 0 && (
        <div className="bg-red-100 border border-red-400 p-4 rounded">
          <h2 className="font-bold text-red-600">⚠️ Red Flags</h2>
          <ul className="list-disc ml-4">
            {result.red_flags.map((flag, i) => (
              <li key={i}>{flag}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 🤖 Disease */}
      <div className="bg-blue-500 text-white p-4 rounded-lg">
        🤖 {result.disease || "Analyzing..."}
      </div>

      {/* 📊 Health Score */}
      <div className="bg-white p-4 rounded shadow">
        <HealthScoreRing score={result.health_score || 0} />
        <p className="mt-2 font-bold">
          Risk Level: {result.risk_level || "Unknown"}
        </p>
      </div>

      {/* 🧠 Explanation */}
      <div className="bg-white p-4 rounded shadow">
        <p>{result.explanation || "No explanation available yet."}</p>
      </div>

      {/* 💊 Recommendations */}
      <div className="bg-white p-4 rounded shadow">
        <ul className="list-disc ml-4">
          {result.recommendation?.length > 0 ? (
            result.recommendation.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))
          ) : (
            <li>No recommendations available</li>
          )}
        </ul>
      </div>

    </div>
  );
}