// src/utils/caseMap.js
export function toSnake(obj) {
  // Convierte todas las claves del objeto a snake_case
  const out = {};
  for (const k in obj) {
    const nk = k.replace(/[A-Z]/g, l => '_' + l.toLowerCase());
    out[nk] = obj[k];
  }
  return out;
}

export function toCamel(obj) {
  // Convierte todas las claves del objeto a camelCase
  const out = {};
  for (const k in obj) {
    const nk = k.replace(/_([a-z])/g, (_, l) => l.toUpperCase());
    out[nk] = obj[k];
  }
  return out;
}
