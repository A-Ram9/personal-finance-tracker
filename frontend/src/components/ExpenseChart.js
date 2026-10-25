import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, Typography, Box, useTheme } from '@mui/material';

function ExpenseChart({ data = [], formatAmount }) {
  // Recharts takes plain colour strings, not 'income.main' paths, so read them from the theme.
  const theme = useTheme();
  const COLORS = theme.palette.chart;

  if (!data || data.length === 0) {
    return (
      <Card sx={{ p: 4, width: '100%', maxWidth: 500, textAlign: 'center' }}>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>No distribution data found.</Typography>
      </Card>
    );
  }

  // Slices stay in INR: converting every value by the same rate wouldn't change their sizes.
  // A gap (and outline) only makes sense between slices; a lone slice would show a seam.
  const hasGaps = data.length > 1;

  return (
    <Card sx={{ p: 4, width: '100%', maxWidth: 550, background: 'background.paper', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 800, alignSelf: 'flex-start', color: 'primary.main' }}>Category Allocation</Typography>
      <Box sx={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%" cy="50%"
              outerRadius={100}
              innerRadius={60} // Donut style configuration for sleek look
              paddingAngle={hasGaps ? 4 : 0}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={hasGaps ? theme.palette.background.paper : 'none'} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name) => [formatAmount(value), name]}
              contentStyle={{
                background: theme.palette.background.paper, color: theme.palette.text.primary,
                border: `1px solid ${theme.palette.border.main}`, borderRadius: '12px',
                boxShadow: theme.cardShadow, fontVariantNumeric: 'tabular-nums'
              }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  );
}

export default ExpenseChart;