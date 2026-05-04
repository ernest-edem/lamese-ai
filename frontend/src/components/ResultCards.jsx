export default function ResultCards({ result }) {
    return (
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="p-6 bg-white rounded shadow">
          <h2 className="text-blue-500 font-bold">Disease</h2>
          <p>{result.disease}</p>
        </div>
  
        <div className="p-6 bg-white rounded shadow">
          <h2 className="text-green-500 font-bold">Health Score</h2>
          <p>{result.health_score}</p>
        </div>
  
        <div className="p-6 bg-white rounded shadow col-span-2">
          <h2 className="text-yellow-500 font-bold">Explanation</h2>
          <p>{result.explanation}</p>
        </div>
  
        <div className="p-6 bg-white rounded shadow col-span-2">
          <h2 className="text-purple-500 font-bold">Recommendation</h2>
          <p>{result.recommendation}</p>
        </div>
      </div>
    );
  }