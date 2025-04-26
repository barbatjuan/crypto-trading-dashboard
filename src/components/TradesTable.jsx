import React, { useState } from "react";
import useBinancePrices from "../hooks/useBinancePrices";
import { FaStar } from "react-icons/fa";
import { OpenEnvelopeIcon, ClosedEnvelopeIcon } from "./EnvelopeIcons.jsx";

function calcularResultado(trade, exit) {
  const entry = parseFloat(trade.entry);
  exit = parseFloat(exit);
  const amount = parseFloat(trade.amount);
  const leverage = trade.leverage ? parseFloat(trade.leverage) : 1;
  if (!entry || !exit || !amount) return { result: "", resultPct: "" };
  let result, resultPct;
  if (trade.position === "Short") {
    result = ((entry - exit) * amount) / entry;
    resultPct = ((entry - exit) / entry) * 100;
  } else {
    result = ((exit - entry) * amount) / entry;
    resultPct = ((exit - entry) / entry) * 100;
  }
  // Aplica apalancamiento solo si es Futuros
  if (trade.type === "Futuros") {
    result *= leverage;
    resultPct *= leverage;
  }
  return {
    result: result.toFixed(2),
    resultPct: resultPct.toFixed(2)
  };
}

function formatShortDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d)) return '-';
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear().toString().slice(-2);
  return `${day}/${month}/${year}`;
}

