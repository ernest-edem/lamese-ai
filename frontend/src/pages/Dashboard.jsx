import { useState, useEffect } from "react";
import { FiPlus, FiActivity, FiClock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import HealthCheckModal from "../components/HealthCheckModal";
import HealthScoreRing from "../components/HealthScoreRing";
import { getHistory, saveResult } from "../utils/storage";
import Sidebar from "../components/Sidebar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  const loadHistory = () => {
    const raw = getHistory();
  
    // ✅ Normalize + ensure chart works
    const formatted = raw.map((item, index) => ({
      ...item,
      date: item.date || `Check ${index + 1}`, // fallback
      health_score: Number(item.health_score) || 0,
    }));
  
    const latestThree = formatted.slice(-3); // last 3
  
    setHistory(latestThree);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const latest = history[history.length - 1];

  return (
    <div className="flex bg-gray-100 min-h-screen">
    <Sidebar onCheckHealth={() => setModalOpen(true)} />
      

      {/* ========================= */}
      {/* 🔷 MAIN CONTENT */}
      {/* ========================= */}
      <div className="flex-1 p-6">

        <h1 className="text-3xl font-bold mb-6">
          Health AI Dashboard
        </h1>

        {/* ========================= */}
        {/* 🔷 UPPER LAYER */}
        {/* ========================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          {/* LEFT: CTA */}
          <div className="flex items-center justify-center bg-white rounded-2xl shadow p-10">
            <button
              onClick={() => setModalOpen(true)}
              className="w-32 h-32 rounded-full bg-blue-500 text-white flex flex-col items-center justify-center shadow-lg hover:bg-blue-600 transition"
            >
              <FiPlus size={32} />
              <span className="mt-2 text-sm">Check Health</span>
            </button>
          </div>

          {/* RIGHT: LAST SCORE */}
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center justify-center">
            {latest ? (
              <>
                <HealthScoreRing score={latest.health_score || 0} />
                <p className="mt-2 font-bold">
                  Risk: {latest.risk_level}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {latest.disease}
                </p>
              </>
            ) : (
              <p className="text-gray-400">No data yet</p>
            )}
          </div>
        </div>

        {/* ========================= */}
        {/* 🔷 LOWER LAYER (RECOMMENDATIONS) */}
        {/* ========================= */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">
            AI Recommendations
          </h2>

          {latest?.recommendation?.length > 0 ? (
            <ul className="list-disc ml-5 space-y-2">
              {latest.recommendation.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">
              No recommendations yet. Run a health check.
            </p>
          )}
        </div>

        {/* ========================= */}
        {/* 🔷 TREND GRAPH */}
        {/* ========================= */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">
            Health Trend (Last 3 Checks)
          </h2>

          {history.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={history}>
                <XAxis dataKey="date" hide />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="health_score" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400">
              No trend data available
            </p>
          )}
        </div>
      </div>

      {/* ========================= */}
      {/* 🔷 MODAL */}
      {/* ========================= */}
      {modalOpen && (
        <HealthCheckModal
          onClose={() => setModalOpen(false)}
          setLoading={() => {}}
          setResult={(data) => {
            // ❌ Block bad data
            if (
              !data ||
              data.error ||
              !data.disease ||
              data.health_score === undefined ||
              data.health_score === null
            ) {
              console.error("Invalid result, not saving:", data);
              return;
            }
          
            const finalData = {
              ...data,
              date: new Date().toISOString(),
            };
          
            saveResult(finalData);
            loadHistory();
          
            navigate("/analysis", { state: finalData });
          }}
        />
      )}
    </div>
  );
}