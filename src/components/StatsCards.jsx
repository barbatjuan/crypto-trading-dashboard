import React from "react";
import { FaChartBar, FaDollarSign, FaArrowUp, FaArrowDown, FaMedal, FaWallet, FaPercent, FaStar, FaRegThumbsUp, FaRegThumbsDown, FaClock } from "react-icons/fa";

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

  // Mejor par
  let bestPair = '-';
  let bestPairPnl = 0;
  if (closed.length > 0) {
    const pairPnls = {};
    closed.forEach(t => {
      if (!pairPnls[t.pair]) pairPnls[t.pair] = 0;
      pairPnls[t.pair] += calcularResultado(t);
    });
    const best = Object.entries(pairPnls).sort((a, b) => b[1] - a[1])[0];
    if (best) {
      bestPair = best[0];
      bestPairPnl = best[1];
    }
  }
  // % crecimiento cartera (asume monto inicial igual a suma de amount de primeros trades cerrados, o pide 1000 si no hay trades)
  const initialCapital = closed.length > 0 ? closed[0].amount ? parseFloat(closed[0].amount) : 1000 : 1000;
  const growthPct = initialCapital ? (netPnl / initialCapital) * 100 : 0;
  // Winrate
  const wins = closed.filter(t => calcularResultado(t) > 0).length;
  const winrate = closed.length > 0 ? (wins / closed.length) * 100 : 0;
  // Mejor trade
  let bestTrade = null;
  let bestTradeVal = null;
  if (closed.length > 0) {
    bestTrade = closed.reduce((a, b) => (calcularResultado(a) > calcularResultado(b) ? a : b));
    bestTradeVal = calcularResultado(bestTrade);
  }
  // Peor trade
  let worstTrade = null;
  let worstTradeVal = null;
  if (closed.length > 0) {
    worstTrade = closed.reduce((a, b) => (calcularResultado(a) < calcularResultado(b) ? a : b));
    worstTradeVal = calcularResultado(worstTrade);
  }
  // Promedio días por trade cerrado
  const avgDays = closed.length > 0 ? (closed.reduce((acc, t) => {
    if (t.openDate && t.closeDate) {
      const d1 = new Date(t.openDate);
      const d2 = new Date(t.closeDate);
      return acc + Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)));
    }
    return acc;
  }, 0) / closed.length).toFixed(1) : '-';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 grid-rows-2 gap-3">
      {/* Fila 1 */}
      <div className="bg-card rounded-xl px-3 py-4 flex flex-col gap-0.5 items-center shadow border border-slate-800 hover:border-green-500 transition-all duration-150" title="Cantidad total de operaciones registradas">
        <span className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Trades Totales</span>
        <span className="flex items-center gap-1 text-lg font-semibold tracking-tight text-slate-50"><FaChartBar className="inline text-slate-400 text-base" />{totalTrades}</span>
      </div>
      <div className="bg-card rounded-xl px-3 py-4 flex flex-col gap-0.5 items-center shadow border border-slate-800 hover:border-green-500 transition-all duration-150" title="Suma de todas las ganancias de trades cerrados">
        <span className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Ganancias Totales</span>
        <span className="flex items-center gap-1 text-lg font-semibold tracking-tight text-profit"><FaArrowUp className="inline text-profit text-base" />${totalProfit.toFixed(2)}</span>
      </div>
      <div className="bg-card rounded-xl px-3 py-4 flex flex-col gap-0.5 items-center shadow border border-slate-800 hover:border-green-500 transition-all duration-150" title="Suma de todas las pérdidas de trades cerrados">
        <span className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Pérdidas Totales</span>
        <span className="flex items-center gap-1 text-lg font-semibold tracking-tight text-loss"><FaArrowDown className="inline text-loss text-base" />${totalLoss.toFixed(2)}</span>
      </div>
      <div className="bg-card rounded-xl px-3 py-4 flex flex-col gap-0.5 items-center shadow border border-slate-800 hover:border-green-500 transition-all duration-150" title="Resultado neto (ganancias - pérdidas) de todos los trades cerrados">
        <span className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">PnL Neto</span>
        <span className={`flex items-center gap-1 text-lg font-semibold tracking-tight ${netPnl >= 0 ? 'text-profit' : 'text-loss'}`}><FaWallet className="inline text-slate-400 text-base" />{netPnl >= 0 ? '+' : ''}${netPnl.toFixed(2)}</span>
      </div>
      <div className="bg-card rounded-xl px-3 py-4 flex flex-col gap-0.5 items-center shadow border border-slate-800 hover:border-green-500 transition-all duration-150" title="Par con mayor ganancia acumulada">
        <span className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Mejor Par</span>
        <span className="flex items-center gap-1 text-lg font-semibold tracking-tight"><FaMedal className="inline text-slate-400 text-base" />{bestPair !== '-' ? bestPair : '-'}</span>
      </div>
      {/* Fila 2 */}
      <div className="bg-card rounded-xl px-3 py-4 flex flex-col gap-0.5 items-center shadow border border-slate-800 hover:border-green-500 transition-all duration-150" title="Porcentaje de crecimiento de la cartera respecto al capital inicial">
        <span className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">% Crecimiento Cartera</span>
        <span className={`flex items-center gap-1 text-lg font-semibold tracking-tight ${growthPct >= 0 ? 'text-profit' : 'text-loss'}`}><FaPercent className="inline text-slate-400 text-base" />{growthPct >= 0 ? '+' : ''}{growthPct.toFixed(2)}%</span>
      </div>
      <div className="bg-card rounded-xl px-3 py-4 flex flex-col gap-0.5 items-center shadow border border-slate-800 hover:border-green-500 transition-all duration-150" title="Porcentaje de trades cerrados con resultado positivo">
        <span className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Winrate</span>
        <span className="flex items-center gap-1 text-lg font-semibold tracking-tight"><FaStar className="inline text-slate-400 text-base" />{winrate.toFixed(1)}%</span>
      </div>
      <div className="bg-card rounded-xl px-3 py-4 flex flex-col gap-0.5 items-center shadow border border-slate-800 hover:border-green-500 transition-all duration-150" title="Trade con mayor ganancia individual">
        <span className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Mejor Trade</span>
        <span className="flex items-center gap-1 text-lg font-semibold tracking-tight text-profit"><FaRegThumbsUp className="inline text-profit text-base" />{bestTradeVal !== null ? `$${bestTradeVal.toFixed(2)}` : '-'}</span>
      </div>
      <div className="bg-card rounded-xl px-3 py-4 flex flex-col gap-0.5 items-center shadow border border-slate-800 hover:border-green-500 transition-all duration-150" title="Trade con mayor pérdida individual">
        <span className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Peor Trade</span>
        <span className="flex items-center gap-1 text-lg font-semibold tracking-tight text-loss"><FaRegThumbsDown className="inline text-loss text-base" />{worstTradeVal !== null ? `$${worstTradeVal.toFixed(2)}` : '-'}</span>
      </div>
      <div className="bg-card rounded-xl px-3 py-4 flex flex-col gap-0.5 items-center shadow border border-slate-800 hover:border-green-500 transition-all duration-150" title="Promedio de días entre apertura y cierre de los trades cerrados">
        <span className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Promedio Días</span>
        <span className="flex items-center gap-1 text-lg font-semibold tracking-tight"><FaClock className="inline text-slate-400 text-base" />{avgDays}</span>
      </div>
    </div>
  );
}
