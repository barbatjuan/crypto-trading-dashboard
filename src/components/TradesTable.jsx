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
  // Responsive: móvil
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  // Paginación móvil
  const PAGE_SIZE = 5;
  const [page, setPage] = React.useState(1);
  const pageCount = Math.ceil(trades.length / PAGE_SIZE);
  const pagedTrades = trades.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

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

  if (isMobile) {
    return (
      <div className="bg-card rounded-lg p-2 shadow">
        {trades.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No hay operaciones registradas.</div>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {pagedTrades.map((trade, idx) => {
                // Calcula PnL y %
                let result = '-';
                let resultPct = '-';
                if (trade.exit && trade.entry && trade.amount) {
                  const entry = parseFloat(trade.entry);
                  const exit = parseFloat(trade.exit);
                  const amount = parseFloat(trade.amount);
                  if (!isNaN(entry) && !isNaN(exit) && !isNaN(amount)) {
                    if (trade.position === "Short") {
                      result = ((entry - exit) * amount / entry).toFixed(2);
                      resultPct = (((entry - exit) / entry) * 100).toFixed(2);
                    } else {
                      result = ((exit - entry) * amount / entry).toFixed(2);
                      resultPct = (((exit - entry) / entry) * 100).toFixed(2);
                    }
                  }
                }
                return (
                  <div key={trade.id || idx} className="rounded-xl border border-slate-800 bg-slate-900 p-3 flex flex-col gap-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-base font-bold text-[#7aa2f7]">{trade.pair}</span>
                      <div className="flex gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded bg-slate-800 text-gray-300`}>{trade.entry}</span>
                        <span className={`text-xs px-2 py-0.5 rounded bg-slate-800 text-gray-300`}>{trade.exit || '-'}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">USDT</span>
                      <span className="font-mono text-xs text-gray-200">{trade.amount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">PNL</span>
                      <span className={`font-mono text-xs font-bold ${parseFloat(result) > 0 ? 'text-[#9ece6a]' : parseFloat(result) < 0 ? 'text-[#f7768e]' : 'text-gray-200'}`}>{result}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">% Resultado</span>
                      <span className={`font-mono text-xs font-bold ${parseFloat(resultPct) > 0 ? 'text-[#9ece6a]' : parseFloat(resultPct) < 0 ? 'text-[#f7768e]' : 'text-gray-200'}`}>{resultPct}%</span>
                    </div>
                    <div className="flex gap-2 justify-end mt-1">
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
                  </div>
                );
              })}
            </div>
            {/* Paginación */}
            {pageCount > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  className="px-2 py-1 rounded bg-slate-800 text-gray-300 disabled:opacity-50"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </button>
                <span className="text-xs text-gray-400">Página {page} de {pageCount}</span>
                <button
                  className="px-2 py-1 rounded bg-slate-800 text-gray-300 disabled:opacity-50"
                  onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                  disabled={page === pageCount}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
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

  return (
    <div className="bg-card rounded-lg p-4 shadow overflow-x-auto">
      <table className="min-w-full text-sm hidden sm:table">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="px-2 py-1 text-[#7aa2f7]">Fecha apertura</th>
            <th className="px-2 py-1 text-[#7aa2f7]">Fecha cierre</th>
            <th className="px-2 py-1 text-[#7aa2f7]">Par</th>
            <th className="px-2 py-1 text-[#7aa2f7]">Tipo</th>
            <th className="px-2 py-1 text-[#7aa2f7]">Posición</th>
            <th className="px-2 py-1 text-[#7aa2f7]">Entrada</th>
            <th className="px-2 py-1 text-[#7aa2f7]">Salida</th>
            <th className="px-2 py-1 text-[#7aa2f7]">Esperado</th>
            <th className="px-2 py-1 text-[#7aa2f7]">USDT</th>
            <th className="px-2 py-1 text-[#7aa2f7]">PNL</th>
            <th className="px-2 py-1 text-[#7aa2f7]">% Resultado</th>
            <th className="px-2 py-1 text-[#7aa2f7]">Días</th>
            <th className="px-2 py-1 text-[#7aa2f7]">Estrategia</th>
            <th className="px-2 py-1 text-[#7aa2f7]">Notas</th>
            <th className="px-2 py-1 text-[#7aa2f7]">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {trades.length === 0 ? (
            <tr>
              <td colSpan={15} className="text-center text-gray-500 py-4">No hay operaciones registradas.</td>
            </tr>
          ) : (
            trades.map((trade, idx) => {
              let result = '-';
              let resultPct = '-';
              let days = '-';
              if (trade.exit && trade.closeDate) {
                result = trade.result !== undefined ? trade.result : calcularResultado(trade, trade.exit).result;
                resultPct = trade.result_pct !== undefined ? trade.result_pct : calcularResultado(trade, trade.exit).resultPct;
                if (trade.openDate && trade.closeDate) {
                  const d1 = new Date(trade.openDate);
                  const d2 = new Date(trade.closeDate);
                  days = Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)));
                }
              }
              return (
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
                  <td className={`px-2 py-1 font-bold ${parseFloat(result) > 0 ? 'text-[#9ece6a]' : parseFloat(result) < 0 ? 'text-[#f7768e]' : ''}`}>{result}</td>
                  <td className={`px-2 py-1 ${parseFloat(resultPct) > 0 ? 'text-[#9ece6a]' : parseFloat(resultPct) < 0 ? 'text-[#f7768e]' : ''}`}>{resultPct}%</td>
                  <td className="px-2 py-1">{days}</td>
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
              );
            })
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

