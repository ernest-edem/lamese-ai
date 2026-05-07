import HealthScoreRing from "./HealthScoreRing";

export default function ResultChat({ result }) {
  // 🧠 STREAMING MODE
  if (result?.streaming) {
    return (
      <div className="mt-6 bg-black text-green-400 p-4 rounded-lg font-mono whitespace-pre-wrap">
        {result.text}
        <span className="typing-cursor">|</span>
      </div>
    );
  }

  if (!result) return null;

  const isHighRisk = result.risk_level === "High";

  return (
    <div className="mt-6 space-y-4">

      {/* 🚨 ALERT */}
      {isHighRisk && (
        <div className="bg-red-600 text-white p-4 rounded-lg animate-pulse">
          🚨 HIGH RISK DETECTED – Seek medical attention immediately
        </div>
      )}

      {/* 🤖 DISEASE */}
      <div className="bg-blue-500 text-white p-4 rounded-lg">
        🤖 {result.disease}
      </div>

      {/* 📊 SCORE */}
      <div className="bg-white p-4 rounded shadow">
        <HealthScoreRing score={result.health_score} />
        <p className="mt-2 font-bold">
          Risk Level: {result.risk_level}
        </p>
      </div>

      {/* 🧠 EXPLANATION */}
      <div className="bg-white p-4 rounded shadow">
        <p>{result.explanation}</p>
      </div>

      {/* 💡 RECOMMENDATIONS */}
      <div className="bg-white p-4 rounded shadow">
        <ul className="list-disc ml-4">
          {result.recommendation?.map((rec, i) => (
            <li key={i}>{rec}</li>
          ))}
        </ul>
      </div>

    </div>
  );
}