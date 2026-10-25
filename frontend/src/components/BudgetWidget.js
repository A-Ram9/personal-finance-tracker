import React, { useState } from 'react';
import { Card, Typography, Box, Slider, LinearProgress, Stack } from '@mui/material';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import { summarise } from '../lib/summary';

function BudgetWidget({ transactions, formatAmount }) {
  const [budgetLimit, setBudgetLimit] = useState(50000); // Base Default limits inside INR

  const { income: totalInflow, expense: totalExpenses } = summarise(transactions);

  // Compute metric ratios safely
  const percentageUsed = Math.min((totalExpenses / budgetLimit) * 100, 100);
  const savingsRate = totalInflow > 0 ? Math.max(((totalInflow - totalExpenses) / totalInflow) * 100, 0) : 0;

  return (
    <Card sx={{ p: 4, background: 'background.paper', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrackChangesIcon /> Target Ceiling Budget
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
            BASE INR SETTING
          </Typography>
        </Stack>

        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
          Adjust Monthly Target Limit:
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
          <Typography variant="body2" sx={{ fontWeight: 600 }}>Ceiling Spent Rate:</Typography>
          <Typography variant="body2" sx={{ typography: 'amount', fontWeight: 700 }}>
            {percentageUsed.toFixed(0)}% ({formatAmount(totalExpenses)} / {formatAmount(budgetLimit)})
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
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Dynamic Net Savings Rate</Typography>
            <Typography variant="h5" sx={{ typography: 'amount', fontWeight: 700, color: 'income.main' }}>{savingsRate.toFixed(1)}%</Typography>
          </Box>
          <Box sx={{ width: 50, height: 50, borderRadius: '50%', border: '4px solid', borderColor: 'softFill.main', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
            ROI
          </Box>
        </Stack>
      </Box>
    </Card>
  );
}

export default BudgetWidget;