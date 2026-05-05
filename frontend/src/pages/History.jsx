import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getHistory, clearHistory } from "../utils/storage";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function History() {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const raw = getHistory();

    // ✅ Clean + normalize
    const formatted = raw
      .filter(
        (item) =>
          item &&
          item.disease &&
          item.disease !== "Unknown" &&
          Number(item.health_score) > 0
      )
      .map((item, index) => ({
        ...item,
        date: item.date
          ? new Date(item.date).toLocaleString()
          : `Check ${index + 1}`,
        health_score: Number(item.health_score) || 0,
      }));

    setHistory(formatted.reverse()); // newest first
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Health History</h1>

          {/* 🗑 CLEAR BUTTON */}
          <button
            onClick={() => {
              if (confirm("Delete all health history?")) {
                clearHistory();
                loadHistory();
              }
            }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear History
          </button>
        </div>

        {/* 📊 CHART */}
        {history.length > 0 ? (
          <div className="bg-white p-4 rounded-xl shadow mb-6">
            <h2 className="font-bold mb-4">Health Score Trend</h2>

            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={history}>
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="health_score" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-gray-400 mb-6">
            No valid history yet. Run a health check.
          </p>
        )}

        {/* 📄 CLICKABLE HISTORY CARDS */}
        <div className="space-y-4">
          {history.map((item, i) => (
            <div
              key={i}
              onClick={() => navigate("/analysis", { state: item })}
              className="p-4 bg-white rounded-xl shadow hover:shadow-lg cursor-pointer transition border hover:border-blue-400"
            >
              <p><b>Disease:</b> {item.disease}</p>
              <p><b>Score:</b> {item.health_score}</p>
              <p><b>Risk:</b> {item.risk_level}</p>

              <p className="text-xs text-gray-400 mt-2">
                {item.date}
              </p>

              <p className="text-blue-500 text-sm mt-2">
                View Full Report →
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}