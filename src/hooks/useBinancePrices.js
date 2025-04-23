import { useEffect, useState, useRef } from "react";

export default function useBinancePrices(symbols) {
  const [prices, setPrices] = useState({});
  const intervalRef = useRef(null);
  const prevPrices = useRef({});

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
        if (!cancelled) {
          // Añade los precios previos
          const pricesWithPrev = { ...newPrices };
          Object.keys(newPrices).forEach(symbol => {
            if (prices[symbol] !== undefined) {
              pricesWithPrev[symbol + '_prev'] = prices[symbol];
            } else if (prevPrices.current[symbol] !== undefined) {
              pricesWithPrev[symbol + '_prev'] = prevPrices.current[symbol];
            } else {
              pricesWithPrev[symbol + '_prev'] = undefined;
            }
          });
          prevPrices.current = newPrices;
          setPrices(pricesWithPrev);
        }
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
