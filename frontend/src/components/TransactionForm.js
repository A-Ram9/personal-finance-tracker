import React, { useState } from 'react';
import { TextField, Button, Select, MenuItem, Box, Typography } from '@mui/material';

function TransactionForm({ onAdd }) {
  const [form, setForm] = useState({ date: '', category: '', amount: '', type: 'expense' });
  const [saveError, setSaveError] = useState('');

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError('');
    try {
      await onAdd(form);
      setForm({ date: '', category: '', amount: '', type: 'expense' });
    } catch {
      // Keep what they typed so they can try again.
      setSaveError("Couldn't save. Please try again.");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <TextField name="date" type="date" value={form.date} onChange={handleChange} required InputLabelProps={{ shrink: true }} sx={{ flex: 1, minWidth: '150px' }} label=""/>
      <TextField name="category" label="Category" value={form.category} onChange={handleChange} required sx={{ flex: 2, minWidth: '200px' }} />
      <TextField name="amount" label="Amount (Base ₹)" type="number" value={form.amount} onChange={handleChange} required sx={{ flex: 1, minWidth: '120px' }} />
      <Select name="type" value={form.type} onChange={handleChange} sx={{ minWidth: '130px', borderRadius: '14px' }}>
        <MenuItem value="income">Income</MenuItem>
        <MenuItem value="expense">Expense</MenuItem>
      </Select>
      <Button type="submit" variant="contained" color="primary" sx={{ px: 4 }}>Add Transaction</Button>
      {saveError && <Typography variant="caption" color="error" sx={{ width: '100%' }}>{saveError}</Typography>}
    </Box>
  );
}

export default TransactionForm;