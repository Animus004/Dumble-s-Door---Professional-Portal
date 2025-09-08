import React, { useState } from 'react';
import { UserRole } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Input from '../components/Input';

const AuthForm: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.Veterinarian);
    const [isLoading, setIsLoading] = useState(false);
    const { signIn, signUp } = useAuth();
    const { addToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const err = isLogin ? await signIn(email, password) : await signUp(email, password, role);
        if (err) {
            addToast(err, 'error');
        }
        setIsLoading(false);
    };

    return (
         <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-200 mb-6">{isLogin ? 'Sign In' : 'Create Account'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
                    <Input label="" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (use 'password123')" required />
                    {!isLogin && (
                        <Input
                            as="select"
                            label=""
                            name="role"
                            value={role}
                            onChange={e => setRole(e.target.value as UserRole)}
                        >
                            <option value={UserRole.Veterinarian}>I'm a Veterinarian</option>
                            <option value={UserRole.Vendor}>I'm a Vendor/Shop</option>
                        </Input>
                    )}
                    <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed">
                        {isLoading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 hover:underline ml-1 font-semibold">
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthForm;
