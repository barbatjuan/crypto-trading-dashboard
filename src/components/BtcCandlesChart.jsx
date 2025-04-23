import React, { useEffect, useRef, useState } from "react";
import * as LightweightCharts from "lightweight-charts";

export default function BtcCandlesChart() {
  const [isMobile, setIsMobile] = useState(false);
  const chartContainerRef = useRef();
  const [error, setError] = useState(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    let chart;
    let candleSeries;
    let destroyed = false;
    async function fetchCandlesAndUpdate() {
      setError(null);
      try {
        const res = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=4h&limit=200`
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
    return () => {
      destroyed = true;
      if (chart) chart.remove();
    };
  }, [isMobile]);

  return (
    <div className="w-full my-8 relative">
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
