import { createTheme, alpha, darken } from '@mui/material/styles';

// Semantic tokens: each colour is named by its job, not its look.
// Components ask for 'income.main' or 'border.main'; this table decides the hex per mode.
export const tokens = {
  light: {
    background: '#FFF6E8',
    surface: '#FFFCF6',
    border: '#EADBC4',
    textPrimary: '#2A1E1A',
    textSecondary: '#6B5A52',
    expense: '#C1121F',
    income: '#2F5D8C',
    softFill: '#A9C6EA',
    // Solid cherry for contained buttons. Same in both modes, unlike `expense`, which is a text colour.
    primaryFill: '#C1121F',
    onPrimaryFill: '#FFF6E8',
    // Pale sky for small highlights on cherry (the intro chest). Same in both modes.
    skyHighlight: '#A9C6EA',
  },
  dark: {
    background: '#1A1214',
    surface: '#241A1C',
    border: '#3A2B2D',
    textPrimary: '#FFF6E8',
    textSecondary: '#C9B8A6',
    expense: '#E8505B',
    income: '#A9C6EA',
    softFill: '#2F5D8C',
    primaryFill: '#C1121F',
    onPrimaryFill: '#FFF6E8',
    skyHighlight: '#A9C6EA',
  },
};

const FONTS = {
  wordmark: "'Pinyon Script', cursive",
  heading: "'Cormorant Garamond', Georgia, serif",
  body: "'IBM Plex Sans', system-ui, -apple-system, sans-serif",
};

// Blend two hex colours. amount 0 gives `a`, 1 gives `b`.
function mix(a, b, amount) {
  const channel = (hex, i) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  const blended = [0, 1, 2].map(i => {
    const value = Math.round(channel(a, i) + (channel(b, i) - channel(a, i)) * amount);
    return value.toString(16).padStart(2, '0');
  });
  return `#${blended.join('')}`;
}

// Category colours: cherry, sky, the blend between them, then a tint of each.
// Light mode tints toward the cream background and dark mode toward the light text,
// so every slice keeps enough contrast against its card.
function chartPalette(t, mode) {
  const tintTarget = mode === 'light' ? t.background : t.textPrimary;
  return [
    t.expense,
    t.income,
    mix(t.expense, t.income, 0.5),
    mix(t.expense, tintTarget, 0.4),
    mix(t.income, tintTarget, 0.4),
  ];
}

export function buildTheme(mode) {
  const t = tokens[mode];
  // Text colour that sits on a solid cherry or sky fill (buttons, the user's chat bubble).
  const onAccent = mode === 'light' ? t.surface : t.background;
  // Shadows read as a grey glow on the dark background, so dark mode relies on the border token alone.
  const cardShadow = mode === 'light' ? `0 8px 24px ${alpha(t.textPrimary, 0.06)}` : 'none';
  const autofillCover = {
    WebkitBoxShadow: `0 0 0 100px ${t.surface} inset`,
    WebkitTextFillColor: t.textPrimary,
    caretColor: t.textPrimary,
    borderRadius: 'inherit',
  };

  return createTheme({
    palette: {
      mode,
      primary: { main: t.expense, contrastText: onAccent },
      secondary: { main: t.income, contrastText: onAccent },
      error: { main: t.expense, contrastText: onAccent },
      expense: { main: t.expense, contrastText: onAccent },
      income: { main: t.income, contrastText: onAccent },
      primaryFill: { main: t.primaryFill, contrastText: t.onPrimaryFill },
      skyHighlight: { main: t.skyHighlight },
      softFill: { main: t.softFill },
      border: { main: t.border },
      divider: t.border,
      background: { default: t.background, paper: t.surface },
      text: { primary: t.textPrimary, secondary: t.textSecondary },
      chart: chartPalette(t, mode),
    },
    // Use with sx={{ boxShadow: (theme) => theme.cardShadow }} on anything that should lift like a card.
    cardShadow,
    typography: {
      fontFamily: FONTS.body,
      h1: { fontFamily: FONTS.heading, fontWeight: 700 },
      h2: { fontFamily: FONTS.heading, fontWeight: 700 },
      h3: { fontFamily: FONTS.heading, fontWeight: 700 },
      h4: { fontFamily: FONTS.heading, fontWeight: 700 },
      h5: { fontFamily: FONTS.heading, fontWeight: 700 },
      h6: { fontFamily: FONTS.heading, fontWeight: 600 },
      // Use with sx={{ typography: 'amount' }} so digits line up in columns.
      amount: { fontFamily: FONTS.body, fontVariantNumeric: 'tabular-nums' },
      wordmark: { fontFamily: FONTS.wordmark, fontWeight: 400 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' },
          '*::-webkit-scrollbar': { width: 6, height: 6 },
          '*::-webkit-scrollbar-track': { background: 'transparent' },
          '*::-webkit-scrollbar-thumb': { background: t.border, borderRadius: 10 },
          '*::-webkit-scrollbar-thumb:hover': { background: t.softFill },
        },
      },
      // MUI adds a white overlay gradient to dark-mode Paper; turn it off so the surface token shows as-is.
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: t.surface,
            border: `1px solid ${t.border}`,
            boxShadow: cardShadow,
            borderRadius: '24px',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '14px',
            textTransform: 'none',
            fontWeight: 600,
            padding: '10px 22px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          containedPrimary: {
            backgroundColor: t.primaryFill,
            color: t.onPrimaryFill,
            '&:hover': { backgroundColor: darken(t.primaryFill, 0.15) },
          },
        },
      },
      // Chrome paints autofilled fields pale blue. A huge inset shadow covers that paint with our surface,
      // and -webkit-text-fill-color is the only way to recolour autofilled text.
      // OutlinedInput and FilledInput carry their own dark-mode autofill colour (steel blue #266798)
      // that outranks MuiInputBase, so the cover is set on each of them too.
      MuiInputBase: { styleOverrides: { input: { '&:-webkit-autofill': autofillCover } } },
      MuiOutlinedInput: { styleOverrides: { input: { '&:-webkit-autofill': autofillCover } } },
      MuiFilledInput: { styleOverrides: { input: { '&:-webkit-autofill': autofillCover } } },
    },
  });
}
