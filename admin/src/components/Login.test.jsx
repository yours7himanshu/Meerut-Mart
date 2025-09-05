import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login.jsx';

describe('Login component', () => {
  test('submits and navigates on success', async () => {
    const setToken = jest.fn();
    // mock axios post response via module mock in __mocks__
    const axios = (await import('axios')).default;
    axios.post.mockResolvedValueOnce({ data: { success: true, token: 'abc123' } });

    render(
      <BrowserRouter>
        <Login setToken={setToken} />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/your@email\.com/i), {
      target: { value: 'admin@meerutMart.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), {
      target: { value: 'password' }
    });
    const userTypeSelect = screen.getByRole('combobox');
    fireEvent.change(userTypeSelect, { target: { value: 'superadmin' } });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => expect(setToken).toHaveBeenCalledWith('abc123'));
  });
});


