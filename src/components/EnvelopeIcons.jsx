import React from "react";

// SVG de sobre abierto (Google Material Icons: markunread)
// Usa el icono de Material Symbols Outlined 'drafts'.
// IMPORTANTE: requiere tener la fuente Material Symbols Outlined en el index.html
export function OpenEnvelopeIcon({ className = "", style = {}, title = "Trade abierto" }) {
  return (
    <span className={"material-symbols-outlined " + className} style={style} title={title} aria-label={title}>drafts</span>
  );
}

// SVG de sobre cerrado (Google Material Icons: mail)
// Usa el icono de Material Symbols Outlined 'mail'.
// IMPORTANTE: requiere tener la fuente Material Symbols Outlined en el index.html
export function ClosedEnvelopeIcon({ className = "", style = {}, title = "Trade cerrado" }) {
  return (
    <span className={"material-symbols-outlined " + className} style={style} title={title} aria-label={title}>mail</span>
  );
}
