import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Key, Mail, AlertCircle } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleFormSubmission = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        if (!email || !password) {
            setError('Please populate all credential input fields.');
            setSubmitting(false);
            return;
        }

        const evaluationResult = await login(email, password);
        
        if (evaluationResult.success) {
            if (evaluationResult.role === 'admin' || evaluationResult.role === 'superadmin') {
                navigate('/admin-dashboard');
            } else {
                navigate('/student-dashboard');
            }
        } else {
            setError(evaluationResult.message);
        }
        setSubmitting(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                
                {/* Visual Branding Card Header Banner */}
                <div className="bg-vnit-blue p-8 text-center text-white">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                        <LogIn className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">VNIT Guest House</h2>
                    <p className="text-slate-300 text-sm mt-1 font-sans">Portal Version 2.0</p>
                </div>

                {/* Form Elements Container Block */}
                <form onSubmit={handleFormSubmission} className="p-8 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm animate-pulse">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 block">Campus Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input 
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-vnit-accent focus:bg-white transition-all text-sm"
                                placeholder="name@vnit.ac.in"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 block">Account Password</label>
                        <div className="relative">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input 
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-vnit-accent focus:bg-white transition-all text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-vnit-blue hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-vnit-blue/10 flex items-center justify-center gap-2 cursor-pointer text-sm"
                    >
                        {submitting ? 'Verifying Access...' : 'Authenticate Account'}
                    </button>
                    
                    <div className="text-center pt-4 border-t border-slate-100">
                        <span className="text-xs text-slate-500">Need an institutional account? </span>
                        <Link to="/register" className="text-xs font-bold text-vnit-accent hover:underline cursor-pointer">
                            Create Account Here
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;