export default function TradesTable({ trades, deleteTrade, updateTrade }) {
  // Obtener todos los pares únicos de los trades abiertos
  const openPairs = Array.from(new Set(trades.filter(t => !t.exit).map(t => (t.pair || '').replace('/', '').toUpperCase())));
  const prices = useBinancePrices(openPairs);
  const [modal, setModal] = useState({ open: false, idx: null, value: "" });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, idx: null });
  // Responsive: móvil
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
    // Paginación
  const PAGE_SIZE = 5; // móvil
  const PAGE_SIZE_DESKTOP = 10;
  const [page, setPage] = React.useState(1);
  const isDesktop = !isMobile;
  const pageSize = isMobile ? PAGE_SIZE : PAGE_SIZE_DESKTOP;
  const pageCount = Math.ceil(trades.length / pageSize);
  const pagedTrades = trades.slice((page-1)*pageSize, page*pageSize);

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

  function handleDeleteConfirm() {
    if (deleteConfirm.idx !== null) {
      const trade = pagedTrades[deleteConfirm.idx];
      if (trade && trade.id) {
        deleteTrade(trade.id);
      }
    }
    setDeleteConfirm({ open: false, idx: null });
  }

  function handleDeleteCancel() {
    setDeleteConfirm({ open: false, idx: null });
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
                let pnlNum = null;
                if (trade.exit && trade.entry && trade.amount) {
                  // Cerrado
                  const { result: r, resultPct: rp } = calcularResultado(trade, trade.exit);
                  result = `${parseFloat(r) >= 0 ? '+' : ''}${r}`;
                  resultPct = rp;
                  pnlNum = parseFloat(r);
                } else if (trade.entry && trade.amount && prices && prices[(trade.pair || '').replace('/', '').toUpperCase()]) {
                  // Abierto, en tiempo real
                  const price = prices[(trade.pair || '').replace('/', '').toUpperCase()];
                  const { result: r, resultPct: rp } = calcularResultado(trade, price);
                  result = `${parseFloat(r) >= 0 ? '+' : ''}${r}`;
                  resultPct = rp;
                  pnlNum = parseFloat(r);
                }
                return (
                  <div key={trade.id || idx} className="rounded-xl border border-slate-800 bg-slate-900 p-3 flex flex-col gap-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-base font-bold text-[#7aa2f7] flex items-center gap-1">
                        {(!trade.exit && !trade.closeDate) ? (
  <OpenEnvelopeIcon className="inline text-[#e0af68] text-base" title="Trade abierto" />
) : (
  <ClosedEnvelopeIcon className="inline text-gray-400 text-base" title="Trade cerrado" />
)}
                        {trade.pair}
                      </span>
                      <div className="flex gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded bg-slate-800 text-gray-300`}>{trade.entry}</span>
                        <span className={`text-xs px-2 py-0.5 rounded bg-slate-800 text-gray-300`}>{trade.exit || '-'}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Posición</span>
                      <span className="font-mono text-xs text-gray-200">{trade.position}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">USDT</span>
                      <span className="font-mono text-xs text-gray-200">{trade.amount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">PNL</span>
                      <span
  className={`font-mono text-xs font-bold ${pnlNum > 0 ? 'text-[#9ece6a]' : pnlNum < 0 ? 'text-[#f7768e]' : 'text-gray-300'}`}
  style={{ display: 'inline-block', width: '72px', minWidth: '72px', maxWidth: '72px', textAlign: 'right' }}
>
  {result}
</span>
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
                        onClick={() => setDeleteConfirm({ open: true, idx })}
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
  <th className="px-2 py-1 text-center text-[#7aa2f7] font-semibold text-sm">Estado</th>
            <th className="px-2 py-1 text-center text-[#7aa2f7] font-semibold text-sm">Fecha apertura</th>
            <th className="px-2 py-1 text-center text-[#7aa2f7] font-semibold text-sm">Fecha cierre</th>
            <th className="px-2 py-1 text-center text-[#7aa2f7] font-semibold text-sm">Par</th>
            
            <th className="px-2 py-1 text-center text-[#7aa2f7] font-semibold text-sm">Posición</th>
            <th className="px-2 py-1 text-center text-[#7aa2f7] font-semibold text-sm">Entrada</th>
            <th className="px-2 py-1 text-center text-[#7aa2f7] font-semibold text-sm">Salida</th>
            <th className="px-2 py-1 text-center text-[#7aa2f7] font-semibold text-sm">Esperado</th>
            <th className="px-2 py-1 text-center text-[#7aa2f7] font-semibold text-sm">USDT</th>
            
            <th className="px-2 py-1 text-center text-[#7aa2f7] font-semibold text-sm">% Resultado</th>
            <th className="px-2 py-1 text-center text-[#7aa2f7] font-semibold text-sm">Días</th>
            <th className="px-2 py-1 text-center text-[#7aa2f7] font-semibold text-sm" style={{width:'90px',minWidth:'90px',maxWidth:'90px'}}>PnL</th>
            
            <th className="px-2 py-1 text-center text-[#7aa2f7] font-semibold text-sm">Acciones</th>
          </tr>
        </thead>
        <tbody>
          
          {trades.length === 0 ? (
            <tr>
              <td colSpan={15} className="text-center text-gray-500 py-4">No hay operaciones registradas.</td>
            </tr>
          ) : (
            pagedTrades.map((trade, idx) => {
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
                  <td className="px-2 py-1 text-center align-middle">
                    {(!trade.exit && !trade.closeDate)
                      ? <OpenEnvelopeIcon className="text-[#e0af68] text-xl" title="Trade abierto" />
                      : <ClosedEnvelopeIcon className="text-gray-400 text-xl" title="Trade cerrado" />}
                  </td>
                  <td className="px-2 py-1 text-center">{formatShortDate(trade.openDate)}</td>
                  <td className="px-2 py-1 text-center">{trade.closeDate ? formatShortDate(trade.closeDate) : '-'}</td>
                  
                  
                  <td className="px-2 py-1 text-center">{trade.pair}</td>
                  
                  <td className="px-2 py-1 text-center">{trade.position}</td>
                  <td className="px-2 py-1 pr-6 text-right">{trade.entry}</td>
                  <td className="px-2 py-1 pr-6 text-right">{trade.exit || <span className="text-gray-400">-</span>}</td>
                  <td className="px-2 py-1 text-center">{trade.expectedExit}</td>
                  <td className="px-2 py-1 pr-6 text-right">{trade.amount}</td>
                  
                  <td className={`px-2 py-1 text-right`}>{(() => {
  let pct = '-';
  let pctNum = null;
  if (trade.exit && trade.entry && trade.amount) {
    // Trade cerrado: % final
    const { resultPct } = calcularResultado(trade, trade.exit);
    pct = resultPct;
    pctNum = parseFloat(resultPct);
  } else if (trade.entry && trade.amount && prices && prices[(trade.pair || '').replace('/', '').toUpperCase()]) {
    // Trade abierto: % en tiempo real
    const price = prices[(trade.pair || '').replace('/', '').toUpperCase()];
    const { resultPct } = calcularResultado(trade, price);
    pct = resultPct;
    pctNum = parseFloat(resultPct);
  }
  let color = '';
  if (pctNum !== null && !isNaN(pctNum)) {
    if (pctNum > 0) color = 'text-[#9ece6a]';
    else if (pctNum < 0) color = 'text-[#f7768e]';
  }
  return <span className={color}>{pct}%</span>;
})()}</td>
                  <td className="px-2 py-1 text-center">{days}</td>
                  <td className="px-2 py-2 text-xs font-mono text-center" style={{width:'90px',minWidth:'90px',maxWidth:'90px',letterSpacing:'0.5px'}}>
  {/* PnL en tiempo real */}
  {(() => {
    let pnl = '-';
    let pnlNum = null;
    if (trade.exit && trade.entry && trade.amount) {
      // Trade cerrado: PnL final
      const { result } = calcularResultado(trade, trade.exit);
      pnl = `${parseFloat(result) >= 0 ? '+' : ''}${result}`;
      pnlNum = parseFloat(result);
    } else if (trade.entry && trade.amount && prices && prices[(trade.pair || '').replace('/', '').toUpperCase()]) {
      // Trade abierto: PnL en tiempo real
      const price = prices[(trade.pair || '').replace('/', '').toUpperCase()];
      const { result } = calcularResultado(trade, price);
      pnl = `${parseFloat(result) >= 0 ? '+' : ''}${result}`;
      pnlNum = parseFloat(result);
    }
    let color = 'text-gray-300';
    if (pnlNum !== null && !isNaN(pnlNum)) {
      if (pnlNum > 0) color = 'text-[#9ece6a]';
      else if (pnlNum < 0) color = 'text-[#f7768e]';
      else color = 'text-gray-300';
    }
    return <span className={color} style={{display:'inline-block',width:'72px',textAlign:'right'}}>{pnl}</span>;
  })()}
</td>
                  <td className="px-2 py-1">{trade.notes}</td>
                  <td className="px-2 py-1">
                    <div className="flex gap-1 justify-end">
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
                        onClick={() => setDeleteConfirm({ open: true, idx })}
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
      {/* Modal para confirmar borrado de trade */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fadein">
          <div className="bg-card p-6 rounded-xl shadow-lg border border-slate-800 w-full max-w-xs relative">
            <button onClick={handleDeleteCancel} className="absolute right-3 top-3 text-gray-400 hover:text-white">✕</button>
            <h3 className="text-lg font-bold mb-4 text-center">¿Eliminar trade?</h3>
            <div className="mb-4 text-center text-sm text-gray-300">Esta acción no se puede deshacer.<br/>¿Seguro que quieres borrar el trade?</div>
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={handleDeleteCancel} className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600">Cancelar</button>
              <button onClick={handleDeleteConfirm} className="px-4 py-2 rounded bg-[#c53b53] hover:bg-[#a12d3a] text-white font-semibold">Eliminar</button>
            </div>
          </div>
        </div>
      )}
      {/* Paginación Desktop */}
      {isDesktop && pageCount > 1 && (
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
    </div>
  );
}

