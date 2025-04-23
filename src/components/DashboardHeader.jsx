import React from "react";

export default function DashboardHeader({ onAddTrade, onLogout }) {
  return (
    <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur shadow flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-card">
      <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-center sm:text-left w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2">
        {/* Header principal con icono BTC */}
        <span className="inline-block align-middle">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 16 16" fill="#FFC700">
            <path d="M5.5 13v1.25c0 .138.112.25.25.25h1a.25.25 0 0 0 .25-.25V13h.5v1.25c0 .138.112.25.25.25h1a.25.25 0 0 0 .25-.25V13h.084c1.992 0 3.416-1.033 3.416-2.82 0-1.502-1.007-2.323-2.186-2.44v-.088c.97-.242 1.683-.974 1.683-2.19C11.997 3.93 10.847 3 9.092 3H9V1.75a.25.25 0 0 0-.25-.25h-1a.25.25 0 0 0-.25.25V3h-.573V1.75a.25.25 0 0 0-.25-.25H5.75a.25.25 0 0 0-.25.25V3l-1.998.011a.25.25 0 0 0-.25.25v.989c0 .137.11.25.248.25l.755-.005a.75.75 0 0 1 .745.75v5.505a.75.75 0 0 1-.75.75l-.748.011a.25.25 0 0 0-.25.25v1c0 .138.112.25.25.25zm1.427-8.513h1.719c.906 0 1.438.498 1.438 1.312 0 .871-.575 1.362-1.877 1.362h-1.28zm0 4.051h1.84c1.137 0 1.756.58 1.756 1.524 0 .953-.626 1.45-2.158 1.45H6.927z"/>
          </svg>
        </span>
        Crypto Trading Dashboard
        {onLogout && (
          <button
            className="ml-auto px-4 py-1 rounded-lg font-semibold text-black bg-[#FFC700] hover:bg-yellow-400 transition text-sm"
            onClick={onLogout}
            style={{ marginLeft: 'auto' }}
          >
            Cerrar sesión
          </button>
        )}
      </h1>
      <button
        onClick={onAddTrade}
        className="bg-[#9ece6a] hover:bg-[#7aa64c] text-surface font-semibold px-4 py-2 rounded transition-colors shadow w-full sm:w-auto"
        >
        + Nuevo Trade
      </button>
    </header>
  );
}
