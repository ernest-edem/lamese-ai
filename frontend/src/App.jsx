import { useState } from "react";

export default function App() {
  const [symptoms, setSymptoms] = useState("");
  const [result, setResult] = useState("");

  const handleSubmit = async () => {
    const res = await fetch("http://localhost:8000/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ symptoms }),
    });

    const data = await res.json();
    setResult(data.result);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-10">
      <h1 className="text-3xl font-bold mb-6">Health AI</h1>

      <textarea
        className="w-full max-w-md p-3 border rounded-lg"
        placeholder="Enter symptoms..."
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg"
      >
        Check Health
      </button>

      {result && (
        <div className="mt-6 bg-white p-4 rounded-xl shadow-md max-w-md">
          <h2 className="font-semibold">Result:</h2>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}