import { useEffect, useState } from "react";
import { getHistory } from "../utils/Storage";
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

  useEffect(() => {
    const data = getHistory();

    // ✅ Ensure chart has valid format
    const formatted = data.map((item, index) => ({
      ...item,
      date: index + 1, // simple numeric x-axis
    }));

    setHistory(formatted);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Health History</h1>

      {/* 📊 Chart */}
      {history.length > 0 && (
        <div className="bg-white p-4 rounded shadow mb-6">
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
      )}

      {/* 📄 History Cards */}
      <div className="space-y-4">
        {history.map((item, i) => (
          <div key={i} className="p-4 bg-white rounded shadow">
            <p><b>Disease:</b> {item.disease}</p>
            <p><b>Score:</b> {item.health_score}</p>
            <p><b>Risk:</b> {item.risk_level}</p>
          </div>
        ))}
      </div>
    </div>
  );
}