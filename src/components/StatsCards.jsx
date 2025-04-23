import React from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

export default function StatsCards({ trades }) {
  // Solo trades cerrados (con exit y closeDate)
  const closed = trades.filter(t => t.exit && t.closeDate);
  // Calcula resultado por trade
  function calcularResultado(trade) {
    const entry = parseFloat(trade.entry);
    const exit = parseFloat(trade.exit);
    const amount = parseFloat(trade.amount);
    if (!entry || !exit || !amount) return 0;
    if (trade.position === "Short") {
      return ((entry - exit) * amount) / entry;
    } else {
      return ((exit - entry) * amount) / entry;
    }
  }
  const totalTrades = trades.length;
  const totalProfit = closed.reduce((acc, t) => {
    const r = calcularResultado(t);
    return r > 0 ? acc + r : acc;
  }, 0);
  const totalLoss = closed.reduce((acc, t) => {
    const r = calcularResultado(t);
    return r < 0 ? acc + r : acc;
  }, 0);
  const netPnl = totalProfit + totalLoss;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-card rounded-lg p-6 flex flex-col gap-1 shadow">
        <span className="text-xs uppercase text-gray-400">Trades Totales</span>
        <span className="text-2xl font-bold">{totalTrades}</span>
      </div>
      <div className="bg-card rounded-lg p-6 flex flex-col gap-1 shadow">
        <span className="text-xs uppercase text-gray-400">Ganancias Totales</span>
        <span className="text-2xl font-bold text-profit flex items-center gap-2">
          ${totalProfit.toFixed(2)}
        </span>
      </div>
      <div className="bg-card rounded-lg p-6 flex flex-col gap-1 shadow">
        <span className="text-xs uppercase text-gray-400">Pérdidas Totales</span>
        <span className="text-2xl font-bold text-loss flex items-center gap-2">
          ${totalLoss.toFixed(2)}
        </span>
      </div>
      <div className="bg-card rounded-lg p-6 flex flex-col gap-1 shadow">
        <span className="text-xs uppercase text-gray-400">PnL Neto</span>
        <span className={`text-2xl font-bold flex items-center gap-2 ${netPnl >= 0 ? 'text-profit' : 'text-loss'}`}>
          {netPnl >= 0 ? '+' : ''}${netPnl.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
