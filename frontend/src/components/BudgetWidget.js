import React, { useState } from 'react';
import { Card, Typography, Box, Slider, LinearProgress, Stack } from '@mui/material';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import { summarise } from '../lib/summary';

function BudgetWidget({ transactions, budgetTransactions, period, periodPhrase, formatAmount }) {
  const [budgetLimit, setBudgetLimit] = useState(50000); // Base Default limits inside INR

  // The savings rate follows the chosen period. A budget is always one month: the chosen month,
  // or this month when "All time" is selected (App works out which and passes budgetTransactions).
  const { income: totalInflow, expense: totalExpenses } = summarise(transactions);
  const spentInMonth = summarise(budgetTransactions).expense;
  const budgetMonthPhrase = period === 'last-month' ? 'last month' : 'this month';

  // Compute metric ratios safely
  const percentageUsed = Math.min((spentInMonth / budgetLimit) * 100, 100);
  // No income means there's nothing to save from, so show a dash rather than 0%.
  const savingsRate = totalInflow > 0 ? `${Math.max(((totalInflow - totalExpenses) / totalInflow) * 100, 0).toFixed(1)}%` : '—';

  return (
    <Card sx={{ p: 4, background: 'background.paper', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrackChangesIcon /> Monthly budget
          </Typography>
        </Stack>
        {period === 'all-time' && (
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: -1, mb: 2 }}>
            Budgets are monthly, so this shows the current month.
          </Typography>
        )}

        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
          Budget
        </Typography>
        
        <Slider
          value={budgetLimit}
          min={5000}
          max={200000}
          step={5000}
          onChange={(e, val) => setBudgetLimit(val)}
          sx={{ color: 'primary.main', mb: 3 }}
        />

        <Stack direction="row" justifyContent="space-between" mb={1}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>Spent {budgetMonthPhrase}</Typography>
          <Typography variant="body2" sx={{ typography: 'amount', fontWeight: 700 }}>
            {percentageUsed.toFixed(0)}% ({formatAmount(spentInMonth)} / {formatAmount(budgetLimit)})
          </Typography>
        </Stack>

        <Box sx={{ width: '100%', mb: 4 }}>
          <LinearProgress 
            variant="determinate" 
            value={percentageUsed} 
            sx={{
              height: 10, borderRadius: 5, backgroundColor: 'border.main',
              '& .MuiLinearProgress-bar': { backgroundColor: 'expense.main', borderRadius: 5 }
            }}
          />
        </Box>
      </Box>

      <Box sx={{ p: 2, borderRadius: '16px', backgroundColor: 'background.default', border: '1px solid', borderColor: 'border.main' }}>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Savings rate {periodPhrase}</Typography>
        <Typography variant="h5" sx={{ typography: 'amount', fontWeight: 700, color: 'income.main' }}>{savingsRate}</Typography>
      </Box>
    </Card>
  );
}

export default BudgetWidget;