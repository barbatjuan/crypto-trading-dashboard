import React from "react";
import useBinancePrices from "../hooks/useBinancePrices";

const PAIRS = [
  { symbol: "BTCUSDT", label: "BTC/USDT" },
  { symbol: "ETHUSDT", label: "ETH/USDT" },
  { symbol: "XRPUSDT", label: "XRP/USDT" },
  { symbol: "SOLUSDT", label: "SOL/USDT" },
  { symbol: "FILUSDT", label: "FIL/USDT" },
];

export default function LivePrices() {
  const prices = useBinancePrices(PAIRS.map(p => p.symbol));
  const allMissing = PAIRS.every(pair => !prices[pair.symbol]);

  return (
    <div className="flex gap-4 flex-wrap mb-6">
      {allMissing ? (
        <div className="text-loss font-semibold text-base bg-loss/10 px-4 py-2 rounded-lg animate-pulse">
          Sin conexión a Binance
        </div>
      ) : (
        PAIRS.map(pair => (
          <div
            key={pair.symbol}
            className="bg-card rounded-lg px-6 py-3 flex flex-col items-center shadow min-w-[130px]"
          >
            <span className="text-xs text-gray-400 uppercase tracking-widest">{pair.label}</span>
            <span className="text-xl font-mono font-bold">
              {prices[pair.symbol] ? `$${prices[pair.symbol].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : <span className="text-gray-500">...</span>}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
