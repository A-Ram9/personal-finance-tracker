import React from 'react';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { summarise } from '../lib/summary';

function SummaryCards({ transactions, periodPhrase, formatAmount }) {
  const { income, expense, balance } = summarise(transactions);

  const cards = [
    { label: `Income ${periodPhrase}`, value: income, color: 'income.main', icon: <ArrowUpwardIcon /> },
    { label: `Spent ${periodPhrase}`, value: expense, color: 'expense.main', icon: <ArrowDownwardIcon /> },
    { label: `Balance ${periodPhrase}`, value: balance, color: balance >= 0 ? 'income.main' : 'expense.main', icon: <AccountBalanceWalletIcon /> }
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((c, i) => (
        <Grid item xs={12} md={4} key={i}>
          <Card sx={{ background: 'background.paper' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1 }}>{c.label}</Typography>
                <Typography variant="h4" sx={{ typography: 'amount', fontWeight: 700 }}>
                  {formatAmount(c.value)}
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, borderRadius: '16px', backgroundColor: 'background.default', color: c.color }}>
                {c.icon}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default SummaryCards;