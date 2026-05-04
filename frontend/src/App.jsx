import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";

export default function App() {
  const [page, setPage] = useState("dashboard");

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar setPage={setPage} />

      <main className="flex-1 p-6">
        {page === "dashboard" && <Dashboard />}
        {page === "history" && <History />}
      </main>
    </div>
  );
}