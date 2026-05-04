import { FiActivity, FiClock, FiUser } from "react-icons/fi";

export default function Sidebar({ setPage }) {
  return (
    <aside className="w-64 bg-gray-900 text-white p-5 hidden md:flex flex-col">
      {/* User */}
      <div className="flex items-center space-x-3 mb-10">
        <FiUser size={30} />
        <div>
          <p className="font-semibold">User</p>
          <p className="text-sm text-gray-400">ID: 001</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="space-y-4">
        <button
          onClick={() => setPage("dashboard")}
          className="flex items-center w-full p-3 rounded hover:bg-gray-700"
        >
          <FiActivity className="mr-2" /> Check Health
        </button>

        <button
          onClick={() => setPage("history")}
          className="flex items-center w-full p-3 rounded hover:bg-gray-700"
        >
          <FiClock className="mr-2" /> History
        </button>
      </nav>
    </aside>
  );
}