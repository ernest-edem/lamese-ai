import { FiPlus, FiActivity, FiClock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ onCheckHealth }) {
  const navigate = useNavigate();

  const handleCheckHealth = () => {
    if (onCheckHealth) {
      // ✅ Dashboard: open modal
      onCheckHealth();
    } else {
      // ✅ Other pages: redirect to dashboard
      navigate("/");
    }
  };

  return (
    <div className="w-64 bg-gray-900 text-white p-6 flex flex-col min-h-screen">

      {/* LOGO */}
      <h2 className="text-xl font-bold mb-8 tracking-wide">
        LAMESE AI
      </h2>

      {/* CHECK HEALTH */}
      <button
        onClick={handleCheckHealth}
        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition"
      >
        <FiPlus />
        <span>Check Health</span>
      </button>

      {/* ANALYSIS */}
      <button
        onClick={() => navigate("/analysis")}
        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition mt-2"
      >
        <FiActivity />
        <span>Analysis</span>
      </button>

      {/* HISTORY */}
      <button
        onClick={() => navigate("/history")}
        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition mt-2"
      >
        <FiClock />
        <span>History</span>
      </button>

    </div>
  );
}