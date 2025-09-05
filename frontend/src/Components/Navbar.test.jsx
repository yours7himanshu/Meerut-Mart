import { render, screen } from '@testing-library/react';
import { jest } from '@jest/globals';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import { ShopContext } from '../context/ShopContext.jsx';

describe('Navbar', () => {
  test('renders navigation links', () => {
    const mockContext = {
      setShowSearch: jest.fn(),
      getCartCount: jest.fn(() => 0),
      navigate: jest.fn(),
      token: '',
      setToken: jest.fn(),
      setCartItems: jest.fn()
    };

    render(
      <BrowserRouter>
        <ShopContext.Provider value={mockContext}>
          <Navbar />
        </ShopContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getAllByText(/home/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/collection/i)[0]).toBeInTheDocument();
  });
});


