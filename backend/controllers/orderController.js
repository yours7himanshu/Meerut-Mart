import orderModel from '../models/orderModel.js'
import userModel from '../models/userModel.js'

// Placing Order using COD method
const placeOrder = async(req,res)=>{
    try {
        const { items, amount, address } = req.body;
        const userId = req.body.userId || req.userId || req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "COD",
            payment: false,
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        await userModel.findByIdAndUpdate(userId, { cartData: {} });
        res.json({ success: true, message: "Order Placed Successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Placing Order using Stripe method
const placeOrderStripe = async(req,res)=>{
    
}

// Placing Order using Razorpay method
const placeOrderRazorpay = async(req,res)=>{
    
}

// All Orders data for ADMIN Panel
const allOrders = async(req,res)=>{
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// user order data for Frontend
const userOrders = async (req, res) => {
    try {
        const userId = req.user?.id || req.userId || req.body?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }
        const orders = await orderModel.find({ userId });
        res.json({ success: true, orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// update Order Status from Admin Panel
const updateStatus = async(req,res)=>{
    try {
        const { orderId, status } = req.body;
        await orderModel.findByIdAndUpdate(orderId, { status });
        res.json({ success: true, message: 'Status Updated' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus };
