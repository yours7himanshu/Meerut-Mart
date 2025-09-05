import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';

describe('Admin App', () => {
  test('renders Admin Portal when no token', () => {
    // ensure no token
    localStorage.removeItem('token');
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByText(/Admin Portal/i)).toBeInTheDocument();
  });
});


