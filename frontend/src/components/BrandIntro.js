import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { useTheme, darken } from '@mui/material/styles';
import { motion, useAnimate, useReducedMotion } from 'framer-motion';

// The door is drawn in a 200×200 box (centre 100,100) and scaled to its size on screen.
const RIM_RADIUS = 98; // door units
const BOLT_COUNT = 12;
const BOLT_OUT = 80; // distance from the centre, in door units
const BOLT_IN = 74;
const DOOR_OPEN = -105; // degrees of rotateY; negative swings the free edge toward the viewer
const IRIS_SCALE = 4;
const MAX_WAIT_MS = 3500; // never hold anyone here longer than this, even if fonts are slow
const REDUCED_MIN_MS = 400;

const part = (name) => `[data-part="${name}"]`;

// Offset by 15° so no bolt lines up with a spoke.
const BOLTS = Array.from({ length: BOLT_COUNT }, (_, i) => {
  const angle = ((i * 360) / BOLT_COUNT + 15) * (Math.PI / 180);
  const at = (r) => ({ x: 100 + r * Math.cos(angle), y: 100 + r * Math.sin(angle) });
  return { out: at(BOLT_OUT), in: at(BOLT_IN) };
});

// Each bolt slides straight toward the centre: one step per bolt, all starting together ('<').
const boltSteps = BOLTS.map((bolt, i) => [
  `[data-bolt="${i}"]`,
  { cx: [bolt.out.x, bolt.in.x], cy: [bolt.out.y, bolt.in.y] },
  { duration: 0.2, ease: 'easeInOut', at: i === 0 ? 2.1 : '<' },
]);

