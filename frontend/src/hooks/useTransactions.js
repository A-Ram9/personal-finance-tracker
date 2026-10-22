import { useEffect, useState } from 'react';
import api from '../api';

// Owns the logged-in user's transaction list. Call it ONCE (in App) and pass
// the results down. Every call to a hook gets its own separate state.
export default function useTransactions(user) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true); // true until the first fetch finishes
  const [error, setError] = useState(null);     // set if loading the list fails

  // First load, and reset on logout.
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoading(true);
      setError(null);
      return;
    }

    // If the user logs out before the request finishes, ignore its result.
    let cancelled = false;
    setError(null);
    api.get('/transactions')
      .then(res => { if (!cancelled) setTransactions(res.data); })
      .catch(err => { if (!cancelled) setError(err); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user]);

  // Reload after a change. A failure here is a loading problem, not a failed save,
  // so it goes into `error` instead of being thrown.
  const refresh = async () => {
    try {
      const res = await api.get('/transactions');
      setTransactions(res.data);
      setError(null);
    } catch (err) {
      setError(err);
    }
  };

  // These throw if the request fails, so the calling component can show "Couldn't save".
  const addTransaction = async (data) => {
    await api.post('/transactions', data);
    await refresh();
  };

  const updateTransaction = async (transaction) => {
    await api.put(`/transactions/${transaction.id}`, transaction);
    await refresh();
  };

  const deleteTransaction = async (id) => {
    await api.delete(`/transactions/${id}`);
    await refresh();
  };

  return { transactions, loading, error, addTransaction, updateTransaction, deleteTransaction };
}
