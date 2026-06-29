import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, ShieldCheck } from 'lucide-react';

const AdminDashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-md border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                        <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Administrative Dashboard</h1>
                        <p className="text-sm text-emerald-600 font-semibold">Active Estate Admin Session: {user?.name}</p>
                    </div>
                </div>
                <button 
                    onClick={logout}
                    className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm cursor-pointer"
                >
                    <LogOut className="w-4 h-4" /> Sign Out
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;