import React, { useState } from 'react';
import { Card, Typography, TextField, Button, Box, Stack, Paper, CircularProgress } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SendIcon from '@mui/icons-material/Send';
import api from '../api';
import { partOfDay } from '../lib/dates';

function FinGanPanel() {
  const [messages, setMessages] = useState(() => [
    { sender: 'fingan', text: `Good ${partOfDay()}. Ask me anything about your spending.` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/api/fingan/chat', { message: input });

      setMessages(prev => [...prev, { sender: 'fingan', text: res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'fingan', text: "FinGan isn't available right now. Is Ollama running?" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ p: 4, background: 'background.paper', mt: 4, display: 'flex', flexDirection: 'column', height: '450px' }}>
      <Stack direction="row" alignItems="center" gap={1} mb={2}>
        <AutoAwesomeIcon sx={{ color: 'income.main' }} />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>FinGan</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Private assistant · runs on your computer</Typography>
        </Box>
      </Stack>

      {/* Chat Space */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, display: 'flex', flexDirection: 'column', gap: 1.5, pr: 1 }}>
        {messages.map((msg, index) => (
          <Box key={index} sx={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
            <Paper elevation={0} sx={{
              p: 2, boxShadow: (theme) => theme.cardShadow,
              borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              backgroundColor: msg.sender === 'user' ? 'primaryFill.main' : 'background.default',
              border: msg.sender === 'user' ? 'none' : '1px solid',
              borderColor: 'border.main'
            }}>
              <Typography variant="body2" sx={{ color: msg.sender === 'user' ? 'primaryFill.contrastText' : 'text.primary', whiteSpace: 'pre-line' }}>
                {msg.text}
              </Typography>
            </Paper>
          </Box>
        ))}
        {loading && (
          <Box sx={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} sx={{ color: 'income.main' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Thinking…</Typography>
          </Box>
        )}
      </Box>

      {/* Input Tray */}
      <Stack direction="row" gap={1}>
        <TextField
          fullWidth size="small" variant="outlined" placeholder="Ask about your spending…"
          value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
        />
        <Button variant="contained" aria-label="Send" onClick={handleSend} sx={{ borderRadius: '12px', minWidth: '50px' }}>
          <SendIcon fontSize="small" />
        </Button>
      </Stack>
    </Card>
  );
}

export default FinGanPanel;