import { useEffect, useState, useRef } from "react";

export default function useBinancePrices(symbols) {
  const [prices, setPrices] = useState({});
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!symbols || symbols.length === 0) return;
    let cancelled = false;

    async function fetchPrices() {
      try {
        const newPrices = {};
        await Promise.all(
          symbols.map(async (symbol) => {
            const pair = symbol.replace("/", "").toUpperCase();
            const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`);
            if (res.ok) {
              const data = await res.json();
              newPrices[pair] = parseFloat(data.price);
            }
          })
        );
        if (!cancelled) setPrices(newPrices);
      } catch (e) {
        // Silencia errores de red
      }
    }

    fetchPrices();
    intervalRef.current = setInterval(fetchPrices, 10000);

    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [symbols]);

  return prices;
}
