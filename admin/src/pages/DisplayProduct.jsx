import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const DisplayProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingId, setProcessingId] = useState(null);
    const backendURL = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${backendURL}/api/displayproduct`);
                setProducts(response.data);
                setLoading(false);
            } catch (error) {
                setError(`Failed to fetch products: ${error.message}`);
                setLoading(false);
            }
        };

        fetchProducts();
    }, [backendURL]);

    const addItemToWebsite = async (productId) => {
        setProcessingId(productId);
        try {
            const response = await axios.post(`${backendURL}/api/add-item-website/${productId}`);
            toast.success(response.data.message);
        } catch (error) {
            console.error("Error adding the item", error);
            toast.error("Error adding item to the website");
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] gap-3 text-gray-600">
                <svg className="animate-spin h-6 w-6 text-gray-800" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span className="text-lg">Loading products...</span>
            </div>
        );
    }

    if (error) return <p className="text-center text-red-500 py-10">{error}</p>;

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-3xl font-bold text-center mb-6">Display Products</h1>
            {products.length === 0 ? (
                <p className="text-center text-gray-500 py-10">No pending products to display.</p>
            ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(product => (
                        <li key={product._id} className="border rounded-lg shadow-md p-4 bg-white flex flex-col justify-between">
                            <div>
                                <h2 className="text-xl font-semibold">{product.name}</h2>
                                <p className="mt-2"><strong className="font-bold">Description:</strong> {product.description}</p>
                                <p className="mt-1"><strong className="font-bold">Price:</strong> ₹{product.price}</p>
                                <p className="mt-1"><strong className="font-bold">Category:</strong> {product.category}</p>
                                {product.subCategory && (
                                    <p className="mt-1"><strong className="font-bold">Sub-Category:</strong> {product.subCategory}</p>
                                )}
                                {product.sizes && product.sizes.length > 0 && (
                                    <p className="mt-1"><strong className="font-bold">Sizes Available:</strong> {product.sizes.join(', ')}</p>
                                )}
                                <p className="mt-1"><strong className="font-bold">Date Added:</strong> {new Date(product.date).toLocaleDateString()}</p>
                                <div className="mt-2">
                                    <strong className="font-bold">Images:</strong>
                                    <div className="flex flex-wrap mt-2">
                                        {product.image.map((photo, index) => (
                                            <img
                                                key={index}
                                                src={photo}
                                                alt={`${product.name} - ${index}`}
                                                className="w-24 h-24 object-cover rounded-lg mr-2 mb-2"
                                                onError={(e) => {
                                                    e.target.src = 'path/to/placeholder-image.jpg';
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => addItemToWebsite(product._id)}
                                disabled={processingId === product._id}
                                className="mt-4 w-full bg-blue-500 text-white font-semibold py-2 rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
                            >
                                {processingId === product._id ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                        <span>Adding to Website...</span>
                                    </>
                                ) : (
                                    'Add Item to the Website'
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default DisplayProducts;
