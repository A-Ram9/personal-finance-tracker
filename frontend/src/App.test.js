import { render, screen } from '@testing-library/react';
import Auth from './components/Auth';

test('shows the sign-in and create-account options', () => {
  render(<Auth onAuthSuccess={() => {}} />);
  // "Sign in" is both the tab and the submit button.
  expect(screen.getAllByRole('button', { name: 'Sign in' })).toHaveLength(2);
  expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();
  expect(screen.getByText('FinTrack')).toBeInTheDocument();
});