// The whole story as one timeline. Each step starts when the previous one ends,
// unless `at` says otherwise: a number is seconds from the start, '<' means "with the previous step".
const SEQUENCE = [
  // 0.0–0.3s: the door fades in and settles
  [part('settle'), { opacity: [0, 1], scale: [0.98, 1] }, { duration: 0.3, ease: 'easeOut' }],
  // 0.3–1.9s: the wheel turns ~270°: a heavy slow-in, slow-out to 282°, then settles back to 270°
  [part('wheel'), { rotate: [0, 282, 270] }, { duration: 1.6, times: [0, 0.86, 1], ease: [[0.65, 0, 0.35, 1], 'easeOut'], at: 0.3 }],
  // 1.9–2.1s: a short pause, then 2.1–2.3s: the bolts retract
  ...boltSteps,
  // 2.3s: remove the plug behind the door; the closed door still hides the doorway at this instant
  [part('plug'), { opacity: 0 }, { duration: 0.01, at: 2.3 }],
  // 2.3–3.0s: the door swings open on its left edge, easing out...
  [part('door'), { rotateY: [0, DOOR_OPEN] }, { duration: 0.7, ease: 'easeOut', at: 2.3 }],
  // ...and is gone just before it turns edge-on (with this easing, 90° comes about 68% of the way through)
  [part('door'), { opacity: [1, 1, 0] }, { duration: 0.7, times: [0, 0.35, 0.6], ease: 'linear', at: 2.3 }],
  // 2.45–3.0s: iris out, starting while the door is still swinging so the ring never sits empty around the card.
  // The wall and its doorway grow from the doorway's centre and fade, passing the screen edges.
  [part('wall'), { scale: [1, IRIS_SCALE], opacity: [1, 0] }, { duration: 0.55, ease: 'easeIn', at: 2.45 }],
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

// The login card's size and position plus the window size, kept up to date as either changes.
// Before the first measurement, a centred guess.
function useLayout(targetRef) {
  const [layout, setLayout] = useState(() => {
    const width = Math.min(420, window.innerWidth);
    const height = 520;
    return {
      top: (window.innerHeight - height) / 2, left: (window.innerWidth - width) / 2, width, height,
      vw: window.innerWidth, vh: window.innerHeight,
    };
  });

  useLayoutEffect(() => {
    const el = targetRef?.current;
    if (!el) return undefined;
    const measure = () => {
      const r = el.getBoundingClientRect();
      if (!r.width) return; // not laid out (e.g. in tests): keep the guess
      setLayout({ top: r.top, left: r.left, width: r.width, height: r.height, vw: window.innerWidth, vh: window.innerHeight });
    };
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [targetRef]);

  return layout;
}

function BrandIntro({ onDone, targetRef }) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const [scope, animate] = useAnimate();
  const layout = useLayout(targetRef);
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

    // Reduced motion: the door stays closed and still; wait briefly for fonts, then App fades us out.
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
  const cream = theme.palette.primaryFill.contrastText;
  const sky = theme.palette.skyHighlight.main;
  const innerRing = darken(fill, 0.25);

  // Centred on the login card, about 80vmin across, and always big enough that its rim clears the card's corners.
  const cx = layout.left + layout.width / 2;
  const cy = layout.top + layout.height / 2;
  const cardCorner = Math.hypot(layout.width / 2, layout.height / 2);
  const doorSize = Math.max(0.8 * Math.min(layout.vw, layout.vh), (2 * (cardCorner + 16)) / (RIM_RADIUS / 100));
  const doorwayRadius = (doorSize * RIM_RADIUS) / 200 - 1; // just inside the rim, so the closed door covers it completely
  const frameWidth = doorSize * 0.015;
  const circle = (size) => ({ position: 'absolute', left: cx - size / 2, top: cy - size / 2, width: size, height: size, borderRadius: '50%' });
  const doorwayMask = `radial-gradient(circle at ${cx}px ${cy}px, transparent ${doorwayRadius}px, black ${doorwayRadius + 1}px)`;

  return (
    <Box
      component={motion.div}
      aria-hidden="true"
      initial={false}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0.2 : 0.3, ease: 'easeOut' }}
      sx={{ position: 'fixed', inset: 0, zIndex: (t) => t.zIndex.modal + 1, cursor: 'pointer', overflow: 'hidden' }}
    >
      <Box ref={scope} sx={{ position: 'absolute', inset: 0 }}>
        {/* The wall with its round doorway and frame. It grows from the doorway's centre for the iris out. */}
        <Box data-part="wall" style={{ transformOrigin: `${cx}px ${cy}px` }} sx={{ position: 'absolute', inset: 0 }}>
          <Box sx={{ position: 'absolute', inset: 0, backgroundColor: 'background.default', maskImage: doorwayMask, WebkitMaskImage: doorwayMask }} />
          <Box sx={{ ...circle(2 * doorwayRadius), border: `${frameWidth}px solid`, borderColor: 'border.main', boxSizing: 'content-box', marginLeft: `${-frameWidth}px`, marginTop: `${-frameWidth}px` }} />
        </Box>
        {/* Plug: fills the doorway until the door starts to open, so the login can't show through early. */}
        <Box data-part="plug" sx={{ ...circle(doorSize), backgroundColor: 'background.default' }} />

        {/* Fades in and settles around its centre. Its `perspective` gives the door inside depth:
            the free edge grows as it swings out toward you. */}
        <Box data-part="settle" style={{ opacity: reduceMotion ? 1 : 0 }} sx={{ ...circle(doorSize), borderRadius: 0, perspective: `${doorSize * 2}px` }}>
          <Box
            data-part="door"
            style={{ transformOrigin: 'left center' }}
            sx={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden' }}
          >
            <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0 }}>
              <circle cx="100" cy="100" r={RIM_RADIUS} fill={cream} />
              <circle cx="100" cy="100" r="90" fill={fill} />
              <circle cx="100" cy="100" r="62" fill="none" stroke={innerRing} strokeWidth="2" />
              {BOLTS.map((bolt, i) => (
                <circle key={i} data-bolt={i} cx={bolt.out.x} cy={bolt.out.y} r="4.5" fill={cream} />
              ))}
            </svg>

            {/* Ship's-wheel handle: its own box so it turns around its own centre. */}
            <Box data-part="wheel" sx={{ position: 'absolute', left: '27%', top: '27%', width: '46%', height: '46%' }}>
              <svg width="100%" height="100%" viewBox="0 0 100 100">
                {[0, 60, 120, 180, 240, 300].map((deg) => (
                  <g key={deg} transform={`rotate(${deg} 50 50)`}>
                    <line x1="50" y1="50" x2="94" y2="50" stroke={cream} strokeWidth="5" strokeLinecap="round" />
                    <circle cx="94" cy="50" r="6" fill={cream} />
                  </g>
                ))}
                <circle cx="50" cy="50" r="34" fill="none" stroke={cream} strokeWidth="5" />
                <circle cx="50" cy="50" r="11" fill={cream} />
                <circle cx="50" cy="50" r="4" fill={innerRing} />
              </svg>
            </Box>

            {/* Glint on the wheel's ring. Not inside the wheel, so it stays still while the wheel turns, like light would. */}
            <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <path d="M70.6 89.3 A31.3 31.3 0 0 1 89.3 70.6" stroke={sky} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.85" />
            </svg>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default BrandIntro;
