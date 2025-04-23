import React, { useEffect, useRef, useState } from "react";
import * as LightweightCharts from "lightweight-charts";

export default function BtcCandlesChart() {
  const [isMobile, setIsMobile] = useState(false);
  const chartContainerRef = useRef();
  const [error, setError] = useState(null);

  // --- Pair and Interval State ---
  const [pair, setPair] = useState('BTCUSDT');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredPairs, setFilteredPairs] = useState([]);
  const [interval, setIntervalState] = useState('4h');

  // List of available pairs (for demo: a short list, can be replaced with a real fetch)
  const allPairs = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT', 'XRPUSDT',
    'DOGEUSDT', 'MATICUSDT', 'DOTUSDT', 'TRXUSDT', 'AVAXUSDT', 'LTCUSDT', 'SHIBUSDT', 'LINKUSDT', 'OPUSDT', 'ARBUSDT', 'PEPEUSDT', 'WIFUSDT', 'TONUSDT', 'SEIUSDT', 'TIAUSDT', 'RNDRUSDT', 'INJUSDT', 'JUPUSDT', 'PYTHUSDT', 'STRKUSDT', 'SUIUSDT', 'BLURUSDT', 'UNIUSDT', 'AAVEUSDT', 'LDOUSDT', 'STXUSDT', 'BCHUSDT', 'ETCUSDT', 'FILUSDT', 'MKRUSDT', 'GRTUSDT', 'APTUSDT', 'IMXUSDT', 'CAKEUSDT', 'MANTAUSDT', 'DYDXUSDT', '1000SATSUSDT', '1000FLOKIUSDT', '1000BONKUSDT', '1000LUNCUSDT', '1000XECUSDT', '1000SHIBUSDT', '1000PEPEUSDT', '1000FETUSDT', '1000WIFUSDT'
  ];
  const intervals = [
    { value: '1m', label: '1m' },
    { value: '5m', label: '5m' },
    { value: '15m', label: '15m' },
    { value: '1h', label: '1h' },
    { value: '4h', label: '4h' },
    { value: '1d', label: '1d' },
  ];

  // --- Autocomplete logic ---
  useEffect(() => {
    if (pair.length === 0) {
      setFilteredPairs([]);
      return;
    }
    setFilteredPairs(
      allPairs.filter(p => p.toUpperCase().includes(pair.toUpperCase())).slice(0, 30)
    );
  }, [pair]);

  // --- Mobile resize logic ---
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    let chart;
    let candleSeries;
    let resizeObserver;
    let destroyed = false;

    function handleResize() {
      if (chart && chartContainerRef.current) {
        chart.resize(chartContainerRef.current.clientWidth, isMobile ? 220 : 400);
      }
    }

    async function fetchCandlesAndUpdate() {
      setError(null);
      try {
        const res = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${pair}&interval=${interval}&limit=200`
        );
        if (!res.ok) throw new Error("No se pudieron cargar los datos de velas");
        const data = await res.json();
        if (destroyed) return;
        const candles = data.map(d => ({
          time: Math.floor(d[0] / 1000),
          open: +d[1],
          high: +d[2],
          low: +d[3],
          close: +d[4],
        }));
        if (!chartContainerRef.current) return;
        chartContainerRef.current.innerHTML = "";
        chart = LightweightCharts.createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth,
          height: isMobile ? 220 : 400,
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
        candleSeries = chart.addCandlestickSeries({
          upColor: "#9ece6a",
          downColor: "#f7768e",
          borderUpColor: "#9ece6a",
          borderDownColor: "#f7768e",
          wickUpColor: "#9ece6a",
          wickDownColor: "#f7768e",
        });
        candleSeries.setData(candles);
      } catch (e) {
        setError(e.message);
      }
    }
    fetchCandlesAndUpdate();

    // ResizeObserver for responsive width
    if (chartContainerRef.current) {
      resizeObserver = new window.ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(chartContainerRef.current);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      destroyed = true;
      if (resizeObserver && chartContainerRef.current) {
        resizeObserver.unobserve(chartContainerRef.current);
      }
      window.removeEventListener('resize', handleResize);
      if (chart) chart.remove();
    };
  }, [isMobile, pair, interval]);

  return (
    <div className="w-full my-8 relative">
      {/* --- Pair and Interval Selectors --- */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3 items-center justify-between">
        {/* Pair selector */}
        <div className="relative">
          <input
            type="text"
            value={pair}
            autoComplete="off"
            onChange={e => {
              setPair(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
              setShowSuggestions(true);
            }}
            className="bg-card border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-400 w-32 text-center shadow"
            placeholder="BTCUSDT"
            style={{letterSpacing: '1px'}}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
          />
          {showSuggestions && filteredPairs.length > 0 && (
            <ul className="absolute z-30 left-0 w-full bg-card border border-slate-700 max-h-40 overflow-auto rounded shadow-lg mt-1 text-xs">
              {filteredPairs.map(p => (
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
        {/* Interval selector */}
        <div className="flex gap-1 bg-card rounded px-2 py-1 border border-slate-700">
          {intervals.map((intv) => (
            <button
              key={intv.value}
              onClick={() => setIntervalState(intv.value)}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors duration-100 focus:outline-none ${interval === intv.value ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
              style={{letterSpacing: '0.5px'}}>
              {intv.label}
            </button>
          ))}
        </div>

      </div>
      {/* --- Chart --- */}
      <div
        ref={chartContainerRef}
        className="w-full rounded-lg shadow bg-card"
        style={{ height: isMobile ? 220 : 400, maxHeight: isMobile ? 220 : undefined }}
      />
      {error && (
        <div className="text-center text-loss mt-2">{error}</div>
      )}
    </div>
  );
}
