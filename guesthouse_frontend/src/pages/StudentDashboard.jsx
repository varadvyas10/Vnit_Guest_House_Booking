import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/bookingService';
import { LogOut, User, Calendar, PlusCircle, BookmarkCheck, LayoutDashboard, RefreshCw, Layers } from 'lucide-react';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    
    const [myBookings, setMyBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

    // State parameters mapped perfectly to your Mongoose schema groups
    const [roomType, setRoomType] = useState('Single');
    const [acRequired, setAcRequired] = useState(false);
    const [floorPreference, setFloorPreference] = useState('Ground');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [occupation, setOccupation] = useState('Student');

    useEffect(() => {
        loadReservationsLog();
    }, []);

    const loadReservationsLog = async () => {
        try {
            setLoading(true);
            const studentReservations = await bookingService.getStudentBookings();
            setMyBookings(studentReservations || []);
        } catch (err) {
            setActionMessage({ type: 'error', text: 'Synchronization with core reservation ledger failed.' });
        } finally {
            setLoading(false);
        }
    };

    const handleBookingSubmission = async (e) => {
        e.preventDefault();
        setActionMessage({ type: '', text: '' });

        if (!startDate || !endDate) {
            setActionMessage({ type: 'error', text: 'Please specify your target check-in and check-out dates.' });
            return;
        }

        // Complete structural alignment with your schema requirements
        const alignedPayload = {
        guestName: user?.name || "Student Self Booking",
        guestPhone: user?.phone || "9422112233",
        guestOccupation: "Student",
        roomType: roomType,          // 'Single' or 'Double'
        acRequired: acRequired,
        floorPreference: floorPreference,
        startDate: startDate,        // 'YYYY-MM-DD'
        endDate: endDate             // 'YYYY-MM-DD'
    };

        try {
            setLoading(true);
            const lockResult = await bookingService.createBookingLock(alignedPayload);
            
            setActionMessage({ 
                type: 'success', 
                text: 'Stay request logged successfully! Stripe payment channel initialization complete.' 
            });
            
            loadReservationsLog();
        } catch (err) {
            setActionMessage({ 
                type: 'error', 
                text: err.response?.data?.message || 'The server rejected this combination hold lock parameters.' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            
            {/* Nav Row */}
            <nav className="bg-vnit-blue text-white shadow-md">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-vnit-accent rounded-xl flex items-center justify-center shadow-md">
                            <LayoutDashboard className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="font-bold text-base md:text-lg block tracking-tight">VNIT Hospitality Console</span>
                            <span className="text-xs text-slate-300 block">Student Reservation Desk Portal</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs">
                            <User className="w-4 h-4 text-blue-400" />
                            <span className="font-semibold">{user?.name} ({user?.institutionId})</span>
                        </div>
                        <button onClick={logout} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer">
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Content Hub Layout Grid */}
            <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8 w-full flex-grow">
                
                {/* Form column */}
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 h-fit space-y-5">
                    <h2 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
                        <PlusCircle className="w-5 h-5 text-vnit-accent" /> New Reservation Desk
                    </h2>

                    {actionMessage.text && (
                        <div className={`p-4 text-xs font-medium rounded-xl border ${
                            actionMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        }`}>
                            {actionMessage.text}
                        </div>
                    )}

                    <form onSubmit={handleBookingSubmission} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 block">Accommodation Scale</label>
                            <select value={roomType} onChange={(e) => setRoomType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-vnit-accent text-xs">
                                <option value="Single">Single Executive Unit</option>
                                <option value="Double">Double Deluxe Suite</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 block">Floor Preference</label>
                            <select value={floorPreference} onChange={(e) => setFloorPreference(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-vnit-accent text-xs">
                                <option value="Ground">Ground Floor</option>
                                <option value="First">First Floor</option>
                                <option value="Second">Second Floor</option>
                                <option value="Third">Third Floor</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <input type="checkbox" id="acRequired" checked={acRequired} onChange={(e) => setAcRequired(e.target.checked)} className="w-4 h-4 rounded text-vnit-accent accent-vnit-accent focus:ring-0" />
                            <label htmlFor="acRequired" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">Climate Control (AC Air System Required)</label>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 block">Guest Profile Designation</label>
                            <input type="text" value={occupation} onChange={(e) => setOccupation(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-900 text-xs focus:ring-2 focus:ring-vnit-accent focus:outline-none" placeholder="Student / Scholar" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 block">Check-In Stay Target</label>
                            <div className="relative">
                                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 text-xs focus:ring-2 focus:ring-vnit-accent focus:outline-none" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 block">Check-Out Departure Target</label>
                            <div className="relative">
                                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 text-xs focus:ring-2 focus:ring-vnit-accent focus:outline-none" />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full bg-vnit-blue hover:bg-slate-800 disabled:bg-slate-300 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center text-xs font-sans font-bold cursor-pointer">
                            Lock Room & Initialize Request
                        </button>
                    </form>
                </div>

                {/* Status Column */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex flex-col space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h2 className="font-extrabold text-slate-900 text-base tracking-tight flex items-center gap-2">
                            <BookmarkCheck className="w-5 h-5 text-emerald-600" /> Your Active Booking Ledgers
                        </h2>
                        <button onClick={loadReservationsLog} className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 transition-all cursor-pointer">
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {myBookings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-100 rounded-2xl text-center space-y-2">
                            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400"><Calendar className="w-6 h-6" /></div>
                            <h3 className="font-bold text-sm text-slate-700">No Reservations Lodged</h3>
                            <p className="text-slate-400 text-xs max-w-xs px-4">Your administrative accommodation dashboard historical log sheet is currently empty.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto pr-1">
                            {myBookings.map((bk) => (
                                <div key={bk._id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between space-y-3 group hover:border-slate-300 transition-all">
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-900 block">{bk.roomDetails?.roomType || 'Standard'} Unit</span>
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                                bk.status === 'allocated' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                                bk.status === 'pending_payment' ? 'bg-amber-50 border-amber-200 text-amber-700' : 
                                                bk.status === 'awaiting_approval' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                                'bg-slate-100 border-slate-200 text-slate-600'
                                            }`}>
                                                {bk.status ? bk.status.replace('_', ' ').toUpperCase() : 'PENDING'}
                                            </span>
                                        </div>
                                        <div className="text-[11px] text-slate-500 font-medium space-y-1 mt-2">
                                            <p>📅 Stay: {new Date(bk.timeFrame?.startDate).toLocaleDateString()} - {new Date(bk.timeFrame?.endDate).toLocaleDateString()}</p>
                                            <p>🏢 Floor Prefered: {bk.roomDetails?.floorPreference || 'Ground'} Floor</p>
                                            <p>❄️ AC Status: {bk.roomDetails?.acRequired ? 'Enabled' : 'Disabled'}</p>
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold text-vnit-blue border-t border-slate-100 pt-2 flex items-center justify-between">
                                        <span>Total Charge:</span>
                                        <span>₹ {bk.financials?.totalPrice || '0'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;