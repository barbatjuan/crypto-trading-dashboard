import React from "react";

// SVG de sobre abierto (Google Material Icons: markunread)
export function OpenEnvelopeIcon({ className = "", style = {}, title = "Trade abierto" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" className={className} style={style} aria-label={title} title={title}>
      <path d="M20 8V6c0-1.1-.9-2-2-2H6C4.9 4 4 4.9 4 6v2l8 5 8-5zm0 2.08l-8 5-8-5V18c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10.08z" />
    </svg>
  );
}

// SVG de sobre cerrado (Google Material Icons: mail)
export function ClosedEnvelopeIcon({ className = "", style = {}, title = "Trade cerrado" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" className={className} style={style} aria-label={title} title={title}>
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );
}
