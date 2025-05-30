import React, { useState } from "react";
import { FaRegCalendar } from "react-icons/fa";
import { toSnake } from '../utils/caseMap';
// El input de par será dinámico, no usamos PAIRS hardcodeados
const TYPES = ["Spot", "Futuros"];
const POSITIONS = ["Long", "Short"];
const STRATEGIES = ["Scalping", "Swing", "DCA", "Breakout"];

export default function TradeForm({ open, onClose, onSave, initial }) {
  // Si recibimos initial (modo edición), inicializamos el formulario con esos valores
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState(
    initial ? {
      // Solo los datos de apertura
      openDate: initial.open_date || initial.openDate || today,
      pair: initial.pair || "BTC/USDT",
      type: initial.type || "Spot",
      position: initial.position || "Long",
      entry: initial.entry || "",
      amount: initial.amount || "",
      strategy: initial.strategy || "Scalping",
      notes: initial.notes || "",
      leverage: initial.leverage || "1"
    } : {
      openDate: today,
      pair: "BTC/USDT",
      type: "Spot",
      position: "Long",
      entry: "",
      amount: "",
      strategy: "Scalping",
      notes: "",
      leverage: "1"
    }
  );

  // Cuando cambia initial (nuevo trade a editar), actualiza el formulario
  React.useEffect(() => {
    if (initial) {
      setForm({
        openDate: initial.open_date || initial.openDate || today,
        pair: initial.pair || "BTC/USDT",
        type: initial.type || "Spot",
        position: initial.position || "Long",
        entry: initial.entry || "",
        amount: initial.amount || "",
        strategy: initial.strategy || "Scalping",
        notes: initial.notes || "",
        leverage: initial.leverage || "1"
      });
    }
  }, [initial]);


  const [error, setError] = useState("");
  const [pairs, setPairs] = useState([]);
  const [filteredPairs, setFilteredPairs] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [entrySuggestion, setEntrySuggestion] = useState("");

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

  // Sugerir precio de entrada si el par es de Binance
  React.useEffect(() => {
    if (!form.pair || !pairs.includes(form.pair)) {
      setEntrySuggestion("");
      return;
    }
    const symbol = form.pair.replace("/", "");
    fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`)
      .then(res => res.json())
      .then(data => {
        if (data.price) setEntrySuggestion(Number(data.price).toFixed(4));
        else setEntrySuggestion("");
      })
      .catch(() => setEntrySuggestion(""));
  }, [form.pair, pairs]);

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
    // No enviar result ni resultPct (la tabla no tiene esas columnas)
    const { result, resultPct, ...formToSend } = form;
    if (formToSend.type !== "Futuros") formToSend.leverage = "1";
    // Si closeDate es "", mándalo como null
    if (formToSend.closeDate === "") formToSend.closeDate = null;
    // Siempre enviar open_date en snake_case y nunca vacío
    const tradeToSend = {
      ...formToSend,
      open_date: form.openDate || new Date().toISOString().slice(0, 10),
      close_date: formToSend.closeDate || null,
      pair: form.pair,
    };
    delete tradeToSend.openDate;
    delete tradeToSend.closeDate;
    onSave(tradeToSend);
    onClose();
    setForm(initial || {
      openDate: new Date().toISOString().slice(0, 10),
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
            <div className="relative">
              <input type="date" name="openDate" value={form.openDate} onChange={handleChange} className="input-dark pr-8" required />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                <FaRegCalendar size={18} color="#7aa2f7" />
              </span>
            </div>
          </div>
          <div>
            <label className="block text-xs mb-1">Fecha cierre</label>
            <div className="relative">
              <input type="date" name="closeDate" value={form.closeDate} onChange={handleChange} className="input-dark pr-8" />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                <FaRegCalendar size={18} color="#e0af68" />
              </span>
            </div>
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
          {form.type === "Futuros" && (
            <div>
              <label className="block text-xs mb-1">Apalancamiento</label>
              <select name="leverage" value={form.leverage || "1"} onChange={handleChange} className="input-dark">
                {Array.from({length: 20}, (_, i) => i + 1).map(x => (
                  <option key={x} value={x}>{`x${x}`}</option>
                ))}
              </select>
            </div>
          )}
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
            <div className="flex gap-2 items-center">
              <input
                type="number"
                step="any"
                name="entry"
                value={form.entry}
                onChange={handleChange}
                className="input-dark flex-1"
                required
                placeholder={entrySuggestion ? `Sugerido: ${entrySuggestion}` : ''}
              />
              {entrySuggestion && (
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded bg-[#9ece6a] hover:bg-[#7aa64c] text-surface font-semibold shadow"
                  title="Usar precio actual"
                  onClick={() => setForm(f => ({ ...f, entry: entrySuggestion }))}
                  tabIndex={-1}
                >
                  Usar
                </button>
              )}
            </div>
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
          <button type="submit" className="px-4 py-2 rounded bg-[#9ece6a] hover:bg-[#7aa64c] text-surface font-semibold">Guardar</button>
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
