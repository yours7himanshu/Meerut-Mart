import { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ShopContext } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { backendUrl } = useContext(ShopContext);
  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/user/register`, { name, email, password });
      if (response.data.success) {
        toast.success('Account created successfully! You can now log in.');
        navigate('/login');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center w-full'>
      <div className='bg-gray-100 shadow-black shadow-2xl rounded-lg px-8 py-6 max-w-md w-full mx-4'>
        <h1 className='text-2xl font-bold mb-4'>Sign Up</h1>
        <form onSubmit={onSubmitHandler}>
          <div className='mb-3 min-w-72'>
            <p className='text-sm font-semibold text-gray-700 mb-2'>Name</p>
            <input 
              onChange={(e) => setName(e.target.value)} 
              value={name} 
              className='rounded-md w-full px-3 py-2 border border-gray-400 outline-none' 
              type="text" 
              placeholder='Your Name' 
              required 
            />
          </div>
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
                <span>Signing up...</span>
              </>
            ) : (
              'Sign Up'
            )}
          </button>
          <p className='text-sm mt-4 text-center'>
            Already have an account? 
            <span className='cursor-pointer text-blue-600' onClick={() => navigate('/login')}> Log In</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
