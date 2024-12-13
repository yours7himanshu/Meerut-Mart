import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify'; 

const UserList = ({ token }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token'); 
        // console.log("Retrieved Token:", token); 
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user`, {
                headers: {
                    authorization: `Bearer ${token}`,
                },
            });
            if (response.data.success) {
                setUsers(response.data.users);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError(err.response ? err.response.data.message : err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const promoteAdmin = async (userId) => {
        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/user/promote-admin`, { userId }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            toast.success("User promoted successfully!");
            fetchUsers(); 
        } catch (err) {
            console.error(err);
            toast.error(err.response ? err.response.data.message : 'Error promoting user');
        }
    };

    const demoteAdmin = async (userId) => {
        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/user/demote-admin`, { userId }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            toast.error("User demoted successfully!");
            fetchUsers(); // Re-fetch users to update the list
        } catch (err) {
            console.error(err);
            toast.error(err.response ? err.response.data.message : 'Error demoting user');
        }
    };

    if (loading) return <p className="text-center text-gray-500">Loading...</p>;
    if (error) return <p className="text-center text-red-500">Error: {error}</p>;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-bold text-center mb-4">All Sellers List</h1>
            <table className="min-w-full bg-gray-100 border border-gray-300 rounded-lg">
                <thead>
                    <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                        <th className="py-3 px-6 text-left">Name</th>
                        <th className="py-3 px-6 text-left">Email</th>
                        <th className="py-3 px-6 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                    {users.map((user) => (
                        <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-3 px-6">{user.name || 'N/A'}</td>
                            <td className="py-3 px-6">{user.email}</td>
                            <td className="py-3 px-6 flex space-x-2">
                                <button 
                                    onClick={() => promoteAdmin(user._id)} 
                                    className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600 transition duration-200"
                                >
                                    Promote to Admin
                                </button>
                                <button 
                                    onClick={() => demoteAdmin(user._id)} 
                                    className="bg-red-500 text-white rounded px-4 py-2 hover:bg-red-600 transition duration-200"
                                >
                                    Demote to User
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserList;
