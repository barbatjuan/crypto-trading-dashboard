import React, { useState } from "react";

function calcularResultado(trade, exit) {
  const entry = parseFloat(trade.entry);
  exit = parseFloat(exit);
  const amount = parseFloat(trade.amount);
  if (!entry || !exit || !amount) return { result: "", resultPct: "" };
  let result, resultPct;
  if (trade.position === "Short") {
    result = ((entry - exit) * amount) / entry;
    resultPct = ((entry - exit) / entry) * 100;
  } else {
    result = ((exit - entry) * amount) / entry;
    resultPct = ((exit - entry) / entry) * 100;
  }
  return {
    result: result.toFixed(2),
    resultPct: resultPct.toFixed(2)
  };
}

export default function TradesTable({ trades, deleteTrade, updateTrade }) {
  const [modal, setModal] = useState({ open: false, idx: null, value: "" });

  function handleCloseTrade(idx) {
    setModal({ open: true, idx, value: "" });
  }
  function handleModalChange(e) {
    setModal(m => ({ ...m, value: e.target.value }));
  }
  function handleModalConfirm() {
    const idx = modal.idx;
    const exit = modal.value;
    if (!exit || isNaN(Number(exit))) return;
    const today = new Date().toISOString().slice(0, 10);
    const trade = trades[idx];
    const { result, resultPct } = calcularResultado(trade, exit);
    const days = trade.openDate ? Math.max(1, Math.ceil((new Date(today) - new Date(trade.openDate)) / (1000 * 60 * 60 * 24))) : 1;
    // Eliminar result y resultPct porque la tabla no los tiene
    const updated = {
      ...trade,
      exit,
      closeDate: today
    };
    delete updated.result;
    delete updated.resultPct;
    updateTrade(trade.id, updated);
    setModal({ open: false, idx: null, value: "" });
  }
  function handleModalCancel() {
    setModal({ open: false, idx: null, value: "" });
  }

  return (
    <div className="bg-card rounded-lg p-4 shadow overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="px-2 py-1">Fecha apertura</th>
            <th className="px-2 py-1">Fecha cierre</th>
            <th className="px-2 py-1">Par</th>
            <th className="px-2 py-1">Tipo</th>
            <th className="px-2 py-1">Posición</th>
            <th className="px-2 py-1">Entrada</th>
            <th className="px-2 py-1">Salida</th>
            <th className="px-2 py-1">Esperado</th>
            <th className="px-2 py-1">Cantidad</th>
            <th className="px-2 py-1">Resultado</th>
            <th className="px-2 py-1">% Resultado</th>
            <th className="px-2 py-1">Días</th>
            <th className="px-2 py-1">Estrategia</th>
            <th className="px-2 py-1">Notas</th>
            <th className="px-2 py-1">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {trades.length === 0 ? (
            <tr>
              <td colSpan={15} className="text-center text-gray-500 py-4">No hay operaciones registradas.</td>
            </tr>
          ) : (
            trades.map((trade, idx) => (
              <tr key={trade.id || idx} className="border-b border-slate-800">
                <td className="px-2 py-1">{trade.openDate}</td>
                <td className="px-2 py-1">{trade.closeDate || <span className="text-gray-400">-</span>}</td>
                <td className="px-2 py-1">{trade.pair}</td>
                <td className="px-2 py-1">{trade.type}</td>
                <td className="px-2 py-1">{trade.position}</td>
                <td className="px-2 py-1">{trade.entry}</td>
                <td className="px-2 py-1">{trade.exit || <span className="text-gray-400">-</span>}</td>
                <td className="px-2 py-1">{trade.expectedExit}</td>
                <td className="px-2 py-1">{trade.amount}</td>
                {/* Muestra resultado y % si existen en el trade (de Supabase), si no, calcula en tiempo real */}
                {trade.exit && trade.closeDate ? (
                  (() => {
                    // Usa los campos guardados si existen, si no calcula
                    const result = trade.result !== undefined ? trade.result : calcularResultado(trade, trade.exit).result;
                    const resultPct = trade.result_pct !== undefined ? trade.result_pct : calcularResultado(trade, trade.exit).resultPct;
                    let days = 1;
                    if (trade.openDate && trade.closeDate) {
                      const d1 = new Date(trade.openDate);
                      const d2 = new Date(trade.closeDate);
                      days = Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)));
                    }
                    return <>
                      <td className={`px-2 py-1 font-bold ${parseFloat(result) > 0 ? 'text-profit' : parseFloat(result) < 0 ? 'text-loss' : ''}`}>{result}</td>
                      <td className={`px-2 py-1 ${parseFloat(resultPct) > 0 ? 'text-profit' : parseFloat(resultPct) < 0 ? 'text-loss' : ''}`}>{resultPct}%</td>
                      <td className="px-2 py-1">{days}</td>
                    </>;
                  })()
                ) : (
                  <>
                    <td className="px-2 py-1">-</td>
                    <td className="px-2 py-1">-</td>
                    <td className="px-2 py-1">-</td>
                  </>
                )}
                <td className="px-2 py-1">{trade.strategy}</td>
                <td className="px-2 py-1">{trade.notes}</td>
                <td className="px-2 py-1">
                  <div className="flex gap-2 justify-end">
                    {!trade.exit && !trade.closeDate && (
                      <button
                        className="text-xs text-blue-400 hover:underline mr-2"
                        onClick={() => handleCloseTrade(idx)}
                      >
                        Cerrar
                      </button>
                    )}
                    <button
                      className="text-xs text-red-400 hover:text-red-600"
                      title="Borrar trade"
                      onClick={() => deleteTrade(trade.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* Modal para confirmar precio de cierre */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fadein">
          <div className="bg-card p-6 rounded-xl shadow-lg border border-slate-800 w-full max-w-xs relative">
            <button onClick={handleModalCancel} className="absolute right-3 top-3 text-gray-400 hover:text-white">✕</button>
            <h3 className="text-lg font-bold mb-4 text-center">Confirmar cierre</h3>
            <div className="mb-3">
              <label className="block text-xs mb-1">Precio de cierre</label>
              <input
                type="number"
                className="input-dark"
                autoFocus
                step="any"
                value={modal.value}
                onChange={handleModalChange}
                placeholder="Ej: 65000"
              />
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={handleModalCancel} className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600">Cancelar</button>
              <button onClick={handleModalConfirm} className="px-4 py-2 rounded bg-profit hover:bg-green-600 text-white font-semibold">Confirmar</button>
            </div>
          </div>
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
      )}
    </div>
  );
}

