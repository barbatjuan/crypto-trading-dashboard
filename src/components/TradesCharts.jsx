import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
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
  '#1e66f5', // azul eléctrico fuerte
  '#f7768e', // magenta fuerte
  '#2ac3de', // cian
  '#bb9af7', // violeta
  '#e0af68', // amarillo
  '#9ece6a', // verde lima
  '#ff9e64', // naranja
  '#b4f9f8', // aqua
  '#7aa2f7', // azul tokyo night
  '#c53b53', // rojo saturado
];

export default function TradesCharts({ trades }) {
  // Responsive: detecta si es móvil
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  const pnlSeries = getPnLSeries(trades);
  const pnlByPair = getPnLByPair(trades);

  return (
    <div className="grid md:grid-cols-2 gap-6 mt-8">
      <div className="bg-card rounded-xl p-4 shadow border border-slate-800">
        <h3 className="text-sm font-bold mb-2 text-[#7aa2f7]">Evolución PnL Acumulado</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={pnlSeries}>
            <CartesianGrid strokeDasharray="3 3" stroke="#23262f" />
            <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[dataMin => Math.min(0, dataMin), 'auto']} />
            <Tooltip 
  contentStyle={{ background: '#181f2a', border: 'none', color: '#f1f5f9' }}
  formatter={(value, name) => {
    if (name === 'pnl') {
      return [`${parseFloat(value).toFixed(2)}`, 'PnL'];
    }
    return [value, name];
  }}
/>
            <defs>
              <linearGradient id="pnlAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9ece6a" stopOpacity="0.8" />
                <stop offset="55%" stopColor="#9ece6a" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#9ece6a" stopOpacity="0.03" />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="pnl"
              stroke="none"
              fill="url(#pnlAreaGradient)"
              isAnimationActive={true}
              fillOpacity={1}
              baseLine={0}
            />
            <Line type="monotone" dataKey="pnl" stroke="#9ece6a" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-card rounded-xl p-4 shadow border border-slate-800">
        <h3 className="text-sm font-bold mb-2 text-gray-300">PnL por Par (Proporción)</h3>
        {isMobile ? (
          <>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pnlByPair}
                  dataKey="pnl"
                  nameKey="pair"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  isAnimationActive={true}
                  labelLine={{ stroke: "#23272f", strokeWidth: 2 }}
                >
                  {pnlByPair.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={COLORS[idx % COLORS.length]}
                      stroke="none"
                      style={{
                        filter: 'drop-shadow(rgba(30, 41, 59, 0.08) 0px 2px 8px)',
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
                <Tooltip 
  contentStyle={{ background: '#181f2a', border: 'none', color: '#f1f5f9' }}
  formatter={(value, name) => {
    if (name === 'pnl') {
      return [`${parseFloat(value).toFixed(2)}`, 'PnL'];
    }
    return [value, name];
  }}
/>
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {pnlByPair.map((entry, idx) => (
                <div
                  key={entry.pair}
                  className="flex flex-col items-center justify-center rounded-lg px-2 py-1 min-w-0 w-full"
                  style={{
                    background: 'rgba(30,102,245,0.07)',
                    borderLeft: `4px solid ${COLORS[idx % COLORS.length]}`,
                    fontSize: '0.82rem',
                    lineHeight: 1.1,
                  }}
                >
                  <span className="font-mono text-xs text-gray-200 truncate w-full overflow-hidden text-ellipsis" style={{ color: COLORS[idx % COLORS.length], fontWeight: 700 }}>{entry.pair}</span>
                  <span className="font-mono text-xs text-gray-300 truncate w-full overflow-hidden text-ellipsis">{entry.pnl >= 0 ? '+' : ''}{entry.pnl.toFixed(2)} USDT</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-row items-start gap-4">
            <div className="flex-1 min-w-0">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pnlByPair}
                    dataKey="pnl"
                    nameKey="pair"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    isAnimationActive={true}
                    labelLine={{ stroke: "#23272f", strokeWidth: 2 }}
                  >
                    {pnlByPair.map((entry, idx) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={COLORS[idx % COLORS.length]}
                        stroke="none"
                        style={{
                          filter: 'drop-shadow(rgba(30, 41, 59, 0.08) 0px 2px 8px)',
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
                  <Tooltip 
    contentStyle={{ background: '#181f2a', border: 'none', color: '#f1f5f9' }}
    formatter={(value, name) => {
      if (name === 'pnl') {
        return [`${parseFloat(value).toFixed(2)}`, 'PnL'];
      }
      return [value, name];
    }}
  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2 min-w-[120px]">
              {pnlByPair.map((entry, idx) => (
                <div
                  key={entry.pair}
                  className="flex flex-col items-center justify-center rounded-lg px-2 py-1 min-w-0 w-full"
                  style={{
                    background: 'rgba(30,102,245,0.07)',
                    borderLeft: `4px solid ${COLORS[idx % COLORS.length]}`,
                    fontSize: '0.82rem',
                    lineHeight: 1.1,
                  }}
                >
                  <span className="font-mono text-xs text-gray-200 truncate w-full overflow-hidden text-ellipsis" style={{ color: COLORS[idx % COLORS.length], fontWeight: 700 }}>{entry.pair}</span>
                  <span className="font-mono text-xs text-gray-300 truncate w-full overflow-hidden text-ellipsis">{entry.pnl >= 0 ? '+' : ''}{entry.pnl.toFixed(2)} USDT</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
