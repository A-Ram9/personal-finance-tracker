import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Transactions from './components/Transactions';
import ExpenseChart from './components/ExpenseChart';
import SummaryCards from './components/SummaryCards';
import BudgetWidget from './components/BudgetWidget';
import DashboardSkeleton from './components/DashboardSkeleton'; 
import IntelligencePanel from './components/IntelligencePanel'; // Intelligence engine successfully linked
import FinGanPanel from './components/FinGanPanel'; // NEW: FinGan AI Layer Imported
import Auth from './components/Auth';
import useTransactions from './hooks/useTransactions';
import { expensesByCategory } from './lib/summary';
import { formatMoney } from './lib/money';
import { onUnauthorized } from './api';
import { Container, Typography, Grid, Select, MenuItem, Box, IconButton, Alert } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import { motion, AnimatePresence } from 'framer-motion';

function App({ toggleTheme, mode }) {
  const [user, setUser] = useState(localStorage.getItem('username') || null);
  const [currency, setCurrency] = useState('INR');
  const [rates, setRates] = useState({ INR: 1, USD: 0.012, NPR: 1.60, OMR: 0.0046 });
  // Hooks must run on every render, so this sits above the `if (!user)` return below.
  const { transactions, loading, error, addTransaction, updateTransaction, deleteTransaction } = useTransactions(user);
  // Derived, not stored: recalculated from `transactions` on every render.
  const chartData = expensesByCategory(transactions);

  useEffect(() => {
    // Sync external currency indexes
    axios.get('https://open.er-api.com/v6/latest/INR')
      .then(res => {
        if (res.data && res.data.rates) setRates(res.data.rates);
      })
      .catch(() => console.log("Using cached currency profiles."));
  }, []);

  // If the backend rejects our token (expired), api.js calls this and we show the login screen.
  useEffect(() => {
    onUnauthorized(() => setUser(null));
  }, []);

  // Amounts are stored in INR: convert to the chosen currency, then format for display.
  const formatAmount = (amountInINR) => formatMoney(amountInINR * (rates[currency] || 1), currency);

  const logout = () => {
    // Only remove login data; clear() would also wipe the saved light/dark choice.
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUser(null);
  };

  if (!user) return <Auth onAuthSuccess={(name) => setUser(name)} />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <AnimatePresence mode="wait">
        {loading ? (
          // Shimmer State Phase
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DashboardSkeleton />
          </motion.div>
        ) : (
          // Main System Loaded Phase
          <motion.div 
            key="dashboard" 
            initial={{ opacity: 0, scale: 0.99 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.4 }}
          >
            
            {/* Header Greeting Banner Row */}
            <Box sx={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                p: 3, mb: 4, borderRadius: '24px', backgroundColor: 'background.paper',
                border: '1px solid', borderColor: 'border.main'
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ typography: 'wordmark', fontSize: '2.25rem', lineHeight: 1, color: 'primary.main' }}>
                  FinTrack
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ textAlign: 'center', fontWeight: 700, flex: 2, color: 'text.primary' }}>
                Welcome {user} ! Let's stay on track!
              </Typography>
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 1, alignItems: 'center' }}>
                <Select
                  value={currency} onChange={(e) => setCurrency(e.target.value)} size="small"
                  sx={{ borderRadius: '12px', mx: 1, height: '40px', fontWeight: 700 }}
                >
                  <MenuItem value="INR">INR (₹)</MenuItem>
                  <MenuItem value="USD">USD ($)</MenuItem>
                  <MenuItem value="NPR">NPR (₨)</MenuItem>
                  <MenuItem value="OMR">OMR (ر.ع.)</MenuItem>
                </Select>
                <IconButton onClick={toggleTheme} color="inherit">
                  {mode === 'dark' ? <LightModeIcon sx={{ color: 'text.primary' }} /> : <DarkModeIcon sx={{ color: 'text.primary' }} />}
                </IconButton>
                <IconButton onClick={logout} color="error"><LogoutIcon /></IconButton>
              </Box>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 4 }}>
                Couldn't load your transactions. Is the backend running?
              </Alert>
            )}

            {/* Layout Architecture Grid Row Map */}
            <Grid container spacing={4}>
              
              {/* Row 1: Operations Input Core & Budget Threshold Slider */}
              <Grid item xs={12} md={7}>
                <Transactions
                  transactions={transactions}
                  onAdd={addTransaction}
                  onUpdate={updateTransaction}
                  onDelete={deleteTransaction}
                  formatAmount={formatAmount} />
              </Grid>
              <Grid item xs={12} md={5}>
                <BudgetWidget transactions={transactions} formatAmount={formatAmount} />
              </Grid>
              
              {/* Row 2: Metrics Summary Badges */}
              <Grid item xs={12}>
                <SummaryCards transactions={transactions} formatAmount={formatAmount} />
              </Grid>

              {/* Row 3: Category Allocation Analysis Block */}
              <Grid item xs={12} display="flex" justifyContent="center">
                <ExpenseChart data={chartData} formatAmount={formatAmount} />
              </Grid>
              
              {/* Row 4: Algorithmic Intelligence Trend Advisor Panel */}
              <Grid item xs={12}>
                <IntelligencePanel transactions={transactions} formatAmount={formatAmount} />
              </Grid>

              {/* ======================================================= */}
              {/* Row 5: NEW: FinGan Premium Off-Grid Local AI Bot Core    */}
              {/* ======================================================= */}
              <Grid item xs={12}>
                <FinGanPanel />
              </Grid>

            </Grid>

          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  );
}

export default App;