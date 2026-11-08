import { useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const Login = ({ setToken }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('admin');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = userType === 'admin' ? '/api/user/admin' : '/api/user/superadmin';
      const response = await axios.post(backendUrl + endpoint, { email, password });
      console.log(response);

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setToken(response.data.token);
        navigate('/add');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error.message);
      toast.error("An error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center w-full'>
      <div className='flex flex-col gap-6 max-w-md w-full px-4'>
        {/* Testing Information */}
        <div className='bg-gray-100 border border-gray-300 rounded-lg px-4 py-3'>
          <p className='text-gray-700 text-sm text-center'>
            <span className='font-medium'>For testing purpose only:</span> Use email <span className='font-mono text-gray-800'>admin@meerutMart.com</span>, password <span className='font-mono text-gray-800'>admin12345</span> and choose usertype to <span className='font-semibold text-gray-800'>Super Admin</span>
          </p>
        </div>

        {/* Login Form */}
        <div className='bg-gray-100 shadow-black shadow-2xl rounded-lg px-8 py-6'>
          <h1 className='text-2xl font-bold mb-4'>Admin Portal</h1>
          <form onSubmit={onSubmitHandler}>
            <div className='mb-3 min-w-72'>
              <p className='text-sm font-semibold text-gray-700 mb-2'>Admin email</p>
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
            <div className='mb-3'>
              <label className='text-sm font-semibold text-gray-700 mb-2'>User Type</label>
              <select 
                value={userType} 
                onChange={(e) => setUserType(e.target.value)} 
                className='rounded-md w-full px-3 py-2 border border-gray-400 outline-none'
              >
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
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
                  <span>Signing In...</span>
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

Login.propTypes = {
  setToken: PropTypes.func.isRequired,
};

export default Login;
