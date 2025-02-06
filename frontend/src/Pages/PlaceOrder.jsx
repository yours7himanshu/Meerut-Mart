import { useContext, useState } from 'react';
import Title from '../Components/Title';
import CartTotal from '../Components/CartTotal';
import { assets } from '../assets/frontend_assets/assets';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const PlaceOrder = () => {
  const [method, setMethod] = useState("cod");
  const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products } = useContext(ShopContext);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: ''
  });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      let orderItems = [];
      for (const itemId in cartItems) {
        for (const size in cartItems[itemId]) {
          if (cartItems[itemId][size] > 0) {
            const itemInfo = structuredClone(products.find(product => product._id === itemId));
            if (itemInfo) {
              itemInfo.size = size;
              itemInfo.quantity = cartItems[itemId][size];
              orderItems.push(itemInfo);
            }
          }
        }
      }

      const orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee,
        
      };

 
      const response = await axios.post(`${backendUrl}/api/order/place`, orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
       
        setCartItems({});

     
        const orderDetails = {
          ...orderData,
          orderId: response.data.orderId || 'N/A',
        };

        
        try {
          await axios.post(
            `${backendUrl}/send-email`,
            {
              emails: formData.email,
              message: `Dear Customer,
              
Thank you for your purchase at MeerutMart.com. Your order (ID: ${orderDetails.orderId}) has been successfully placed. We appreciate your business and look forward to serving you again!

Warm regards,
The MeerutMart Team`,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          toast.success('Order placed successfully! A confirmation email has been sent.');
        } catch (emailError) {
          console.error('Error sending email:', emailError);
          toast.error('Order placed successfully, but failed to send confirmation email.');
        }

        navigate('/reciept', { state: { order: orderDetails } });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response) {
        console.error('Error Response:', error.response.data);
        toast.error(`Error: ${error.response.data.message || 'Unknown error occurred'}`);
      } else if (error.request) {
        console.error('Error Request:', error.request);
        toast.error('No response from server. Please check your connection.');
      } else {
        console.error('Error:', error.message);
        toast.error('An error occurred while placing the order.');
      }
    }
  };


  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
      {/* Left Side */}
      <div className='flex flex-col gap-4 w-[500px] sm:max-w-[480px]'>
        <div className='text-xl sm:text-2xl my-3'>
          <Title text1={'DELIVERY'} text2={'INFORMATION'} />
        </div>
        <div className='flex gap-3'>
          <input required onChange={onChangeHandler} name='firstName' value={formData.firstName} type="text" placeholder='First Name' className='border border-gray-500 rounded py-1.5 px-3.5 w-full' />
          <input required onChange={onChangeHandler} name='lastName' value={formData.lastName} type="text" placeholder='Last Name' className='border border-gray-500 rounded py-1.5 px-3.5 w-full' />
        </div>
        <input required onChange={onChangeHandler} name='email' value={formData.email} type="email" placeholder='Email Address' className='border border-gray-500 rounded py-1.5 px-3.5 w-full' />
        <input required onChange={onChangeHandler} name='street' value={formData.street} type="text" placeholder='Street' className='border border-gray-500 rounded py-1.5 px-3.5 w-full' />
        <div className='flex gap-3'>
          <input required onChange={onChangeHandler} name='city' value={formData.city} type="text" placeholder='City' className='border border-gray-500 rounded py-1.5 px-3.5 w-full' />
          <input required onChange={onChangeHandler} name='state' value={formData.state} type="text" placeholder='State' className='border border-gray-500 rounded py-1.5 px-3.5 w-full' />
        </div>
        <div className='flex gap-3'>
          <input required onChange={onChangeHandler} name='zipcode' value={formData.zipcode} type="number" placeholder='Zip Code' className='border border-gray-500 rounded py-1.5 px-3.5 w-full' />
          <input required onChange={onChangeHandler} name='country' value={formData.country} type="text" placeholder='Country' className='border border-gray-500 rounded py-1.5 px-3.5 w-full' />
        </div>
        <input required onChange={onChangeHandler} name='phone' value={formData.phone} type="tel" placeholder='Phone' className='border border-gray-500 rounded py-1.5 px-3.5 w-full' />
      </div>

      {/* Right Side */}
      <div className='mt-8'>
        <div className='mt-8 min-w-80'>
          <CartTotal />
        </div>
        <div className='mt-12'>
          <Title text1={'PAYMENT'} text2={'METHODS'} />
          {/* Payment Methods Selection/Options */}
          <div className='flex gap-3 flex-col lg:flex-row'>
            <div onClick={() => setMethod("stripe")} className='flex items-center gap-3 border p-2 px-3 cursor-pointer h-6'>
              <p className={`min-w-3.5 border h-3.5 rounded-full ${method === 'stripe' ? 'bg-black' : ''}`}></p>
              <img src={assets.stripe_logo} className='h-5 mx-4' alt="Stripe Logo" />
            </div>
            <div onClick={() => setMethod("razorpay")} className='flex items-center gap-3 border p-2 px-3 cursor-pointer h-6'>
              <p className={`min-w-3.5 border h-3.5 rounded-full ${method === 'razorpay' ? 'bg-black' : ''}`}></p>
              <img src={assets.razorpay_logo} className='h-5 mx-4' alt="Razorpay Logo" />
            </div>
            <div onClick={() => setMethod("cod")} className='flex items-center gap-3 border p-2 px-3 cursor-pointer h-6'>
              <p className={`min-w-3.5 border h-3.5 rounded-full ${method === 'cod' ? 'bg-black' : ''}`}></p>
              <p className='text-gray-600 text-xs font-medium mx-4'>CASH ON DELIVERY</p>
            </div>
          </div>

          <div className='w-full text-end mt-8'>
            <button type='submit' className='bg-black text-white px-16 py-3 text-sm rounded-md mr-40'>Place Order</button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;

