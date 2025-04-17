import { render, screen } from '@testing-library/react';
import App from './App';

test('renders server monitoring dashboard', () => {
  render(<App />);
  const headerElement = screen.getByText(/Server Monitoring Dashboard/i);
  expect(headerElement).toBeInTheDocument();
}); 