import { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../Components/Title';
import axios from 'axios';

const Orders = () => {
  const { currency, backendUrl, token } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trackingIdx, setTrackingIdx] = useState(null);

  const loadOrderData = async (trackIndex = null) => {
    try {
      if (!token) {
        return null;
      }

      if (trackIndex !== null) {
        setTrackingIdx(trackIndex);
      } else {
        setLoading(true);
      }
      
      const response = await axios.post(
        backendUrl + '/api/order/userorders',
        {},
        {
          headers: {
            authorization: `Bearer ${token}`
          }
        }
      );

      console.log(response.data);

      if (response.data.success) {
        let allOrdersItem = [];
        response.data.orders.map((order) => {
          order.items.map((item) => {
            item['status'] = order.status;
            item['payment'] = order.payment;
            item['paymentMethod'] = order.paymentMethod;
            item['date'] = order.date;
            allOrdersItem.push(item);
          });
        });
        console.log(allOrdersItem);
        setOrderData(allOrdersItem.reverse());
      } else {
        console.log('No orders found');
      }

    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
      setTrackingIdx(null);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  return (
    <div className='border-t pt-16'>
      <div className='text-2xl'>
        <Title text1={'MY'} text2={'ORDERS'} />
      </div>
      <div>
        {loading ? (
          <div className='flex items-center justify-center py-16 gap-3 text-gray-500'>
            <svg className="animate-spin h-6 w-6 text-gray-700" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className='text-sm sm:text-base'>Loading your orders...</span>
          </div>
        ) : orderData.length > 0 ? (
          orderData.map((item, index) => (
            <div key={index} className='py-4 border-t-[0.2px] border-b-[0.2px] border-gray-300 text-gray-900 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
              <div className='flex items-start gap-6 text-sm'>
                <img src={item.image[0]} className='w-16 sm:w-20' alt="" />
                <div>
                  <p className='sm:text-base font-medium'>{item.name.slice(0, 50)}</p>
                  <div className='flex items-center gap-3 mt-1 text-base text-gray-700'>
                    <p>{currency}{item.price}</p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Size: {item.size}</p>
                  </div>
                  <p className='mt-1'>Date: <span className='text-gray-600'>{new Date(item.date).toDateString()}</span></p>
                  <p className='mt-2'>Payment: <span className='text-gray-600'>{item.paymentMethod}</span></p>
                </div>
              </div>
              <div className='md:w-1/2 flex justify-between'>
                <div className='flex items-center gap-2'>
                  <p className='min-w-2 h-2 rounded-full bg-green-600'></p>
                  <p className='text-sm md:text-base'>{item.status}</p>
                </div>
                <button 
                  disabled={trackingIdx === index}
                  className='border px-4 py-2 text-sm font-medium rounded-sm flex items-center gap-1.5 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition' 
                  onClick={() => loadOrderData(index)}
                >
                  {trackingIdx === index ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-gray-700" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Tracking...</span>
                    </>
                  ) : (
                    'Track Order'
                  )}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className='text-gray-600 mt-4'>No orders found.</p>
        )}
      </div>
    </div>
  );
};

export default Orders;
