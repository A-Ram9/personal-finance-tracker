import React, { useState } from 'react';
import TransactionForm from './TransactionForm';
import { Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Card, Typography, Box, Select, MenuItem, IconButton } from '@mui/material';
import { Delete as DeleteOutlineIcon, Edit as EditNoteIcon, FileDownload as FileDownloadIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '../lib/dates';

function Transactions({ transactions, onAdd, onUpdate, onDelete, formatAmount }) {
  const [editOpen, setEditOpen] = useState(false);
  const [editError, setEditError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');


  const deleteTransaction = async (id) => {
    setDeleteError('');
    try {
      await onDelete(id);
    } catch {
      setDeleteError("Couldn't delete. Please try again.");
    }
  };

  const openEdit = (transaction) => {
    setEditData(transaction);
    setEditError('');
    setEditOpen(true);
  };

  const handleEditChange = (e) => { setEditData({ ...editData, [e.target.name]: e.target.value }); };

  const saveEdit = async () => {
    setEditError('');
    try {
      await onUpdate(editData);
      setEditOpen(false);
    } catch {
      // Leave the dialog open so their changes aren't lost.
      setEditError("Couldn't save. Please try again.");
    }
  };

  // Advanced Date Filtering Logic
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.category.toLowerCase().includes(search.toLowerCase());
    const matchesType = !filterType || t.type === filterType;
    
    if (!matchesSearch || !matchesType) return false;
    if (timeFilter === 'all') return true;

    const tDate = new Date(t.date);
    const now = new Date();
    
    if (timeFilter === 'week') {
      const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
      return tDate >= oneWeekAgo;
    }
    if (timeFilter === 'month') {
      return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  // Native CSV Export Engine
  const exportToCSV = () => {
    if (filteredTransactions.length === 0) return;
    const headers = ['ID', 'Date', 'Category', 'Amount (INR)', 'Type\n'];
    const rows = filteredTransactions.map(t => `${t.id},${t.date},"${t.category}",${t.amount},${t.type}`);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + rows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FinTrack_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card sx={{ p: 4, background: 'background.paper' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main' }}>Ledger</Typography>
        <Button 
          variant="outlined" 
          startIcon={<FileDownloadIcon />} 
          onClick={exportToCSV}
          disabled={filteredTransactions.length === 0}
          sx={{ borderRadius: '12px', borderColor: 'border.main' }}
        >
          Export CSV
        </Button>
      </Box>
      
      <TransactionForm onAdd={onAdd} />

      {/* Control Filters Widget Layer */}
      <Box sx={{ display: 'flex', gap: 2, mt: 4, mb: 3, flexWrap: 'wrap' }}>
        <TextField label="Search" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ flexGrow: 2, minWidth: '200px' }} />
        
        <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} displayEmpty sx={{ flexGrow: 1, minWidth: '120px', borderRadius: '12px' }}>
          <MenuItem value="">All entries</MenuItem>
          <MenuItem value="income">Income</MenuItem>
          <MenuItem value="expense">Expenses</MenuItem>
        </Select>

        <Select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} sx={{ flexGrow: 1, minWidth: '120px', borderRadius: '12px' }}>
          <MenuItem value="all">All time</MenuItem>
          <MenuItem value="week">Last 7 days</MenuItem>
          <MenuItem value="month">This month</MenuItem>
        </Select>
      </Box>

      {deleteError && <Typography variant="caption" color="error" sx={{ display: 'block', mb: 2 }}>{deleteError}</Typography>}

      {/* Ledger Container with AnimatePresence Core */}
      <Box sx={{ maxHeight: '380px', overflowY: 'auto', pr: 1 }}>
        {transactions.length === 0 && (
          <Typography variant="body2" sx={{ color: 'text.secondary', py: 2 }}>No entries yet. Add your first one above.</Typography>
        )}
        {transactions.length > 0 && filteredTransactions.length === 0 && (
          <Typography variant="body2" sx={{ color: 'text.secondary', py: 2 }}>Nothing matches these filters.</Typography>
        )}
        <AnimatePresence initial={false}>
          {filteredTransactions.map(t => (
            <Box 
              key={t.id}
              component={motion.div}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, mb: 2,
                borderRadius: '16px', backgroundColor: 'background.default',
                borderLeft: '5px solid', borderLeftColor: t.type === 'income' ? 'income.main' : 'expense.main',
                transition: 'box-shadow 0.3s ease',
                '&:hover': { backgroundColor: 'background.paper', boxShadow: (theme) => theme.cardShadow }
              }}
            >
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>{t.category}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{formatDate(t.date)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body1" sx={{ typography: 'amount', fontWeight: 700, mr: 2, color: t.type === 'income' ? 'income.main' : 'expense.main' }}>
                  {t.type === 'income' ? '+' : '-'}{formatAmount(t.amount)}
                </Typography>
                <IconButton size="small" aria-label="Edit entry" onClick={() => openEdit(t)} sx={{ color: 'text.secondary' }}><EditNoteIcon /></IconButton>
                <IconButton size="small" aria-label="Delete entry" onClick={() => deleteTransaction(t.id)} sx={{ color: 'expense.main' }}><DeleteOutlineIcon /></IconButton>
              </Box>
            </Box>
          ))}
        </AnimatePresence>
      </Box>

      {/* Edit dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} PaperProps={{ sx: { p: 3, borderRadius: '24px' } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Edit entry</DialogTitle>
        <DialogContent>
          <TextField margin="dense" type="date" name="date" value={editData?.date || ''} onChange={handleEditChange} fullWidth InputLabelProps={{ shrink: true }} />
          <TextField margin="dense" name="category" label="Category" value={editData?.category || ''} onChange={handleEditChange} fullWidth />
          <TextField margin="dense" name="amount" label="Amount (₹)" type="number" value={editData?.amount || ''} onChange={handleEditChange} fullWidth />
          <TextField select margin="dense" name="type" label="Type" value={editData?.type || 'expense'} onChange={handleEditChange} fullWidth>
            <MenuItem value="income">Income</MenuItem>
            <MenuItem value="expense">Expense</MenuItem>
          </TextField>
          {editError && <Typography variant="caption" color="error">{editError}</Typography>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={saveEdit} variant="contained" color="primary">Save changes</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

export default Transactions;