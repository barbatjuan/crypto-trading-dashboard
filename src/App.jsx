import React, { useState, useEffect } from "react";
import DashboardHeader from "./components/DashboardHeader";
import StatsCards from "./components/StatsCards";
import LivePrices from "./components/LivePrices";
import BtcCandlesChart from "./components/BtcCandlesChart";
import TradesTable from "./components/TradesTable";
import TradeForm from "./components/TradeForm";
import TradesCharts from "./components/TradesCharts";
import useSupabaseTrades from "./hooks/useSupabaseTrades";
import { supabase } from "./supabaseClient";
import Login from "./components/Login";

export default function App() {
  useEffect(() => {
    document.body.classList.add("dark");
    return () => document.body.classList.remove("dark");
  }, []);

  const [showForm, setShowForm] = useState(false);
  const { trades, loading, error, addTrade, deleteTrade, updateTrade } = useSupabaseTrades();

  const [session, setSession] = useState(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  function handleLogout() {
    supabase.auth.signOut();
  }

  if (!session) {
    return <Login onLogin={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-surface text-gray-100">
      <DashboardHeader onAddTrade={() => setShowForm(true)} onLogout={handleLogout} />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        <LivePrices />
        <BtcCandlesChart />
        {error && <div className="text-center text-loss font-semibold">{error}</div>}
        {loading && <div className="text-center text-xs text-gray-400">Cargando trades...</div>}
        <StatsCards trades={trades} />
        {/* Tabla Spot */}
        <h2 className="mt-8 mb-2 text-lg font-bold text-[#7aa2f7]">Trades Spot</h2>
        <TradesTable trades={trades.filter(t => t.type === "Spot")} deleteTrade={deleteTrade} updateTrade={updateTrade} />
        {/* Tabla Futuros */}
        <h2 className="mt-8 mb-2 text-lg font-bold text-[#e0af68]">Trades Futuros</h2>
        <TradesTable trades={trades.filter(t => t.type === "Futuros")} deleteTrade={deleteTrade} updateTrade={updateTrade} />
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

