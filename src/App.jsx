import React, { useState } from "react";
import DashboardHeader from "./components/DashboardHeader";
import StatsCards from "./components/StatsCards";
import LivePrices from "./components/LivePrices";
import BtcCandlesChart from "./components/BtcCandlesChart";
import TradesTable from "./components/TradesTable";
import TradeForm from "./components/TradeForm";
import useLocalStorage from "./hooks/useLocalStorage";

export default function App() {
  React.useEffect(() => {
    document.body.classList.add("dark");
    return () => document.body.classList.remove("dark");
  }, []);
  const [trades, setTrades] = useLocalStorage("trades", []);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-surface text-gray-100">
      <DashboardHeader onAddTrade={() => setShowForm(true)} />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        <LivePrices />
        <BtcCandlesChart />
        <StatsCards trades={trades} />
        {/* Aquí irán PairPerformance, PnlChart, etc. */}
        <TradesTable trades={trades} setTrades={setTrades} />
      </main>
      <TradeForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSave={trade => setTrades([...trades, trade])}
      />
    </div>
  );
}
