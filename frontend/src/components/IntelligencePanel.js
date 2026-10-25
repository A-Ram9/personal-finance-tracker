import React from 'react';
import { Card, Typography, Grid, Box, Stack, Chip } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SpeedIcon from '@mui/icons-material/Speed';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { summarise, expensesByCategory, healthGrade, weeklyPace } from '../lib/summary';

const GRADES = {
  'A+': { label: 'Saving most of what you earn', color: 'income.main' },
  A: { label: 'Comfortably within your means', color: 'income.main' },
  B: { label: 'Spending a fair share of income', color: 'text.secondary' },
  C: { label: 'Spending most of what you earn', color: 'expense.main' },
  D: { label: 'Very little left over', color: 'expense.main' },
  F: { label: 'Spending more than you earn', color: 'expense.main' },
};

// chip: null means no judgement is shown.
const PACE = {
  steady: { chip: 'Steady', text: 'Spending has been steady.', color: 'income.main' },
  busier: { chip: 'Busier than usual', text: 'This week has been heavier than usual.', color: 'expense.main' },
  'not-enough-history': { chip: null, text: 'Not enough history yet.', color: 'text.secondary' },
};

const innerBoxSx = { p: 3, borderRadius: '16px', backgroundColor: 'background.default', border: '1px solid', borderColor: 'border.main' };

function IntelligencePanel({ transactions, allTransactions, periodPhrase, formatAmount }) {
  // 1. Totals for the chosen period
  const { income: totalInflow, expense: totalOutflow } = summarise(transactions);

  // 2. Top expense category (expensesByCategory is sorted largest first)
  const [top] = expensesByCategory(transactions);
  const topCategory = top ? top.name : 'None';
  const maxExpense = top ? top.value : 0;

  // 3. Spending health: summary.js picks the grade, this picks the words and colour
  const grade = healthGrade(totalInflow, totalOutflow);
  const health = grade
    ? { grade, ...GRADES[grade] }
    : { grade: '—', label: 'No income recorded for this period', color: 'text.secondary' };

  // 4. This week: always the last 7 days against the usual week, whatever period is chosen
  const pace = weeklyPace(allTransactions);
  const velocity = {
    spent: pace.thisWeek > 0 ? `${formatAmount(pace.thisWeek)} spent in the last 7 days` : 'Nothing spent in the last 7 days',
    ...PACE[pace.status],
  };

  return (
    <Card sx={{ p: 4, background: 'background.paper', width: '100%', mt: 4 }}>
      <Stack direction="row" alignItems="center" gap={1} mb={3}>
        <AutoAwesomeIcon sx={{ color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
          Insights
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        {/* Spending health */}
        <Grid item xs={12} md={4}>
          <Box sx={{ ...innerBoxSx, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <AccountBalanceWalletIcon fontSize="inherit" /> Spending health {periodPhrase}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>{health.label}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Spending as a share of income</Typography>
            </Box>
            <Box sx={{ width: 65, height: 65, borderRadius: '14px', backgroundColor: 'background.paper', border: '2px solid', borderColor: health.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 900, color: health.color }}>{health.grade}</Typography>
            </Box>
          </Box>
        </Grid>

        {/* Largest expense */}
        <Grid item xs={12} md={4}>
          <Box sx={{ ...innerBoxSx, height: '100%' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              <TrendingUpIcon fontSize="inherit" /> Largest expense {periodPhrase}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: maxExpense > 0 ? 'expense.main' : 'text.primary', mb: 0.5 }}>
              {topCategory}
            </Typography>
            <Typography variant="body2" sx={{ typography: 'amount', color: 'text.secondary', fontWeight: 600 }}>
              {maxExpense > 0 ? `${formatAmount(maxExpense)} of your spending` : `No expenses ${periodPhrase}`}
            </Typography>
          </Box>
        </Grid>

        {/* This week */}
        <Grid item xs={12} md={4}>
          <Box sx={{ ...innerBoxSx, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SpeedIcon fontSize="inherit" /> This week
              </Typography>
              {velocity.chip && <Chip label={velocity.chip} size="small" sx={{ backgroundColor: 'background.paper', color: velocity.color, fontWeight: 700, border: '1px solid', borderColor: velocity.color, fontSize: '0.65rem' }} />}
            </Stack>
            <Typography variant="body2" sx={{ typography: 'amount', fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
              {velocity.spent}
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