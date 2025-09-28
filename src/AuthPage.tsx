import React, { useState } from 'react';
import { AuthForm } from './components/AuthForm';

interface AuthPageProps {
    onAuth: (user: any, token: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuth }) => {
    const [mode, setMode] = useState<'register' | 'login'>('login');

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50">
            <AuthForm type={mode} onAuth={onAuth} />
            <div className="mt-4 text-center">
                {mode === 'login' ? (
                    <>
                        Don't have an account?{' '}
                        <button className="text-blue-600 underline" onClick={() => setMode('register')}>
                            Register
                        </button>
                    </>
                ) : (
                    <>
                        Already have an account?{' '}
                        <button className="text-blue-600 underline" onClick={() => setMode('login')}>
                            Sign In
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
