import { useState, useEffect } from "react";
import { FiPlusCircle } from "react-icons/fi";
import HealthCheckModal from "../components/HealthCheckModal";
import ResultChat from "../components/ResultChat";
import { saveResult } from "../utils/storage"; // ✅ FIXED casing

export default function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Save to history when result is final (not streaming)
  useEffect(() => {
    if (result && !result.streaming && !result.error) {
      saveResult({
        disease: result.disease || "Unknown",
        health_score: result.health_score || 0,
        risk_level: result.risk_level || "Unknown",
        date: new Date().toISOString(),
      });
    }
  }, [result]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Health AI Dashboard
      </h1>

      {/* CTA */}
      <button
        onClick={() => setModalOpen(true)}
        className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        <FiPlusCircle className="mr-2" />
        Health Check
      </button>

      {/* Loading */}
      {loading && (
        <div className="mt-6 animate-pulse text-blue-500">
          Analyzing health...
        </div>
      )}

      {/* ✅ Chat Result */}
      {result && (
        <div className="mt-6">
          <ResultChat result={result} />
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <HealthCheckModal
          onClose={() => setModalOpen(false)}
          setResult={setResult}
          setLoading={setLoading}
        />
      )}
    </div>
  );
}