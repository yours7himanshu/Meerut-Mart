import { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { assets } from "../admin_assets/assets";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const fetchAllOrders = async () => {
    if (!token) {
      setLoading(false);
      return null;
    }
    try {
      const response = await axios.post(
        backendUrl + "/api/order/list",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const statusHandler = async (e, orderId) => {
    const newStatus = e.target.value;
    setUpdatingOrderId(orderId);
    try {
      const response = await axios.post(
        backendUrl + '/api/order/status',
        { orderId, status: newStatus },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Order status updated!");
        await fetchAllOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Orders Management</h3>
      <div>
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-gray-600">
            <svg className="animate-spin h-6 w-6 text-gray-800" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-base">Loading orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <p className="text-gray-500 py-8">No orders found.</p>
        ) : (
          orders.map((order, index) => (
            <div className='grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr] gap-3 items-start border-2 border-gray-300 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-800 rounded-lg' key={index}>
              <img className="w-12" src={assets.parcel_icon} alt="" />
              <div>
                <div>
                  {order.items.map((item, itemIdx) => (
                    <p className="py-0.5" key={itemIdx}>
                      {item.name} x {item.quantity} <span className="font-semibold text-gray-600">({item.size})</span>
                    </p>
                  ))}
                </div>
                <p className="mt-3 mb-2 font-semibold">{order.address.firstName + " " + order.address.lastName}</p>
                <div className="text-gray-600">
                  <p>{order.address.street + ","}</p>
                  <p>
                    {order.address.city +
                      ", " +
                      order.address.state +
                      ", " +
                      order.address.country +
                      ", " +
                      order.address.zipcode}
                  </p>
                </div>
                <p className="mt-1 font-mono text-gray-700">{order.address.phone}</p>
              </div>
              <div>
                <p className="text-sm sm:text-[15px] font-medium">Items: {order.items.length}</p>
                <p className="mt-3">Payment Method: <span className="font-semibold">{order.paymentMethod}</span></p>
                <p>Payment: <span className={order.payment ? "text-green-600 font-semibold" : "text-amber-600 font-semibold"}>{order.payment ? 'Done' : 'Pending'}</span></p>
                <p>Date: {new Date(order.date).toLocaleDateString()}</p>
              </div>
              <div className="flex flex-col gap-2 items-start">
                <p className="text-sm sm:text-[15px] font-bold">{currency} {order.amount}</p>
                <div className="flex items-center gap-2 w-full">
                  <select 
                    disabled={updatingOrderId === order._id} 
                    onChange={(e) => statusHandler(e, order._id)} 
                    value={order.status} 
                    className="p-2 font-semibold border rounded bg-white w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="Order Placed">Order Placed</option>
                    <option value="Packing">Packing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out For Delivery">Out For Delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                  {updatingOrderId === order._id && (
                    <svg className="animate-spin h-5 w-5 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
