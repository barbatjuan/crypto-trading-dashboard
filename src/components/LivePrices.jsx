import React from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 w-full mb-6">
      {allMissing ? (
        <div className="col-span-full text-loss font-semibold text-base bg-loss/10 px-4 py-2 rounded-lg animate-pulse text-center">
          Sin conexión a Binance
        </div>
      ) : (
        PAIRS.map(pair => (
          <div
            key={pair.symbol}
            className="bg-card rounded-lg px-6 py-3 flex flex-col items-center shadow w-full"
          >
            <span className="text-xs text-gray-400 uppercase tracking-widest">{pair.label}</span>
            <span className="text-xl font-mono font-bold flex items-center gap-2">
              {prices[pair.symbol] ? `$${prices[pair.symbol].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : <span className="text-gray-500">...</span>}
              <span className="inline-flex items-center min-w-[20px] justify-center">
                {prices[pair.symbol] && prices[pair.symbol + '_prev'] !== undefined && (
                  prices[pair.symbol] > prices[pair.symbol + '_prev'] ? (
                    <FaArrowUp className="text-profit" title="Sube" />
                  ) : prices[pair.symbol] < prices[pair.symbol + '_prev'] ? (
                    <FaArrowDown className="text-loss" title="Baja" />
                  ) : null
                )}
              </span>
            </span>
          </div>
        ))
      )}
    </div>
  );
}
