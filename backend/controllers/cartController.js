// cartController.js
import userModel from "../models/userModel.js";

// Add products to user cart
const addToCart = async (req, res) => {
    try {
        const { itemId, size } = req.body;
        const userId = req.userId || req.body?.userId || req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const userData = await userModel.findById(userId);
        let cartData = (userData && userData.cartData) ? userData.cartData : {};

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1;
            } else {
                cartData[itemId][size] = 1;
            }
        } else {
            cartData[itemId] = {};
            cartData[itemId][size] = 1;
        }

        await userModel.findByIdAndUpdate(userId, { cartData });
        res.json({ success: true, message: "Added to Cart" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Update cart
const updateCart = async (req, res) => {
    try {
        const { itemId, size, quantity } = req.body;
        const userId = req.userId || req.body?.userId || req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const userData = await userModel.findById(userId);
        let cartData = (userData && userData.cartData) ? userData.cartData : {};

        if (cartData[itemId] && cartData[itemId][size]) {
            cartData[itemId][size] = quantity;
        } else {
            return res.status(400).json({ success: false, message: "Item or size does not exist in cart." });
        }

        await userModel.findByIdAndUpdate(userId, { cartData });
        res.json({ success: true, message: "Cart Updated" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Get user cart
const getUserCart = async (req, res) => {
    try {
        const userId = req.userId || req.body?.userId || req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const userData = await userModel.findById(userId);
        const cartData = (userData && userData.cartData) ? userData.cartData : {};
        res.json({ success: true, cartData });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { addToCart, updateCart, getUserCart };
