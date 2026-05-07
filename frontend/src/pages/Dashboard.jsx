import {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

import { FiPlus } from "react-icons/fi";

import { useNavigate } from "react-router-dom";

import HealthCheckModal from "../components/HealthCheckModal";
import HealthScoreRing from "../components/HealthScoreRing";

import {
  getHistory,
  saveResult,
} from "../utils/storage";

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
  const [modalOpen, setModalOpen] =
    useState(false);

  const [history, setHistory] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const navigate = useNavigate();

  // =========================================
  // ✅ LOAD HISTORY
  // =========================================
  const loadHistory = useCallback(() => {
    try {
      const raw = getHistory() || [];

      // =====================================
      // ✅ CLEAN + NORMALIZE
      // =====================================
      const formatted = raw
        .filter(
          (item) =>
            item &&
            typeof item === "object" &&
            item.disease
        )

        .map((item) => ({
          ...item,

          date:
            item.date ||
            new Date().toISOString(),

          health_score:
            Number(
              item.health_score
            ) || 0,

          recommendation:
            Array.isArray(
              item.recommendation
            )
              ? item.recommendation
              : Array.isArray(
                  item.recommendations
                )
              ? item.recommendations
              : [],

          red_flags:
            Array.isArray(
              item.red_flags
            )
              ? item.red_flags
              : [],
        }))

        // =====================================
        // ✅ SORT NEWEST FIRST
        // =====================================
        .sort(
          (a, b) =>
            new Date(b.date) -
            new Date(a.date)
        );

      setHistory(formatted);

    } catch (err) {
      console.error(
        "Dashboard history error:",
        err
      );

      setHistory([]);
    }
  }, []);

  // =========================================
  // ✅ INITIAL LOAD
  // =========================================
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // =========================================
  // ✅ AUTO REFRESH
  // =========================================
  useEffect(() => {
    const handleFocus = () => {
      loadHistory();
    };

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, [loadHistory]);

  // =========================================
  // ✅ ALWAYS GET NEWEST ANALYSIS
  // =========================================
  const latest = useMemo(() => {
    if (!history.length) {
      return null;
    }

    return history[0];
  }, [history]);

  return (
    <div className="flex bg-gray-100 min-h-screen">

      {/* SIDEBAR */}
      <Sidebar
        onCheckHealth={() =>
          setModalOpen(true)
        }
      />

      {/* MAIN */}
      <div className="flex-1 p-6 overflow-y-auto">

        {/* HEADER */}
        <h1 className="text-3xl font-bold mb-6">
          Health AI Dashboard
        </h1>

        {/* ===================================== */}
        {/* ✅ LOADING */}
        {/* ===================================== */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">

            <div className="bg-white w-[400px] rounded-3xl shadow-2xl p-8 text-center">

              <div className="w-20 h-20 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-6">
                <span className="text-4xl">
                  🤖
                </span>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                AI Health Analysis
              </h2>

              <p className="text-gray-500 mb-6">
                LAMESE AI is analyzing
                symptoms, lifestyle,
                medical records, and
                risks...
              </p>

              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full w-1/2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>

              <p className="mt-4 text-sm text-blue-500">
                Generating medical
                insights...
              </p>
            </div>
          </div>
        )}

        {/* ===================================== */}
        {/* TOP SECTION */}
        {/* ===================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          {/* CHECK HEALTH */}
          <div className="flex items-center justify-center bg-white rounded-2xl shadow p-10">

            <button
              type="button"
              onClick={() =>
                setModalOpen(true)
              }
              className="w-32 h-32 rounded-full bg-blue-500 text-white flex flex-col items-center justify-center shadow-lg hover:bg-blue-600 transition"
            >
              <FiPlus size={32} />

              <span className="mt-2 text-sm">
                Check Health
              </span>
            </button>
          </div>

          {/* LATEST SCORE */}
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center justify-center">

            {latest ? (
              <>
                <HealthScoreRing
                  score={
                    latest.health_score
                  }
                />

                <p className="mt-3 font-bold text-lg">
                  Risk:{" "}
                  {latest.risk_level ||
                    "Unknown"}
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  {latest.disease}
                </p>

                <p className="text-xs text-gray-400 mt-2">
                  {latest.date
                    ? new Date(
                        latest.date
                      ).toLocaleString()
                    : ""}
                </p>
              </>
            ) : (
              <p className="text-gray-400">
                No analysis yet
              </p>
            )}
          </div>
        </div>

        {/* ===================================== */}
        {/* RECOMMENDATIONS */}
        {/* ===================================== */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8">

          <h2 className="text-xl font-bold mb-4">
            AI Recommendations
          </h2>

          {latest?.recommendation
            ?.length > 0 ? (
            <ul className="list-disc ml-5 space-y-2">

              {latest.recommendation.map(
                (rec, i) => (
                  <li key={i}>
                    {rec}
                  </li>
                )
              )}
            </ul>
          ) : (
            <p className="text-gray-400">
              No recommendations yet.
              Run a health check.
            </p>
          )}
        </div>

        {/* ===================================== */}
        {/* TREND GRAPH */}
        {/* ===================================== */}
        <div className="bg-white rounded-2xl shadow p-6">

          <h2 className="text-xl font-bold mb-4">
            Health Trend
          </h2>

          {history.length > 0 ? (
            <ResponsiveContainer
              width="100%"
              height={250}
            >
              <LineChart
                data={[...history].reverse()}
              >
                <XAxis
                  dataKey="date"
                  hide
                />

                <YAxis
                  domain={[0, 100]}
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="health_score"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400">
              No trend data available
            </p>
          )}
        </div>
      </div>

      {/* ===================================== */}
      {/* MODAL */}
      {/* ===================================== */}
      {modalOpen && (
        <HealthCheckModal
          onClose={() =>
            setModalOpen(false)
          }
          setLoading={setLoading}
          setResult={(data) => {
            try {

              // ===============================
              // IGNORE STREAMING
              // ===============================
              if (data?.streaming) {
                return;
              }

              // ===============================
              // VALIDATION
              // ===============================
              if (
                !data ||
                data.error ||
                !data.disease
              ) {
                console.error(
                  "Invalid result:",
                  data
                );

                setLoading(false);

                return;
              }

              // ===============================
              // NORMALIZE
              // ===============================
              const finalData = {
                ...data,

                health_score:
                  Number(
                    data.health_score
                  ) || 0,

                recommendation:
                  Array.isArray(
                    data.recommendation
                  )
                    ? data.recommendation
                    : Array.isArray(
                        data.recommendations
                      )
                    ? data.recommendations
                    : [],

                red_flags:
                  Array.isArray(
                    data.red_flags
                  )
                    ? data.red_flags
                    : [],

                // ✅ GUARANTEED NEW DATE
                date:
                  new Date().toISOString(),
              };

              // ===============================
              // SAVE TO STORAGE
              // ===============================
              saveResult(finalData);

              // ===============================
              // FORCE REFRESH HISTORY
              // ===============================
              loadHistory();

              // ===============================
              // CLOSE MODAL
              // ===============================
              setModalOpen(false);

              // ===============================
              // STOP LOADING
              // ===============================
              setLoading(false);

              // ===============================
              // REDIRECT
              // ===============================
              navigate("/analysis", {
                state: finalData,
              });

            } catch (err) {
              console.error(
                "Dashboard save error:",
                err
              );

              setLoading(false);
            }
          }}
        />
      )}
    </div>
  );
}