import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ShopContextProvider from './context/ShopContext.jsx';
import App from './App.jsx';

describe('App routing and layout', () => {
  test('renders Navbar and Footer', () => {
    render(
      <BrowserRouter>
        <ShopContextProvider>
          <App />
        </ShopContextProvider>
      </BrowserRouter>
    );

    // Navbar contains HOME link text
    expect(screen.getAllByText(/home/i)[0]).toBeInTheDocument();
    // Footer contains About link text
    expect(screen.getAllByText(/about/i)[0]).toBeInTheDocument();
  });
});


