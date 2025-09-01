import { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import {jwtDecode} from 'jwt-decode'; // Use default import for jwt-decode

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/user/login`, { email, password });

      if (response.data.success) {
        const userToken = response.data.token;
        setToken(userToken); // Set the token in the context
        localStorage.setItem('token', userToken); // Store token in localStorage
        toast.success('Login successful'); // Display success message

        // Decode the token to get user details
        const decoded = jwtDecode(userToken);
        console.log("Decoded Token:", decoded); // Log decoded token

        // Store user name in local storage
        if (decoded.name) {
          localStorage.setItem('name', decoded.name); // Store name in local storage
          console.log("User name stored in localStorage:", decoded.name); // Log for debugging
        } else {
          console.error("User name not found in the decoded token.");
        }

        const userRole = decoded.role; // Get user role from the token
        console.log("User Role:", userRole);

        // Redirect based on the user's role
        if (userRole === 'user') {
          navigate('/'); // Redirect to home for users
        } else if (userRole === 'seller') {
          navigate('/sell-item'); // Redirect to the seller page
        } else {
          toast.error('Role not recognized.'); // Handle unexpected role
        }
      } else {
        toast.error(response.data.message); // Display error message from the server
      }
    } catch (error) {
      console.error("Login Error:", error); // Log error for debugging
      toast.error('An error occurred. Please try again.'); // User-friendly error message
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      navigate('/'); // Navigate if token is already present
    }
  }, [token, navigate]);

  return (
    <div className='min-h-screen flex items-center justify-center w-full'>
      <div className='bg-gray-100 shadow-black shadow-2xl rounded-lg px-8 py-6 max-w-md'>
        <h1 className='text-2xl font-bold mb-4'>Login</h1>
        <form onSubmit={onSubmitHandler}>
          <div className='mb-3 min-w-72'>
            <p className='text-sm font-semibold text-gray-700 mb-2'>Email Address</p>
            <input 
              onChange={(e) => setEmail(e.target.value)} 
              value={email} 
              className='rounded-md w-full px-3 py-2 border border-gray-400 outline-none' 
              type="email" 
              placeholder='your@email.com' 
              required 
            />
          </div>
          <div className='mb-3 min-w-72'>
            <p className='text-sm font-semibold text-gray-700 mb-2'>Password</p>
            <input 
              onChange={(e) => setPassword(e.target.value)} 
              value={password} 
              className='rounded-md w-full px-3 py-2 border border-gray-400 outline-none' 
              type="password" 
              placeholder='Enter your password' 
              required 
            />
          </div>
          <button 
            className='mt-2 w-full py-2 px-4 rounded-md text-white bg-black hover:bg-gray-950 hover:font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed' 
            type='submit'
            disabled={isLoading}
          >
            {isLoading ? 'Logging...' : 'Login'}
          </button>
          <p className='text-sm mt-4 text-center'>
            Do not have an account? 
            <span className='cursor-pointer text-blue-600' onClick={() => navigate('/signUp')}> Sign Up</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;

