import { useState } from "react";
import { FiPlusCircle } from "react-icons/fi";
import HealthCheckModal from "../components/HealthCheckModal";
import ResultChat from "../components/ResultChat";

export default function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Health AI Dashboard</h1>

      <button
        onClick={() => setModalOpen(true)}
        className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        <FiPlusCircle className="mr-2" />
        Check Health
      </button>

      {loading && (
        <div className="mt-6 animate-pulse text-blue-500">
          Analyzing health...
        </div>
      )}

      {result && <ResultChat result={result} />}

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