import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { useTheme, darken, alpha } from '@mui/material/styles';
import { motion, useAnimate, useReducedMotion, stagger } from 'framer-motion';

// Each symbol's centre across the 240px stage.
const SYMBOLS = [
  { char: '₹', x: 84 },
  { char: '$', x: 108 },
  { char: '£', x: 132 },
  { char: 'ر.ع.', x: 158 },
];

const LID_OPEN = -30; // degrees, pivoting on the lid's back (right) corner
const LID_LIFTED = -40;
const MAX_WAIT_MS = 3000; // never hold anyone here longer than this, even if fonts are slow
const REDUCED_MIN_MS = 400;

const part = (name) => `[data-part="${name}"]`;

// The whole story as one timeline. Each step starts when the previous one ends,
// unless `at` says otherwise: a number is seconds from the start, '-0.1' means 0.1s before the previous step ends.
const SEQUENCE = [
  // 0.00–0.30s: chest fades in and rises slightly
  [part('chest'), { opacity: [0, 1], y: [8, 0] }, { duration: 0.3, ease: 'easeOut' }],
  // 0.15–0.74s: symbols drop in one after another, while the glow inside fills
  [part('symbol'), { y: [-130, 0], opacity: [0, 1] }, { duration: 0.35, delay: stagger(0.08), ease: 'easeInOut', at: 0.15 }],
  [part('glow'), { opacity: [0, 0.9] }, { duration: 0.6, at: 0.15 }],
  // 0.75–0.93s: lid closes
  [part('lid'), { rotate: [LID_OPEN, 0] }, { duration: 0.18, ease: 'easeOut' }],
  // 0.93–1.25s: a gentle sway from the base as it settles
  [part('chest'), { rotate: [0, -3, 2.5, -1.5, 0] }, { duration: 0.32, ease: 'easeInOut' }],
  // 1.25–1.50s: lid lifts...
  [part('lid'), { rotate: [0, LID_LIFTED] }, { duration: 0.25, ease: 'easeOut' }],
  // ...and from 1.40s the symbols drift up and out
  [part('symbol'), { y: -150, opacity: 0 }, { duration: 0.35, delay: stagger(0.03), ease: 'easeOut', at: '-0.1' }],
];

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Resolves once the web fonts have loaded, so the login never appears in a fallback font.
function fontsReady() {
  try {
    return document.fonts?.ready ?? Promise.resolve();
  } catch {
    return Promise.resolve();
  }
}

function BrandIntro({ onDone }) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const [scope, animate] = useAnimate();
  // Keep the latest onDone without restarting the effect when App re-renders.
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    let finished = false;
    let controls = null;

    const finish = () => {
      if (finished) return;
      finished = true;
      controls?.stop();
      onDoneRef.current();
    };

    // Reduced motion: no drop, sway or lid; just wait briefly for fonts, then App fades us out.
    const played = reduceMotion ? wait(REDUCED_MIN_MS) : (controls = animate(SEQUENCE));
    Promise.race([Promise.all([played, fontsReady()]), wait(MAX_WAIT_MS)]).then(finish);

    // Skipping is immediate and doesn't wait for fonts.
    window.addEventListener('pointerdown', finish);
    window.addEventListener('keydown', finish);
    return () => {
      finished = true;
      controls?.stop();
      window.removeEventListener('pointerdown', finish);
      window.removeEventListener('keydown', finish);
    };
  }, [animate, reduceMotion]);

  const fill = theme.palette.primaryFill.main;
  const band = theme.palette.primaryFill.contrastText;
  const sky = theme.palette.skyHighlight.main;
  const inside = darken(fill, 0.45);

  // Starting poses, so the first frame matches the timeline before it starts.
  const start = reduceMotion
    ? { chest: 1, symbol: 0, lid: 0, glow: 0.9 }
    : { chest: 0, symbol: 0, lid: LID_OPEN, glow: 0 };

  return (
    <Box
      component={motion.div}
      aria-hidden="true"
      initial={false}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0.2 : 0.3, ease: 'easeOut' }}
      sx={{
        position: 'fixed', inset: 0, zIndex: (t) => t.zIndex.modal + 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'background.default', cursor: 'pointer',
      }}
    >
      <Box ref={scope} sx={{ position: 'relative', width: 240, height: 240 }}>
        {/* Everything that sways. Pivot at the chest's base (y = 200 of 240). */}
        <Box data-part="chest" style={{ opacity: start.chest, transformOrigin: '50% 83.3%' }} sx={{ position: 'absolute', inset: 0 }}>
          {/* Soft shadow on the floor */}
          <svg width="240" height="240" style={{ position: 'absolute', inset: 0 }}>
            <ellipse cx="120" cy="206" rx="78" ry="7" fill={alpha(theme.palette.text.primary, 0.08)} />
          </svg>

          {/* Inside of the chest, with the sky glow that brightens as it fills */}
          <Box sx={{ position: 'absolute', left: 56, top: 106, width: 128, height: 22, borderRadius: '6px', backgroundColor: inside, overflow: 'hidden' }}>
            <Box data-part="glow" style={{ opacity: start.glow }} sx={{ position: 'absolute', inset: '4px 8px', borderRadius: '50%', backgroundColor: sky, filter: 'blur(6px)' }} />
          </Box>

          {/* Lid: drawn behind the falling symbols, as an open lid stands at the back. Hinge at bottom right. */}
          <Box data-part="lid" style={{ transform: `rotate(${start.lid}deg)`, transformOrigin: '100% 100%' }} sx={{ position: 'absolute', left: 48, top: 74, width: 144, height: 46 }}>
            <svg width="144" height="46" viewBox="0 0 144 46">
              <path d="M0 46 V24 Q0 0 24 0 H120 Q144 0 144 24 V46 Z" fill={fill} />
              <rect x="30" y="0" width="8" height="46" fill={band} />
              <rect x="106" y="0" width="8" height="46" fill={band} />
              <rect x="0" y="34" width="144" height="7" fill={band} />
              <path d="M14 10 Q20 4 34 4 H96" stroke={sky} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8" />
            </svg>
          </Box>

          {/* Symbols. Resting at y 124+, they sit hidden behind the front of the chest. */}
          {SYMBOLS.map(({ char, x }) => (
            <Box
              key={char}
              component="span"
              data-part="symbol"
              style={{ opacity: start.symbol }}
              sx={{
                position: 'absolute', left: x - 20, top: 124, width: 40, textAlign: 'center',
                fontSize: 22, lineHeight: 1, fontWeight: 700, color: 'softFill.main', whiteSpace: 'nowrap',
              }}
            >
              {char}
            </Box>
          ))}

          {/* Front of the chest: cherry body, cream bands and lock */}
          <Box sx={{ position: 'absolute', left: 50, top: 118, width: 140, height: 84 }}>
            <svg width="140" height="84" viewBox="0 0 140 84">
              <rect x="0" y="0" width="140" height="84" rx="10" fill={fill} />
              <rect x="28" y="0" width="8" height="84" fill={band} />
              <rect x="104" y="0" width="8" height="84" fill={band} />
              <rect x="0" y="0" width="140" height="7" fill={band} />
              <rect x="58" y="12" width="24" height="28" rx="5" fill={band} />
              <circle cx="70" cy="23" r="3.5" fill={inside} />
              <rect x="68.5" y="24" width="3" height="9" rx="1.5" fill={inside} />
              <path d="M8 16 V70" stroke={sky} strokeWidth="3" strokeLinecap="round" opacity="0.6" />
            </svg>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default BrandIntro;
