import React, { useEffect, useState, useLayoutEffect, useRef } from "react";
import * as LightweightCharts from "lightweight-charts";

export default function BtcCandlesChart() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chartContainerRef = useRef();
  const chartInstanceRef = useRef();
  
  useLayoutEffect(() => {
    let chart;
    let candleSeries;
    let resizeObserver;
    let destroyed = false;

    async function fetchCandles() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=4h&limit=120"
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
        // Limpia el contenedor antes de crear el chart
        chartContainerRef.current.innerHTML = "";
        chart = LightweightCharts.createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth,
          height: 500,
          layout: {
            background: { color: "#0f172a" },
            textColor: "#e5e7eb",
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
          upColor: "#22c55e",
          downColor: "#ef4444",
          borderUpColor: "#22c55e",
          borderDownColor: "#ef4444",
          wickUpColor: "#22c55e",
          wickDownColor: "#ef4444",
        });
        candleSeries.setData(candles);
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
    fetchCandles();
    return () => {
      destroyed = true;
      if (resizeObserver && chartContainerRef.current) {
        resizeObserver.unobserve(chartContainerRef.current);
      }
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
      }
    };
  }, []);

  return (
    <div className="w-full my-8">
      <h2 className="text-lg font-semibold text-gray-200 mb-2">BTC/USDT - Velas 4H</h2>
      <div
        ref={chartContainerRef}
        className="w-full rounded-lg shadow bg-card"
        style={{ height: 500, minHeight: 300 }}
      />
      {loading && (
        <div className="text-center text-gray-400 mt-2 animate-pulse">Cargando gráfico...</div>
      )}
      {error && (
        <div className="text-center text-loss mt-2">{error}</div>
      )}
    </div>
  );
}
