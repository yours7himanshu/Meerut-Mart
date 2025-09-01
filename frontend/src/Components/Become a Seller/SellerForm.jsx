import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const SellerForm = () => {
    const backendURL = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        contactNumber: '', 
        shopLocation: '',
        addharCard:'',
        panCard:'',
        email: '', 
        password: '', 
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
    
        const token = localStorage.getItem('token');
        console.log('Token before sending request:', token);
        if (!token) {
            toast.error("Authentication token is missing");
            console.log("Token is missing");
            setIsLoading(false);
            return; 
        }
    
        try {
            const response = await axios.post(
                `${backendURL}/api/become-seller`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,  
                    },
                }
            );
            console.log('Seller created:', response.data);
            toast.success("Seller has been created");
            navigate('/sell-item');
        } catch (error) {
            console.error('Error creating seller:', error.response ? error.response.data : error.message);
            toast.error("Failed to create seller. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center w-full">
            <div className="bg-gray-100 shadow-black shadow-2xl rounded-lg px-8 py-6 max-w-md w-full mx-4">
                <h1 className="text-2xl font-bold mb-6 text-center">Become a Seller</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3 min-w-72">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Shop Location</p>
                        <input
                            type="text"
                            id="shopLocation"
                            name="shopLocation"
                            value={formData.shopLocation}
                            onChange={handleChange}
                            required
                            className="rounded-md w-full px-3 py-2 border border-gray-400 outline-none"
                            placeholder="Enter your shop location"
                        />
                    </div>
                    
                    <div className="mb-3 min-w-72">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Aadhar Card Number</p>
                        <input
                            type="text"
                            id="addharCard"
                            name="addharCard"
                            value={formData.addharCard}
                            onChange={handleChange}
                            required
                            className="rounded-md w-full px-3 py-2 border border-gray-400 outline-none"
                            placeholder="Enter 12-digit Aadhar number"
                        />
                    </div>

                    <div className="mb-3 min-w-72">
                        <p className="text-sm font-semibold text-gray-700 mb-2">PAN Card Number</p>
                        <input
                            type="text"
                            id="panCard"
                            name="panCard"
                            value={formData.panCard}
                            onChange={handleChange}
                            required
                            className="rounded-md w-full px-3 py-2 border border-gray-400 outline-none"
                            placeholder="Enter PAN number"
                        />
                    </div>

                    <div className="mb-3 min-w-72">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Contact Number</p>
                        <input
                            type="tel"
                            id="contactNumber"
                            name="contactNumber"
                            value={formData.contactNumber}
                            onChange={handleChange}
                            required
                            className="rounded-md w-full px-3 py-2 border border-gray-400 outline-none"
                            placeholder="Enter your contact number"
                        />
                    </div>

                    <div className="mb-3 min-w-72">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Email Address</p>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="rounded-md w-full px-3 py-2 border border-gray-400 outline-none"
                            placeholder="your@email.com"
                        />
                    </div>

                    <div className="mb-3 min-w-72">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Password</p>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="rounded-md w-full px-3 py-2 border border-gray-400 outline-none"
                            placeholder="Enter your password"
                        />
                    </div>

                    <button 
                        type="submit"
                        className="mt-2 w-full py-2 px-4 rounded-md text-white bg-black hover:bg-gray-950 hover:font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Submitting...' : 'Submit Application'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SellerForm;
