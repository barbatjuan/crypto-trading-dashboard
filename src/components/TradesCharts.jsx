import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

function getPnLSeries(trades) {
  // Ordena por fecha de cierre
  const closed = trades.filter(t => t.exit && t.closeDate).sort((a, b) => new Date(a.closeDate) - new Date(b.closeDate));
  let acc = 0;
  return closed.map(t => {
    const entry = parseFloat(t.entry);
    const exit = parseFloat(t.exit);
    const amount = parseFloat(t.amount);
    if (!entry || !exit || !amount) return null;
    const result = t.position === "Short"
      ? ((entry - exit) * amount) / entry
      : ((exit - entry) * amount) / entry;
    acc += result;
    return {
      date: t.closeDate,
      pnl: acc,
    };
  }).filter(Boolean);
}

function getPnLByPair(trades) {
  const closed = trades.filter(t => t.exit && t.closeDate);
  const pairMap = {};
  closed.forEach(t => {
    const entry = parseFloat(t.entry);
    const exit = parseFloat(t.exit);
    const amount = parseFloat(t.amount);
    if (!entry || !exit || !amount) return;
    const result = t.position === "Short"
      ? ((entry - exit) * amount) / entry
      : ((exit - entry) * amount) / entry;
    if (!pairMap[t.pair]) pairMap[t.pair] = 0;
    pairMap[t.pair] += result;
  });
  return Object.entries(pairMap).map(([pair, pnl]) => ({ pair, pnl }));
}

// Paleta de colores para el gráfico de torta
const COLORS = [
  '#7dd3fc', // celeste pastel
  '#c4b5fd', // lila suave
  '#6ee7b7', // verde menta
  '#f9a8d4', // rosa suave
  '#fde68a', // amarillo pastel
  '#a7f3d0', // turquesa pastel
  '#fbcfe8', // rosa claro
  '#fef08a', // amarillo claro
  '#fca5a5', // coral pastel
  '#93c5fd', // azul claro
];

export default function TradesCharts({ trades }) {
  const pnlSeries = getPnLSeries(trades);
  const pnlByPair = getPnLByPair(trades);

  return (
    <div className="grid md:grid-cols-2 gap-6 mt-8">
      <div className="bg-card rounded-xl p-4 shadow border border-slate-800">
        <h3 className="text-sm font-bold mb-2 text-gray-300">Evolución PnL Acumulado</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={pnlSeries}>
            <CartesianGrid strokeDasharray="3 3" stroke="#23262f" />
            <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[dataMin => Math.min(0, dataMin), 'auto']} />
            <Tooltip contentStyle={{ background: '#181f2a', border: 'none', color: '#f1f5f9' }} />
            <Line type="monotone" dataKey="pnl" stroke="#22c55e" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-card rounded-xl p-4 shadow border border-slate-800">
        <h3 className="text-sm font-bold mb-2 text-gray-300">PnL por Par (Proporción)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={pnlByPair}
              dataKey="pnl"
              nameKey="pair"
              cx="50%"
              cy="50%"
              outerRadius={110}
              label={({ name }) => name}
              isAnimationActive={true}
              labelLine={{ stroke: "#23272f", strokeWidth: 2 }}
            >
              {pnlByPair.map((entry, idx) => (
                <Cell
                  key={`cell-${idx}`}
                  fill={COLORS[idx % COLORS.length]}
                  stroke="#23272f"
                  strokeWidth={4}
                  style={{
                    filter: 'drop-shadow(0 2px 8px rgba(30,41,59,0.08))',
                    transition: 'transform 0.15s',
                    cursor: 'pointer',
                  }}
                  onMouseOver={e => {
                    if (e && e.target) e.target.setAttribute('transform', 'scale(1.05)');
                  }}
                  onMouseOut={e => {
                    if (e && e.target) e.target.setAttribute('transform', 'scale(1)');
                  }}
                />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: '#181f2a', border: 'none', color: '#f1f5f9' }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
