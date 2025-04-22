import React from "react";

export default function DashboardHeader({ onAddTrade }) {
  return (
    <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur shadow flex items-center justify-between px-6 py-4 border-b border-card">
      <h1 className="text-2xl font-bold tracking-tight">Crypto Trading Dashboard</h1>
      <button
        onClick={onAddTrade}
        className="bg-profit hover:bg-green-600 text-white font-semibold px-4 py-2 rounded transition-colors shadow"
      >
        + Añadir Trade
      </button>
    </header>
  );
}
