import React, { useState } from "react";
import DashboardHeader from "./components/DashboardHeader";
import StatsCards from "./components/StatsCards";
import LivePrices from "./components/LivePrices";
import BtcCandlesChart from "./components/BtcCandlesChart";
import TradesTable from "./components/TradesTable";
import TradeForm from "./components/TradeForm";
import TradesCharts from "./components/TradesCharts";
import useSupabaseTrades from "./hooks/useSupabaseTrades";

export default function App() {
  React.useEffect(() => {
    document.body.classList.add("dark");
    return () => document.body.classList.remove("dark");
  }, []);
  const [showForm, setShowForm] = useState(false);
  const { trades, loading, error, addTrade, deleteTrade, updateTrade } = useSupabaseTrades();

  return (
    <div className="min-h-screen bg-surface text-gray-100">
      <DashboardHeader onAddTrade={() => setShowForm(true)} />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        <LivePrices />
        <BtcCandlesChart />
        {error && <div className="text-center text-loss font-semibold">{error}</div>}
        {loading && <div className="text-center text-xs text-gray-400">Cargando trades...</div>}
        <StatsCards trades={trades} />
        <TradesTable trades={trades} deleteTrade={deleteTrade} updateTrade={updateTrade} />
        {/* Gráficos de trades */}
        <TradesCharts trades={trades} />
      </main>
      <TradeForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSave={addTrade}
      />
    </div>
  );
}
