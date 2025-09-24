import React, { useState } from 'react';

interface AuthFormProps {
    type: 'register' | 'login';
    onAuth: (user: any, token: string) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ type, onAuth }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch(`/api/${type === 'register' ? 'register' : 'login'}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(
                    type === 'register'
                        ? { name, email, password }
                        : { email, password }
                ),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Something went wrong');
            onAuth(data.user, data.token);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-8 rounded-lg shadow space-y-6">
            <h2 className="text-2xl font-bold text-center mb-4">
                {type === 'register' ? 'Register' : 'Sign In'}
            </h2>
            {type === 'register' && (
                <div>
                    <label className="block mb-1 font-medium">Name</label>
                    <input
                        type="text"
                        className="w-full border px-3 py-2 rounded"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                    />
                </div>
            )}
            <div>
                <label className="block mb-1 font-medium">Email</label>
                <input
                    type="email"
                    className="w-full border px-3 py-2 rounded"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
            </div>
            <div>
                <label className="block mb-1 font-medium">Password</label>
                <input
                    type="password"
                    className="w-full border px-3 py-2 rounded"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
                disabled={loading}
            >
                {loading ? 'Please wait...' : type === 'register' ? 'Register' : 'Sign In'}
            </button>
        </form>
    );
};
