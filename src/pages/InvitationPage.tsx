import React, { useState } from 'react';
import { useInvitationContext } from '../context/InvitationContext';

const InvitationPage: React.FC = () => {
    const { inviteUser } = useInvitationContext();
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'user' | 'superadmin'>('user');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            alert('Email is required');
            return;
        }
        try {
            await inviteUser(email, role);
            setEmail(''); // Reset form
            setRole('user');
        } catch (error) {
            console.error('Error sending invitation:', error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="max-w-md mx-auto bg-white p-6 rounded shadow-md">
                <h1 className="text-xl font-bold mb-4 text-left">Send Invitation</h1>
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-lg">
                    <div className="mb-4">
                        <label className="block mb-2 text-left">Email:</label>
                        <input
                            type="email"
                            className="w-full border px-2 py-1 rounded"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2 text-left">Role:</label>
                        <select
                            className="w-full border px-2 py-1 rounded"
                            value={role}
                            onChange={(e) => setRole(e.target.value as 'user' | 'superadmin')}
                            required
                        >
                            <option value="user">User</option>
                            <option value="superadmin">Superadmin</option>
                        </select>
                    </div>

                    <div className="flex justify-center">
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                            Send Invitation
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InvitationPage;
