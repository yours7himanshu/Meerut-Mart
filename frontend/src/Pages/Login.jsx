import { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

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
        setToken(userToken);
        localStorage.setItem('token', userToken);
        toast.success('Login successful');

        const decoded = jwtDecode(userToken);
        console.log("Decoded Token:", decoded);

        if (decoded.name) {
          localStorage.setItem('name', decoded.name);
          console.log("User name stored in localStorage:", decoded.name);
        } else {
          console.error("User name not found in the decoded token.");
        }

        const userRole = decoded.role;
        console.log("User Role:", userRole);

        if (userRole === 'user') {
          navigate('/');
        } else if (userRole === 'seller') {
          navigate('/sell-item');
        } else {
          toast.error('Role not recognized.');
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token, navigate]);

  return (
    <div className='min-h-screen flex items-center justify-center w-full'>
      <div className='bg-gray-100 shadow-black shadow-2xl rounded-lg px-8 py-6 max-w-md w-full mx-4'>
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
            className='mt-2 w-full py-2.5 px-4 rounded-md text-white bg-black hover:bg-gray-950 hover:font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition' 
            type='submit'
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Logging in...</span>
              </>
            ) : (
              'Login'
            )}
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
