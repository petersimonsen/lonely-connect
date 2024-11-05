import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Phoney Connect', () => {
  render(<App />);
  const textElement = screen.getByText("Phoney Connect");
  expect(textElement).toBeInTheDocument();
});
