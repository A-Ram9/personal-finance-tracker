import React, { useState } from 'react';
import api from '../api';
import { Box, TextField, Button, Typography, Card, ToggleButtonGroup, ToggleButton, Fade } from '@mui/material';

const toggleSx = {
  flex: 1, border: 'none', color: 'text.secondary', textTransform: 'none',
  '&.Mui-selected, &.Mui-selected:hover': { borderRadius: '10px', backgroundColor: 'primaryFill.main', color: 'primaryFill.contrastText' }
};

// Chrome autofills before you touch the page but won't hand React the value until you do,
// so the field looks empty to MUI and the label sits on top of the text. MUI's
// :-webkit-autofill style starts a CSS animation called 'mui-auto-fill'; we listen for it
// and lift the label ourselves ('mui-auto-fill-cancel' runs when the autofill goes away).
function useAutofillLabel() {
  const [autofilled, setAutofilled] = useState(false);
  return {
    inputProps: {
      onAnimationStart: (e) => {
        if (e.animationName === 'mui-auto-fill') setAutofilled(true);
        if (e.animationName === 'mui-auto-fill-cancel') setAutofilled(false);
      },
    },
    InputLabelProps: autofilled ? { shrink: true } : undefined,
  };
}

// cardRef lets the brand intro measure this card so its vault door can sit exactly on top.
function Auth({ onAuthSuccess, cardRef }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const usernameAutofill = useAutofillLabel();
  const passwordAutofill = useAutofillLabel();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    const endpoint = isLogin ? 'login' : 'register';
    try {
      const res = await api.post(`/${endpoint}`, { username, password });
      if (isLogin) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('username', res.data.username);
        onAuthSuccess(res.data.username);
      } else {
        setIsLogin(true);
        setNotice('Account created. Please sign in.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    }
  };

  return (
    <Box sx={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'background.default',
      overflow: 'hidden'
    }}>
      {/* Floating Currency Symbols Animation Overlay */}
      <Box sx={{
        position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1,
        '@media (prefers-reduced-motion: reduce)': { display: 'none' },
        '& span': {
          position: 'absolute', color: 'softFill.main', fontSize: '3rem', fontWeight: 'bold',
          // 'both' = use the first keyframe before the animation starts, so a symbol can never sit unanimated.
          animation: 'floatAnimation 12s infinite linear both'
        },
        '@keyframes floatAnimation': {
          '0%': { transform: 'translateY(100vh) rotate(0deg)', opacity: 0 },
          '10%': { opacity: 1 },
          '90%': { opacity: 1 },
          '100%': { transform: 'translateY(-10vh) rotate(360deg)', opacity: 0 }
        }
      }}>
        {/* Negative delays start each symbol part-way through its flight, so the screen is populated on load. */}
        <span style={{ left: '8%', animationDelay: '-2s', animationDuration: '14s' }}>₹</span>
        <span style={{ left: '28%', animationDelay: '-11s', animationDuration: '18s' }}>$</span>
        <span style={{ left: '47%', animationDelay: '-5s', animationDuration: '15s' }}>ر.ع.</span>
        <span style={{ left: '68%', animationDelay: '-10s', animationDuration: '12s' }}>£</span>
        <span style={{ left: '87%', animationDelay: '-10s', animationDuration: '20s' }}>₹</span>
      </Box>

      <Fade in={true} timeout={1000}>
        <Card ref={cardRef} sx={{
          p: 5, width: '100%', maxWidth: 420, zIndex: 2, textAlign: 'center'
        }}>
          <Typography variant="h4" sx={{ typography: 'wordmark', fontSize: '3.25rem', lineHeight: 1.2, color: 'primary.main', mb: 1 }}>
            FinTrack
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
            Your accounts, kept with care.
          </Typography>

          <ToggleButtonGroup
            value={isLogin}
            exclusive
            onChange={(e, val) => { if (val !== null) { setIsLogin(val); setNotice(''); } }}
            sx={{ mb: 4, width: '100%', backgroundColor: 'background.default', borderRadius: '12px', p: 0.5 }}
          >
            <ToggleButton value={true} sx={toggleSx}>Sign in</ToggleButton>
            <ToggleButton value={false} sx={toggleSx}>Create account</ToggleButton>
          </ToggleButtonGroup>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth variant="outlined" label="Username" value={username}
              onChange={(e) => { setUsername(e.target.value); setNotice(''); }} required
              {...usernameAutofill} sx={{ mb: 2 }}
            />
            <TextField
              fullWidth variant="outlined" label="Password" type="password" value={password}
              onChange={(e) => { setPassword(e.target.value); setNotice(''); }} required
              {...passwordAutofill} sx={{ mb: 3 }}
            />

            {error && <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mb: 2 }}>{error}</Typography>}
            {notice && <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>{notice}</Typography>}

            <Button type="submit" variant="contained" fullWidth sx={{ py: 1.5 }}>
              {isLogin ? 'Sign in' : 'Create account'}
            </Button>
          </form>
        </Card>
      </Fade>
    </Box>
  );
}

export default Auth;