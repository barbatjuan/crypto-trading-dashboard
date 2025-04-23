import React from "react";

export default function DashboardHeader({ onAddTrade }) {
  return (
    <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur shadow flex items-center justify-between px-6 py-4 border-b border-card">
      <h1 className="text-2xl font-bold tracking-tight">Crypto Trading Dashboard</h1>
      <button
        onClick={onAddTrade}
        className="bg-[#9ece6a] hover:bg-[#7aa64c] text-surface font-semibold px-4 py-2 rounded transition-colors shadow"
        >
        + Añadir Trade
      </button>
    </header>
  );
}
