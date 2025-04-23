import React from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

export default function StatsCards({ trades }) {
  const totalTrades = trades.length;
  const totalProfit = trades.reduce((acc, t) => acc + (parseFloat(t.result) > 0 ? parseFloat(t.result) : 0), 0);
  const totalLoss = trades.reduce((acc, t) => acc + (parseFloat(t.result) < 0 ? parseFloat(t.result) : 0), 0);
  const netPnl = totalProfit + totalLoss;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-card rounded-lg p-6 flex flex-col gap-1 shadow">
        <span className="text-xs uppercase text-gray-400">Total Trades</span>
        <span className="text-2xl font-bold">{totalTrades}</span>
      </div>
      <div className="bg-card rounded-lg p-6 flex flex-col gap-1 shadow">
        <span className="text-xs uppercase text-gray-400">Ganancias Totales</span>
        <span className="text-2xl font-bold text-profit flex items-center gap-2">
          ${totalProfit.toFixed(2)}
          {totalProfit > 0 && <FaArrowUp className="inline text-profit" />}
        </span>
      </div>
      <div className="bg-card rounded-lg p-6 flex flex-col gap-1 shadow">
        <span className="text-xs uppercase text-gray-400">Pérdidas Totales</span>
        <span className="text-2xl font-bold text-loss flex items-center gap-2">
          ${totalLoss.toFixed(2)}
          {totalLoss < 0 && <FaArrowDown className="inline text-loss" />}
        </span>
      </div>
      <div className="bg-card rounded-lg p-6 flex flex-col gap-1 shadow col-span-1 sm:col-span-3">
        <span className="text-xs uppercase text-gray-400">PnL Neto</span>
        <span className={`text-2xl font-bold flex items-center gap-2 ${netPnl >= 0 ? 'text-profit' : 'text-loss'}`}>
          {netPnl >= 0 ? '+' : ''}${netPnl.toFixed(2)}
          {netPnl > 0 && <FaArrowUp className="inline text-profit" />}
          {netPnl < 0 && <FaArrowDown className="inline text-loss" />}
        </span>
      </div>
    </div>
  );
}
