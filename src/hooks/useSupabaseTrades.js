// src/hooks/useSupabaseTrades.js
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { toSnake, toCamel } from '../utils/caseMap';

// Devuelve: { trades, loading, error, addTrade, deleteTrade, updateTrade }
export default function useSupabaseTrades() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar trades solo del usuario autenticado
  const fetchTrades = useCallback(async () => {
    setLoading(true);
    setError(null);
    let user;
    if (supabase.auth.getUser) {
      const { data: userData } = await supabase.auth.getUser();
      user = userData?.user;
    } else {
      user = supabase.auth.user();
    }
    if (!user) {
      setError("No hay usuario autenticado");
      setTrades([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('open_date', { ascending: false });
    if (error) setError(error.message);
    setTrades((data || []).map(toCamel));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  // Añadir trade
  const addTrade = async (trade) => {
    setLoading(true);
    setError(null);
    let user;
    if (supabase.auth.getUser) {
      const { data: userData } = await supabase.auth.getUser();
      user = userData?.user;
    } else {
      user = supabase.auth.user();
    }
    if (!user) {
      setError("No hay usuario autenticado");
      setLoading(false);
      return;
    }
    // No enviar id, y asegurar tipos numéricos
    const {
      id, // eslint-disable-line no-unused-vars
      entry,
      expectedExit,
      exit,
      amount,
      ...rest
    } = trade;
    const tradeToSend = {
      ...rest,
      entry: entry !== undefined && entry !== "" ? Number(entry) : null,
      expectedExit: expectedExit !== undefined && expectedExit !== "" ? Number(expectedExit) : null,
      exit: exit !== undefined && exit !== "" ? Number(exit) : null,
      amount: amount !== undefined && amount !== "" ? Number(amount) : null,
      open_date: rest.open_date === "" || rest.open_date === undefined ? null : rest.open_date,
      close_date: rest.close_date === "" || rest.close_date === undefined ? null : rest.close_date,
      user_id: user.id, // <-- ¡AQUÍ!
    };
    console.log('Insertando trade en Supabase:', toSnake(tradeToSend));
    const { error } = await supabase.from('trades').insert([toSnake(tradeToSend)]);
    if (error) {
      console.error('Error al insertar en Supabase:', error);
      setError(error.message + (error.details ? ' - ' + error.details : ''));
    }
    await fetchTrades();
  };

  // Borrar trade
  const deleteTrade = async (id) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.from('trades').delete().eq('id', id);
    if (error) setError(error.message);
    await fetchTrades();
  };

  // Actualizar trade (por ejemplo para cerrar)
  const updateTrade = async (id, updates) => {
    setLoading(true);
    setError(null);
    // Nunca enviar open_date ni close_date como string vacío o null. Si falta, usar el valor original del trade.
    const updatesSafe = { ...updates };
    const original = trades.find(t => t.id === id);
    if (!updatesSafe.open_date || updatesSafe.open_date === "") {
      updatesSafe.open_date = original?.openDate || original?.open_date || new Date().toISOString().slice(0, 10);
    }
    if (updatesSafe.close_date === undefined) {
      updatesSafe.close_date = original?.closeDate || original?.close_date || null;
    }
    // Asegura que entry, exit y amount sean numéricos como en addTrade
    if (updatesSafe.entry !== undefined && updatesSafe.entry !== "") updatesSafe.entry = Number(updatesSafe.entry);
    if (updatesSafe.exit !== undefined && updatesSafe.exit !== "") updatesSafe.exit = Number(updatesSafe.exit);
    if (updatesSafe.amount !== undefined && updatesSafe.amount !== "") updatesSafe.amount = Number(updatesSafe.amount);
    // Si hay exit y entry, calcula y agrega result/result_pct
    const entry = parseFloat(updatesSafe.entry ?? original?.entry);
    const exit = parseFloat(updatesSafe.exit ?? original?.exit);
    const amount = parseFloat(updatesSafe.amount ?? original?.amount);
    if (entry && exit && amount) {
      let result, result_pct;
      if ((updatesSafe.position ?? original?.position) === 'Short') {
        result = ((entry - exit) * amount) / entry;
        result_pct = ((entry - exit) / entry) * 100;
      } else {
        result = ((exit - entry) * amount) / entry;
        result_pct = ((exit - entry) / entry) * 100;
      }
      updatesSafe.result = Number(result.toFixed(2));
      updatesSafe.result_pct = Number(result_pct.toFixed(2));
    }
    // Renombra cualquier campo camelCase a snake_case antes de enviar
    if ('closeDate' in updatesSafe) {
      updatesSafe.close_date = updatesSafe.closeDate;
      delete updatesSafe.closeDate;
    }
    if ('openDate' in updatesSafe) {
      updatesSafe.open_date = updatesSafe.openDate;
      delete updatesSafe.openDate;
    }
    if ('createdAt' in updatesSafe) {
      delete updatesSafe.createdAt;
    }
    if ('expectedExit' in updatesSafe) {
      delete updatesSafe.expectedExit;
    }
    if ('userId' in updatesSafe) {
      delete updatesSafe.userId;
    }
    // Nunca permitir cambiar el user_id
    updatesSafe.user_id = original?.user_id;
    console.log('Actualizando trade en Supabase:', updatesSafe);
    const { error } = await supabase.from('trades').update(updatesSafe).eq('id', id);
    if (error) {
      console.error('Error al actualizar en Supabase:', error);
      setError(error.message + (error.details ? ' - ' + error.details : ''));
    }
    await fetchTrades();
  };


  return { trades, loading, error, addTrade, deleteTrade, updateTrade };
}
