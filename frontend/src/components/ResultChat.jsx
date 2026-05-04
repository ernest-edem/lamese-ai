import HealthScoreRing from "./HealthScoreRing";

export default function ResultChat({ result }) {
  return (
    <div className="mt-6 space-y-4">

      <div className="bg-gray-200 p-3 rounded-lg max-w-md">
        🧑 You submitted symptoms
      </div>

      <div className="bg-blue-500 text-white p-4 rounded-lg max-w-md ml-auto">
        🤖 AI Diagnosis: {result.disease}
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-bold text-green-500 mb-2">Health Score</h2>
        <HealthScoreRing score={result.health_score} />
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-bold text-yellow-500">Explanation</h2>
        <p>{result.explanation}</p>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-bold text-purple-500">Recommendation</h2>
        <p>{result.recommendation}</p>
      </div>

    </div>
  );
}