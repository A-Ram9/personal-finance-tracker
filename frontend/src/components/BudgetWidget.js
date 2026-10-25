import React, { useState } from 'react';
import { Card, Typography, Box, Slider, LinearProgress, Stack } from '@mui/material';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import { summarise, inMonth } from '../lib/summary';

function BudgetWidget({ transactions, formatAmount }) {
  const [budgetLimit, setBudgetLimit] = useState(50000); // Base Default limits inside INR

  // The savings rate stays all-time; the budget bar counts this calendar month only.
  const { income: totalInflow, expense: totalExpenses } = summarise(transactions);
  const spentThisMonth = summarise(inMonth(transactions)).expense;

  // Compute metric ratios safely
  const percentageUsed = Math.min((spentThisMonth / budgetLimit) * 100, 100);
  const savingsRate = totalInflow > 0 ? Math.max(((totalInflow - totalExpenses) / totalInflow) * 100, 0) : 0;

  return (
    <Card sx={{ p: 4, background: 'background.paper', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrackChangesIcon /> Monthly budget
          </Typography>
        </Stack>

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
          <Typography variant="body2" sx={{ fontWeight: 600 }}>Spent so far</Typography>
          <Typography variant="body2" sx={{ typography: 'amount', fontWeight: 700 }}>
            {percentageUsed.toFixed(0)}% ({formatAmount(spentThisMonth)} / {formatAmount(budgetLimit)})
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
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Savings rate</Typography>
        <Typography variant="h5" sx={{ typography: 'amount', fontWeight: 700, color: 'income.main' }}>{savingsRate.toFixed(1)}%</Typography>
      </Box>
    </Card>
  );
}

export default BudgetWidget;