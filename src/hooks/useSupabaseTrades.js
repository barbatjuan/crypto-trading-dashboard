// src/hooks/useSupabaseTrades.js
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { toSnake, toCamel } from '../utils/caseMap';

// Devuelve: { trades, loading, error, addTrade, deleteTrade, updateTrade }
export default function useSupabaseTrades() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar trades al inicio
  const fetchTrades = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('trades')
      .select('*') // No usar columns codificados ni comillas dobles
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
    console.log('Actualizando trade en Supabase:', toSnake(updates));
    const { error } = await supabase.from('trades').update(toSnake(updates)).eq('id', id);
    if (error) {
      console.error('Error al actualizar en Supabase:', error);
      setError(error.message + (error.details ? ' - ' + error.details : ''));
    }
    await fetchTrades();
  };

  return { trades, loading, error, addTrade, deleteTrade, updateTrade };
}
