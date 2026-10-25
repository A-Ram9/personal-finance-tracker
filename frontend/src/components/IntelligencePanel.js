import React from 'react';
import { Card, Typography, Grid, Box, Stack, Chip } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SpeedIcon from '@mui/icons-material/Speed';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { summarise, expensesByCategory } from '../lib/summary';

const innerBoxSx = { p: 3, borderRadius: '16px', backgroundColor: 'background.default', border: '1px solid', borderColor: 'border.main' };

function IntelligencePanel({ transactions, formatAmount }) {
  // 1. Totals
  const outflows = transactions.filter(t => t.type === 'expense');
  const { income: totalInflow, expense: totalOutflow } = summarise(transactions);

  // 2. Top expense category (expensesByCategory is sorted largest first)
  const [top] = expensesByCategory(transactions);
  const topCategory = top ? top.name : 'None';
  const maxExpense = top ? top.value : 0;

  // 3. Algorithmic Health Grader Core
  const computeHealthScore = () => {
    if (totalInflow === 0 && totalOutflow === 0) return { grade: 'N/A', label: 'No Data Ledgered', color: 'text.secondary' };
    if (totalInflow === 0 && totalOutflow > 0) return { grade: 'F', label: 'Critical Outflow Deficit', color: 'expense.main' };

    const burnRatio = totalOutflow / totalInflow;

    if (burnRatio <= 0.3) return { grade: 'A+', label: 'Elite Wealth Accumulation', color: 'income.main' };
    if (burnRatio <= 0.5) return { grade: 'A', label: 'Strong Financial Health', color: 'income.main' };
    if (burnRatio <= 0.7) return { grade: 'B', label: 'Moderate Burn Trajectory', color: 'text.secondary' };
    if (burnRatio <= 0.9) return { grade: 'C', label: 'Tight Operational Bounds', color: 'expense.main' };
    return { grade: 'D', label: 'High Dependency Risk', color: 'expense.main' };
  };

  const health = computeHealthScore();

  // 4. Burn Velocity Analytics (Past 7 Days vs Total Average)
  const computeVelocity = () => {
    if (outflows.length === 0) return { status: 'Optimal', rate: '0%', text: 'No recorded drainage pathways.', color: 'income.main' };
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentOutflow = summarise(outflows.filter(t => new Date(t.date) >= sevenDaysAgo)).expense;

    if (recentOutflow > (totalOutflow * 0.5) && outflows.length > 2) {
      return { status: 'Accelerating', rate: 'High', text: 'Recent outlays are heavy. Consider freezing non-essentials.', color: 'expense.main' };
    }
    return { status: 'Stable', rate: 'Nominal', text: 'Velocity parameters remain fully stable.', color: 'income.main' };
  };

  const velocity = computeVelocity();

  return (
    <Card sx={{ p: 4, background: 'background.paper', width: '100%', mt: 4 }}>
      <Stack direction="row" alignItems="center" gap={1} mb={3}>
        <AutoAwesomeIcon sx={{ color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
          Fintrack Financial Intelligence
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        {/* Metric Card 1: Algorithmic Health Grade */}
        <Grid item xs={12} md={4}>
          <Box sx={{ ...innerBoxSx, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <AccountBalanceWalletIcon fontSize="inherit" /> SYSTEM HEALTH GRADE
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>{health.label}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Based on income-to-loss ratios</Typography>
            </Box>
            <Box sx={{ width: 65, height: 65, borderRadius: '14px', backgroundColor: 'background.paper', border: '2px solid', borderColor: health.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 900, color: health.color }}>{health.grade}</Typography>
            </Box>
          </Box>
        </Grid>

        {/* Metric Card 2: Highest Inroad Loss Vector */}
        <Grid item xs={12} md={4}>
          <Box sx={{ ...innerBoxSx, height: '100%' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              <TrendingUpIcon fontSize="inherit" /> PRIMARY OUTFLOW DRAIN
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: maxExpense > 0 ? 'expense.main' : 'text.primary', mb: 0.5 }}>
              {topCategory}
            </Typography>
            <Typography variant="body2" sx={{ typography: 'amount', color: 'text.secondary', fontWeight: 600 }}>
              {maxExpense > 0 ? `Accounting for ${formatAmount(maxExpense)}` : 'No expenses logged yet'}
            </Typography>
          </Box>
        </Grid>

        {/* Metric Card 3: Spending Velocity Tracker */}
        <Grid item xs={12} md={4}>
          <Box sx={{ ...innerBoxSx, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SpeedIcon fontSize="inherit" /> CAPITAL VELOCITY
              </Typography>
              <Chip label={velocity.status} size="small" sx={{ backgroundColor: 'background.paper', color: velocity.color, fontWeight: 700, border: '1px solid', borderColor: velocity.color, fontSize: '0.65rem' }} />
            </Stack>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
              {velocity.rate} Spending Momentum
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.3 }}>
              {velocity.text}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
}

export default IntelligencePanel;