import  { useContext, useState } from 'react'
import {assets} from '../assets/frontend_assets/assets'
import { Link, NavLink } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import { ShieldCheck } from 'lucide-react';

const Navbar = () => {
    const [visible,setVisible]=useState(false);
    const {setShowSearch,getCartCount, navigate, token, setToken, setCartItems}=useContext(ShopContext);

    const logout=()=>{
        localStorage.removeItem('token');
        setToken('');
        setCartItems({});
        navigate('/login');
    }
    const handleCartClick = (e) => {
        if (!token) {
          e.preventDefault();  // Prevent navigation if not logged in
          toast.error("Login first");
        } else {
          navigate('/cart');  // Navigate to cart if the user is logged in
        }
      };
    

  return (
    <div className='flex items-center justify-between py-5 font-medium' >

            <Link to='/'><img src={assets.logo} className='w-36' alt="" /></Link>
     
     
        <ul className='hidden sm:flex gap-5 text-xs text-gray-700' >
        <NavLink to='/' className='flex flex-col items-center gap-1' >
            <p>HOME</p>
            <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>
        <NavLink to='/collection' className='flex flex-col items-center gap-1' >
            <p>COLLECTIONS</p>
            <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>
        <NavLink to='/about' className='flex flex-col items-center gap-1' >
            <p>ABOUT</p>
            <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>
        <NavLink to='/contact' className='flex flex-col items-center gap-1' >
            <p>CONTACT</p>
            <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>
        <NavLink to='/seller' className='flex flex-col items-center gap-1' >
            <p>BECOME A SELLER</p>
            <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>
      </ul>
     

      <div className='flex items-center gap-6' >
        
        <img src={assets.search_icon} onClick={()=> setShowSearch(true)} className='w-5 cursor-pointer' alt="" />
        
        <div className='group relative' >
            <img onClick={()=> token ? null : navigate('/login')} src={assets.profile_icon} className='w-5 cursor-pointer' alt="" />
        {token &&
           
       
            
                <div className='group-hover:block hidden absolute dropdown-menu right-0 pt-4' >
                <div className='flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded' >
                    <p className='cursor-pointer hover:text-black' >My Profile</p>
                    <p onClick={()=> navigate('/orders')} className='cursor-pointer hover:text-black' >Orders</p>
                    <p onClick={logout} className='cursor-pointer hover:text-black' >LogOut</p>
                </div>

            </div>
            }
          

        </div>
      
        <Link onClick={handleCartClick} to='/cart' className='relative' >
        <img src={assets.cart_icon} className='w-5 min-w-5' alt="" />
        <p className='absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]' >{getCartCount()}</p>
    </Link>

        {/* Admin Button */}
        <a href="https://meerut-mart-admin.vercel.app/" target="_blank" rel="noopener noreferrer" className='cursor-pointer'>
          <ShieldCheck className="w-6 h-6 text-gray-700 hover:text-black transition-colors" />
        </a>
       
        
        {/* for mobile screen */}
        <img onClick={()=> setVisible(true)} src={assets.menu_icon} className='w-5 cursor-pointer sm:hidden' alt="" />
      </div>

      {/* Sidebar menu for small screen */}
        <div className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${visible? 'w-full':'w-0'}`} >
            <div className='flex flex-col text-gray-700' >
                <div onClick={()=> setVisible(false)} className='flex items-center gap-4 p-3 cursor-pointer' >
                    <img src={assets.dropdown_icon} className='h-4 rotate-180' alt="" />
                    <p>Back</p>
                </div>
                <NavLink onClick={()=> setVisible(false)} className='py-2 pl-6 border' to='/' >HOME</NavLink>
                <NavLink onClick={()=> setVisible(false)} className='py-2 pl-6 border' to='/collection' >COLLECTION</NavLink>
                <NavLink onClick={()=> setVisible(false)} className='py-2 pl-6 border' to='/about' >ABOUT</NavLink>
                <NavLink onClick={()=> setVisible(false)} className='py-2 pl-6 border' to='/contact' >CONTACT</NavLink>
                <NavLink onClick={()=> setVisible(false)} className='py-2 pl-6 border' to='/seller' >BECOME SELLER</NavLink>
                <a href="https://meerut-mart-admin.vercel.app/" target="_blank" rel="noopener noreferrer" onClick={()=> setVisible(false)} className='py-2 pl-6 border flex items-center gap-3'>
                  <ShieldCheck className="w-4 h-4 text-gray-700" />
                  ADMIN
                </a>
            </div>
        </div>

    </div>
  )
}

export default Navbar
