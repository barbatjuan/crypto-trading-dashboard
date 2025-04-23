import React, { useState } from "react";

// El input de par será dinámico, no usamos PAIRS hardcodeados
const TYPES = ["Spot", "Futuros"];
const POSITIONS = ["Long", "Short"];
const STRATEGIES = ["Scalping", "Swing", "DCA", "Breakout"];

export default function TradeForm({ open, onClose, onSave, initial }) {
  // Fecha de hoy en formato yyyy-mm-dd
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState(
    initial || {
      openDate: today,
      closeDate: "",
      pair: "BTC/USDT",
      type: "Spot",
      position: "Long",
      entry: "",
      expectedExit: "",
      exit: "",
      amount: "",
      strategy: "Scalping",
      notes: ""
    }
  );
  const [error, setError] = useState("");
  const [pairs, setPairs] = useState([]);
  const [filteredPairs, setFilteredPairs] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  React.useEffect(() => {
    if (!open) return;
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
        setPairs([]);
        setFilteredPairs([]);
      });
    return () => { active = false; };
  }, [open]);

  React.useEffect(() => {
    if (!form.pair) {
      setFilteredPairs(pairs);
      return;
    }
    setFilteredPairs(
      pairs.filter(p => p.toUpperCase().includes(form.pair.toUpperCase()))
    );
  }, [form.pair, pairs]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Validaciones básicas
    if (!form.openDate || !form.pair || !form.type || !form.entry || !form.amount) {
      setError("Completa los campos obligatorios");
      return;
    }
    setError("");
    onSave({ ...form, id: form.id || Date.now(), result: "", resultPct: "" });
    onClose();
    setForm(initial || {
      openDate: "",
      closeDate: "",
      pair: "BTC/USDT",
      type: "Spot",
      position: "Long",
      entry: "",
      expectedExit: "",
      exit: "",
      amount: "",
      strategy: "Scalping",
      notes: ""
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadein">
      <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-8 shadow-2xl w-full max-w-lg relative border border-slate-800">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-white text-xl">✕</button>
        <h2 className="text-2xl font-bold mb-6 text-center">Nuevo Trade</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs mb-1">Fecha apertura*</label>
            <input type="date" name="openDate" value={form.openDate} onChange={handleChange} className="input-dark" required />
          </div>
          <div>
            <label className="block text-xs mb-1">Fecha cierre</label>
            <input type="date" name="closeDate" value={form.closeDate} onChange={handleChange} className="input-dark" />
          </div>
          <div className="relative">
            <label className="block text-xs mb-1">Par*</label>
            <input
              type="text"
              name="pair"
              autoComplete="off"
              value={form.pair}
              onChange={e => {
                handleChange({ target: { name: 'pair', value: e.target.value.toUpperCase().replace(/[^A-Z0-9/]/g, '') } });
                setShowSuggestions(true);
              }}
              className="input-dark"
              placeholder="BTC/USDT"
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
            />
            {showSuggestions && filteredPairs.length > 0 && (
              <ul className="absolute z-30 left-0 w-full bg-card border border-slate-700 max-h-40 overflow-auto rounded shadow-lg mt-1 text-xs">
                {filteredPairs.slice(0, 30).map(p => (
                  <li
                    key={p}
                    className={`px-3 py-2 cursor-pointer hover:bg-slate-700 ${form.pair === p ? 'bg-slate-800 text-white' : 'text-slate-200'}`}
                    onMouseDown={() => {
                      setForm(f => ({ ...f, pair: p }));
                      setShowSuggestions(false);
                    }}
                  >
                    {p}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label className="block text-xs mb-1">Tipo*</label>
            <select name="type" value={form.type} onChange={handleChange} className="input-dark">
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1">Posición</label>
            <select name="position" value={form.position} onChange={handleChange} className="input-dark">
              {POSITIONS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1">Estrategia</label>
            <select name="strategy" value={form.strategy} onChange={handleChange} className="input-dark">
              {STRATEGIES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs mb-1">Precio entrada*</label>
            <input type="number" step="any" name="entry" value={form.entry} onChange={handleChange} className="input-dark" required />
          </div>
          <div>
            <label className="block text-xs mb-1">Precio esperado</label>
            <input type="number" step="any" name="expectedExit" value={form.expectedExit} onChange={handleChange} className="input-dark" />
          </div>
          <div>
            <label className="block text-xs mb-1">Precio salida</label>
            <input type="number" step="any" name="exit" value={form.exit} onChange={handleChange} className="input-dark" />
          </div>
          <div>
            <label className="block text-xs mb-1">Cantidad USDT*</label>
            <input type="number" step="any" name="amount" value={form.amount} onChange={handleChange} className="input-dark" required />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-xs mb-1">Notas</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} className="input-dark" rows={2} />
        </div>
        {error && <div className="text-loss text-sm mb-2">{error}</div>}
        <div className="flex justify-end gap-2 mt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600">Cancelar</button>
          <button type="submit" className="px-4 py-2 rounded bg-profit hover:bg-green-600 text-white font-semibold">Guardar</button>
        </div>
      </form>
      <style>{`
        .input-dark {
          background: #181f2a;
          color: #f1f5f9;
          border-radius: 0.5rem;
          border: 1px solid #23262f;
          padding: 0.5rem 0.75rem;
          width: 100%;
          font-size: 1rem;
          transition: border 0.2s, box-shadow 0.2s;
        }
        .input-dark:focus {
          outline: none;
          border-color: #22c55e;
          box-shadow: 0 0 0 2px #22c55e33;
        }
        @keyframes fadein {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadein { animation: fadein 0.25s cubic-bezier(.4,2,.6,1) both; }
      `}</style>
    </div>
  );
}
