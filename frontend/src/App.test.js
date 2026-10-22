import { render, screen } from '@testing-library/react';
import Auth from './components/Auth';

test('shows the sign-in and register options', () => {
  render(<Auth onAuthSuccess={() => {}} />);
  expect(screen.getByText('Sign In')).toBeInTheDocument();
  expect(screen.getByText('Register')).toBeInTheDocument();
});
