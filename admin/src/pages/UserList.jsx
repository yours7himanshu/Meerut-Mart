import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify'; 

const UserList = ({ token }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionUserId, setActionUserId] = useState(null);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token'); 
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
        setActionUserId(`${userId}-promote`);
        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/user/promote-admin`, { userId }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            toast.success("User promoted successfully!");
            await fetchUsers(); 
        } catch (err) {
            console.error(err);
            toast.error(err.response ? err.response.data.message : 'Error promoting user');
        } finally {
            setActionUserId(null);
        }
    };

    const demoteAdmin = async (userId) => {
        setActionUserId(`${userId}-demote`);
        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/user/demote-admin`, { userId }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            toast.info("User demoted successfully!");
            await fetchUsers();
        } catch (err) {
            console.error(err);
            toast.error(err.response ? err.response.data.message : 'Error demoting user');
        } finally {
            setActionUserId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] gap-3 text-gray-600">
                <svg className="animate-spin h-6 w-6 text-gray-800" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span className="text-lg">Loading users...</span>
            </div>
        );
    }

    if (error) return <p className="text-center text-red-500 py-10">Error: {error}</p>;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-bold text-center mb-4">All Sellers List</h1>
            <div className="overflow-x-auto">
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
                                <td className="py-3 px-6 font-medium text-gray-800">{user.name || 'N/A'}</td>
                                <td className="py-3 px-6">{user.email}</td>
                                <td className="py-3 px-6 flex flex-wrap gap-2">
                                    <button 
                                        onClick={() => promoteAdmin(user._id)} 
                                        disabled={Boolean(actionUserId)}
                                        className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600 transition duration-200 flex items-center gap-1.5 disabled:bg-blue-300 disabled:cursor-not-allowed"
                                    >
                                        {actionUserId === `${user._id}-promote` ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                </svg>
                                                <span>Promoting...</span>
                                            </>
                                        ) : (
                                            'Promote to Admin'
                                        )}
                                    </button>
                                    <button 
                                        onClick={() => demoteAdmin(user._id)} 
                                        disabled={Boolean(actionUserId)}
                                        className="bg-red-500 text-white rounded px-4 py-2 hover:bg-red-600 transition duration-200 flex items-center gap-1.5 disabled:bg-red-300 disabled:cursor-not-allowed"
                                    >
                                        {actionUserId === `${user._id}-demote` ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                </svg>
                                                <span>Demoting...</span>
                                            </>
                                        ) : (
                                            'Demote to User'
                                        )}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserList;
