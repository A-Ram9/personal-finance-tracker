import { render, fireEvent, act } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { useReducedMotion } from 'framer-motion';
import BrandIntro from './BrandIntro';
import { buildTheme } from '../theme';

// framer-motion caches the system's reduced-motion setting, so control the hook directly.
jest.mock('framer-motion', () => ({
  ...jest.requireActual('framer-motion'),
  useReducedMotion: jest.fn(() => false),
}));

const renderIntro = (onDone) =>
  render(
    <ThemeProvider theme={buildTheme('light')}>
      <BrandIntro onDone={onDone} />
    </ThemeProvider>
  );

afterEach(() => {
  jest.useRealTimers();
  useReducedMotion.mockReturnValue(false);
});

test('a click skips the intro straight away', () => {
  const onDone = jest.fn();
  renderIntro(onDone);
  fireEvent.pointerDown(window);
  expect(onDone).toHaveBeenCalledTimes(1);
});

test('any key skips the intro, and it only finishes once', () => {
  const onDone = jest.fn();
  renderIntro(onDone);
  fireEvent.keyDown(window, { key: 'Escape' });
  fireEvent.keyDown(window, { key: 'Enter' });
  fireEvent.pointerDown(window);
  expect(onDone).toHaveBeenCalledTimes(1);
});

test('with reduced motion it finishes on its own after a short pause', async () => {
  jest.useFakeTimers();
  useReducedMotion.mockReturnValue(true);
  const onDone = jest.fn();
  renderIntro(onDone);
  expect(onDone).not.toHaveBeenCalled();
  await act(async () => {
    jest.advanceTimersByTime(450);
  });
  expect(onDone).toHaveBeenCalledTimes(1);
});

test('never waits longer than 3.5 seconds', async () => {
  jest.useFakeTimers();
  const onDone = jest.fn();
  renderIntro(onDone);
  await act(async () => {
    jest.advanceTimersByTime(3550);
  });
  expect(onDone).toHaveBeenCalledTimes(1);
});
