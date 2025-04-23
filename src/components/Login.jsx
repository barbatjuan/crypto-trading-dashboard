import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error, user } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      onLogin && onLogin(user);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <form
        className="bg-card p-8 rounded-xl shadow-lg w-full max-w-xs flex flex-col gap-4"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold text-center mb-2">Iniciar sesión</h2>
        <input
          type="email"
          className="input-dark"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="input-dark"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-red-500 text-xs text-center">{error}</div>}
        <button
          type="submit"
          className="bg-[#FFC700] text-black font-bold py-2 rounded-lg hover:bg-yellow-400 transition"
          disabled={loading}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <style>{`
        .input-dark {
          background: #181f2a;
          color: #f1f5f9;
          border-radius: 0.5rem;
          border: 1px solid #23262f;
          padding: 0.75rem 1rem;
          width: 100%;
          font-size: 1rem;
          margin-bottom: 0.5rem;
        }
        .input-dark:focus {
          outline: none;
          border-color: #FFC700;
          box-shadow: 0 0 0 2px #ffc70044;
        }
      `}</style>
    </div>
  );
}
