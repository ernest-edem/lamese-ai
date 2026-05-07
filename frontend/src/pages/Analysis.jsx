import { useLocation, useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import HealthScoreRing from "../components/HealthScoreRing";

import { getHistory } from "../utils/storage";

import jsPDF from "jspdf";

export default function Analysis() {
  const location = useLocation();

  const navigate = useNavigate();

  const [result, setResult] =
    useState(null);

  // =========================================
  // ✅ LOAD MOST RECENT ANALYSIS
  // =========================================
  useEffect(() => {
    try {
      const rawHistory =
        getHistory() || [];

      // =====================================
      // ✅ CLEAN + SORT NEWEST FIRST
      // =====================================
      const history = rawHistory
        .filter(
          (item) =>
            item &&
            typeof item === "object" &&
            item.disease
        )

        .map((item) => ({
          ...item,

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

          date:
            item.date ||
            new Date().toISOString(),
        }))

        // ✅ SORT NEWEST FIRST
        .sort(
          (a, b) =>
            new Date(b.date) -
            new Date(a.date)
        );

      // =====================================
      // ✅ PRIORITY:
      // CURRENT ANALYSIS RESULT
      // =====================================
      if (
        location.state &&
        location.state.disease
      ) {
        setResult({
          ...location.state,

          recommendation:
            Array.isArray(
              location.state
                .recommendation
            )
              ? location.state
                  .recommendation
              : [],
        });

        return;
      }

      // =====================================
      // ✅ FALLBACK TO NEWEST RESULT
      // =====================================
      const latest = history[0];

      if (latest) {
        setResult(latest);
      }

    } catch (err) {
      console.error(
        "Analysis load error:",
        err
      );
    }
  }, [location.state]);

  // =========================================
  // 📄 PDF GENERATOR
  // =========================================
  const downloadPDF = () => {
    try {
      const doc = new jsPDF();

      const pageWidth =
        doc.internal.pageSize.getWidth();

      // HEADER
      doc.setFillColor(37, 99, 235);

      doc.rect(
        0,
        0,
        pageWidth,
        30,
        "F"
      );

      doc.setTextColor(
        255,
        255,
        255
      );

      doc.setFontSize(18);

      doc.text(
        "LAMESE AI Health Report",
        20,
        20
      );

      doc.setTextColor(0, 0, 0);

      // DATE
      doc.setFontSize(12);

      doc.text(
        `Date: ${
          result?.date
            ? new Date(
                result.date
              ).toLocaleString()
            : "N/A"
        }`,
        20,
        40
      );

      // SCORE BOX
      let color = [34, 197, 94];

      if (
        result?.risk_level === "High"
      ) {
        color = [220, 38, 38];
      } else if (
        result?.risk_level ===
        "Medium"
      ) {
        color = [234, 179, 8];
      }

      doc.setFillColor(...color);

      doc.roundedRect(
        20,
        50,
        170,
        25,
        5,
        5,
        "F"
      );

      doc.setTextColor(
        255,
        255,
        255
      );

      doc.setFontSize(14);

      doc.text(
        `Health Score: ${
          result?.health_score || 0
        } | Risk: ${
          result?.risk_level ||
          "N/A"
        }`,
        25,
        65
      );

      doc.setTextColor(0, 0, 0);

      // DISEASE
      doc.setFontSize(14);

      doc.text(
        "Predicted Condition",
        20,
        90
      );

      doc.setFontSize(12);

      doc.text(
        result?.disease || "N/A",
        20,
        100
      );

      // RED FLAGS
      let y = 120;

      if (
        result?.red_flags?.length >
        0
      ) {
        doc.setTextColor(
          220,
          38,
          38
        );

        doc.setFontSize(14);

        doc.text(
          "Red Flags",
          20,
          y
        );

        doc.setTextColor(0, 0, 0);

        doc.setFontSize(11);

        result.red_flags.forEach(
          (flag, i) => {
            doc.text(
              `- ${flag}`,
              25,
              y + 10 + i * 8
            );
          }
        );

        y +=
          20 +
          result.red_flags.length *
            8;
      }

      // EXPLANATION
      doc.setFontSize(14);

      doc.text(
        "Explanation",
        20,
        y
      );

      doc.setFontSize(11);

      const explanation =
        result?.explanation ||
        "N/A";

      const splitExplanation =
        doc.splitTextToSize(
          explanation,
          170
        );

      doc.text(
        splitExplanation,
        20,
        y + 10
      );

      // RECOMMENDATIONS
      y +=
        splitExplanation.length * 6 +
        25;

      doc.setFontSize(14);

      doc.text(
        "Recommendations",
        20,
        y
      );

      doc.setFontSize(11);

      (
        result?.recommendation ||
        []
      ).forEach((rec, i) => {
        doc.text(
          `• ${rec}`,
          25,
          y + 10 + i * 8
        );
      });

      // FOOTER
      doc.setFontSize(9);

      doc.setTextColor(100);

      doc.text(
        "Disclaimer: AI-generated. Not a substitute for professional medical advice.",
        20,
        280,
        {
          maxWidth: 170,
        }
      );

      doc.save(
        "LAMESE-Health-Report.pdf"
      );

    } catch (err) {
      console.error(
        "PDF ERROR:",
        err
      );

      alert(
        "PDF generation failed"
      );
    }
  };

  // =========================================
  // 🚫 NO DATA
  // =========================================
  if (
    !result ||
    typeof result !== "object"
  ) {
    return (
      <div className="flex">

        <Sidebar />

        <div className="p-6">

          <h1 className="text-2xl font-bold">
            No Analysis Found
          </h1>

          <button
            onClick={() =>
              navigate("/")
            }
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // =========================================
  // 🎨 RISK COLOR
  // =========================================
  const riskColor =
    result.risk_level === "High"
      ? "text-red-600"
      : result.risk_level ===
        "Medium"
      ? "text-yellow-500"
      : "text-green-600";

  return (
    <div className="flex bg-gray-100 min-h-screen">

      <Sidebar />

      <div className="flex-1 p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">

          <div>
            <h1 className="text-3xl font-bold">
              Health Analysis Report
            </h1>

            <p className="text-gray-500">
              {result.date
                ? new Date(
                    result.date
                  ).toLocaleString()
                : "No timestamp"}
            </p>
          </div>

          <button
            onClick={downloadPDF}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Download PDF
          </button>
        </div>

        {/* ALERT */}
        {result.risk_level ===
          "High" && (
          <div className="mb-6 p-4 rounded-xl bg-red-600 text-white animate-pulse">

            🚨 HIGH RISK DETECTED –
            Seek immediate care
          </div>
        )}

        {/* TOP CARDS */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">

          <div className="bg-white p-6 rounded-2xl shadow flex flex-col items-center">

            <HealthScoreRing
              score={
                result.health_score ||
                0
              }
            />

            <p
              className={`mt-3 font-bold ${riskColor}`}
            >
              {result.risk_level} Risk
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow flex flex-col justify-center">

            <h2 className="text-gray-500">
              Condition
            </h2>

            <p className="text-2xl font-bold text-blue-600">
              {result.disease}
            </p>
          </div>
        </div>

        {/* RED FLAGS */}
        {result.red_flags?.length >
          0 && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded">

            <h2 className="font-bold text-red-600 mb-2">
              ⚠️ Red Flags
            </h2>

            <ul className="list-disc ml-5">

              {result.red_flags.map(
                (f, i) => (
                  <li key={i}>
                    {f}
                  </li>
                )
              )}
            </ul>
          </div>
        )}

        {/* EXPLANATION */}
        <div className="bg-white p-6 rounded-2xl shadow mb-6">

          <h2 className="font-bold mb-2">
            Explanation
          </h2>

          <p>
            {result.explanation}
          </p>
        </div>

        {/* RECOMMENDATIONS */}
        <div className="bg-white p-6 rounded-2xl shadow">

          <h2 className="font-bold mb-2">
            Recommendations
          </h2>

          <ul className="list-disc ml-5">

            {(
              result.recommendation ||
              []
            ).map((r, i) => (
              <li key={i}>
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}