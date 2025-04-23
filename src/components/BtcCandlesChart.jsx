import React, { useEffect, useState, useLayoutEffect, useRef } from "react";
import * as LightweightCharts from "lightweight-charts";

const intervals = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '4h', value: '4h' },
  { label: '1d', value: '1d' },
];
const intervalLabels = {
  '1m': '1 Minuto',
  '5m': '5 Minutos',
  '15m': '15 Minutos',
  '1h': '1 Hora',
  '4h': '4 Horas',
  '1d': '1 Día',
};

export default function BtcCandlesChart() {
  // Responsive: detecta si es móvil
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  const [intervalState, setIntervalState] = React.useState('4h');
  const [pair, setPair] = useState('BTC/USDT');
  const [pairs, setPairs] = useState([
    "BTC/USDT","ETH/USDT","SOL/USDT","BNB/USDT","XRP/USDT","DOGE/USDT","ADA/USDT","AVAX/USDT","MATIC/USDT","DOT/USDT"
  ]);
  const [filteredPairs, setFilteredPairs] = useState([
    "BTC/USDT","ETH/USDT","SOL/USDT","BNB/USDT","XRP/USDT","DOGE/USDT","ADA/USDT","AVAX/USDT","MATIC/USDT","DOT/USDT"
  ]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const intervalLabel = intervalLabels[intervalState] || intervalState;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chartContainerRef = useRef();
  const chartInstanceRef = useRef();

  // Fetch pares USDT de Binance (robusto)
  useEffect(() => {
    let active = true;
    fetch("https://api.binance.com/api/v3/exchangeInfo")
      .then(res => res.json())
      .then(data => {
        if (!active) return;
        const usdtPairs = data.symbols
          .filter(s => s.symbol.endsWith("USDT"))
          .map(s => s.symbol.replace("USDT", "/USDT"));
        setPairs(usdtPairs);
        setFilteredPairs(usdtPairs);
      })
      .catch(() => {
        // fallback: los 10 más populares
        setPairs([
          "BTC/USDT","ETH/USDT","SOL/USDT","BNB/USDT","XRP/USDT","DOGE/USDT","ADA/USDT","AVAX/USDT","MATIC/USDT","DOT/USDT"
        ]);
        setFilteredPairs([
          "BTC/USDT","ETH/USDT","SOL/USDT","BNB/USDT","XRP/USDT","DOGE/USDT","ADA/USDT","AVAX/USDT","MATIC/USDT","DOT/USDT"
        ]);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!pair) {
      setFilteredPairs(pairs);
      return;
    }
    setFilteredPairs(
      pairs.filter(p => p.toUpperCase().includes(pair.toUpperCase()))
    );
  }, [pair, pairs]);
  
  // Regex de par válido: 3-10 letras/números + "/USDT"
  function isValidPair(p) {
    return /^[A-Z0-9]{3,10}\/USDT$/.test(p);
  }

  useLayoutEffect(() => {
    if (!isValidPair(pair)) {
      setError(pair ? "Par inválido o incompleto" : "");
      setLoading(false);
      return;
    }
    let chart;
    let candleSeries;
    let resizeObserver;
    let destroyed = false;
    let intervalId;

    async function fetchCandlesAndUpdate() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${pair.replace('/','')}&interval=${intervalState}&limit=200`
        );
        if (!res.ok) throw new Error("No se pudieron cargar los datos de velas");
        const data = await res.json();
        if (destroyed) return;
        // Binance: [openTime, open, high, low, close, ...]
        const candles = data.map(d => ({
          time: Math.floor(d[0] / 1000),
          open: +d[1],
          high: +d[2],
          low: +d[3],
          close: +d[4],
        }));
        if (!chartContainerRef.current) return;
        if (!candles.length) throw new Error("Par inválido o sin datos");
        // Limpia el contenedor antes de crear el chart
        chartContainerRef.current.innerHTML = "";
        chart = LightweightCharts.createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth,
          height: isMobile ? 250 : 400,
          layout: {
            background: { color: "#0f172a" },
            textColor: "#e5e7eb",
            fontSize: isMobile ? 10 : 14,
          },
          grid: {
            vertLines: { color: "#1e293b" },
            horzLines: { color: "#1e293b" },
          },
          crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal,
          },
          timeScale: {
            borderColor: "#334155",
          },
          rightPriceScale: {
            borderColor: "#334155",
          },
        });
        chartInstanceRef.current = chart;
        candleSeries = chart.addCandlestickSeries({
          upColor: "#9ece6a", // Tokyo Night green
          downColor: "#f7768e", // Tokyo Night red
          borderUpColor: "#9ece6a",
          borderDownColor: "#f7768e",
          wickUpColor: "#9ece6a",
          wickDownColor: "#f7768e",
        });
        candleSeries.setData(candles);

        // Calcular y dibujar medias móviles
        function calcSMA(data, period) {
          const sma = [];
          for (let i = 0; i < data.length; i++) {
            if (i < period - 1) {
              sma.push({ time: data[i].time, value: null });
            } else {
              let sum = 0;
              for (let j = 0; j < period; j++) {
                sum += data[i - j].close;
              }
              sma.push({ time: data[i].time, value: +(sum / period).toFixed(2) });
            }
          }
          return sma;
        }
        const sma20 = calcSMA(candles, 20).filter(p => p.value !== null);
        const sma50 = calcSMA(candles, 50).filter(p => p.value !== null);
        const sma20Series = chart.addLineSeries({
          color: 'rgba(253,186,116,0.8)', // naranja pastel (#fdba74)
          lineWidth: 2,
          priceLineVisible: false,
          lastValueVisible: true,
        });
        sma20Series.setData(sma20);
        const sma50Series = chart.addLineSeries({
          color: 'rgba(125,211,252,0.8)', // celeste pastel (#7dd3fc)
          lineWidth: 2,
          priceLineVisible: false,
          lastValueVisible: true,
        });
        sma50Series.setData(sma50);
        setLoading(false);

        resizeObserver = new ResizeObserver(() => {
          if (chartContainerRef.current) {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth });
          }
        });
        resizeObserver.observe(chartContainerRef.current);
      } catch (e) {
        setError(e.message);
        setLoading(false);
      }
    }
    fetchCandlesAndUpdate();
    intervalId = setInterval(fetchCandlesAndUpdate, 10000);
    return () => {
      destroyed = true;
      if (resizeObserver && chartContainerRef.current) {
        resizeObserver.unobserve(chartContainerRef.current);
      }
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalState, pair]);

  return (
    <div className="w-full my-8 relative">
      <div className="flex items-center justify-between mb-2">
        <h2 className={`font-semibold text-gray-200 ${isMobile ? 'text-base' : 'text-lg'} hidden sm:block`}>{pair} - {intervalLabel}</h2>
        <div className={`flex items-center gap-6 ${isMobile ? 'text-xs' : ''}`}>
          {/* Input de par con autocompletado robusto */}
          <div className="relative">
            <input
              type="text"
              value={pair}
              autoComplete="off"
              onChange={e => {
                setPair(e.target.value.toUpperCase().replace(/[^A-Z0-9/]/g, ''));
                setShowSuggestions(true);
              }}
              className="bg-card border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-400 w-28 text-center shadow"
              placeholder="BTC/USDT"
              style={{letterSpacing: '1px'}}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
            />
            {showSuggestions && filteredPairs.length > 0 && (
              <ul className="absolute z-30 left-0 w-full bg-card border border-slate-700 max-h-40 overflow-auto rounded shadow-lg mt-1 text-xs">
                {filteredPairs.slice(0, 30).map(p => (
                  <li
                    key={p}
                    className={`px-3 py-2 cursor-pointer hover:bg-slate-700 ${pair === p ? 'bg-slate-800 text-white' : 'text-slate-200'}`}
                    onMouseDown={() => {
                      setPair(p);
                      setShowSuggestions(false);
                    }}
                  >
                    {p}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Selector de temporalidad */}
          <div className="flex gap-1 bg-card rounded px-2 py-1 border border-slate-700">
            {intervals.map((intv) => (
              <button
                key={intv.value}
                onClick={() => setIntervalState(intv.value)}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors duration-100 focus:outline-none ${intervalState === intv.value ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
                style={{letterSpacing: '0.5px'}}>
                {intv.label}
              </button>
            ))}
          </div>
          {/* Leyenda SMA */}
          <div className="hidden sm:flex gap-4 text-xs select-none">
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full" style={{background:'rgba(253,186,116,0.8)'}}></span><span className="text-gray-300">SMA 20</span></span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full" style={{background:'rgba(125,211,252,0.8)'}}></span><span className="text-gray-300">SMA 50</span></span>
          </div>
        </div>
      </div>
      <div
        ref={chartContainerRef}
        className="w-full rounded-lg shadow bg-card"
        style={{ height: isMobile ? 220 : 400, minHeight: isMobile ? 120 : 250, maxHeight: isMobile ? 220 : undefined }}
      />

      {/* Mensaje de error bajo el input si el par es inválido o no hay datos */}
      {error && (
        <div className="text-center text-loss mt-2">{error}</div>
      )}
    </div>
  );
}
