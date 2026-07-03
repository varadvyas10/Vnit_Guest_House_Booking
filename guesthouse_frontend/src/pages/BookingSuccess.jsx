import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Download, LayoutDashboard, Loader2 } from 'lucide-react';
import API from '../services/api';
import instituteLogo from '../assets/vnit-logo-1.jpg';

const BookingSuccess = () => {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [bookingDetails, setBookingDetails] = useState(null);
    const [loading, setLoading] = useState(true);

   useEffect(() => {
    const verifyAndPromotePayment = async () => {
        try {
            // 1. Force the database state update first to break past async latency
            await API.post('/bookings/confirm-session', { sessionId });
            
            // 2. Fetch fresh reservation state arrays
            const response = await API.get('/bookings/my-reservations');
            const matchingRecord = response.data.find(b => b.financials?.stripeSessionId === sessionId) || response.data[0];
            setBookingDetails(matchingRecord);
        } catch (err) {
            console.error("Error aligning structural transaction details:", err);
        } finally {
            setLoading(false);
        }
    };
    if (sessionId) verifyAndPromotePayment();
}, [sessionId]);

    // 📄 Programmatic Generation matching the layout structure in image_54e1bc.png
    const generateTabularReceipt = () => {
        if (!bookingDetails || !user) return;

        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // 🔲 Step 1: Draw Border Outer Frame Box
        doc.setLineWidth(0.5);
        doc.setDrawColor(40, 40, 40);
        doc.rect(5, 5, 200, 287); // Page Frame

        // 🏛️ Step 2: Core Institution Heading Blocks
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text("VISVESVARAYA NATIONAL INSTITUTE OF TECHNOLOGY", 105, 15, { align: 'center' });
        doc.text("NAGPUR.", 105, 22, { align: 'center' });
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.text("GUEST HOUSE ACCOMMODATION FEE REPORT", 105, 32, { align: 'center' });

        // Horizontal Grid Partition Rule Lines
        doc.setLineWidth(0.4);
        doc.line(5, 38, 205, 38);

        // 📋 Step 3: Student Credentials Column Matrix Mapping (Left Column)
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold'); doc.text("Id No.:", 10, 45);
        doc.setFont('helvetica', 'normal'); doc.text(`${bookingDetails._id.toString().toUpperCase().slice(-6)}`, 45, 45);

        doc.setFont('helvetica', 'bold'); doc.text("Student Name:", 10, 52);
        doc.setFont('helvetica', 'normal'); doc.text(`${user.name}`, 45, 52);

        doc.setFont('helvetica', 'bold'); doc.text("Enrollment No.:", 10, 59);
        doc.setFont('helvetica', 'normal'); doc.text(`${user.institutionId || 'N/A'}`, 45, 59);

        doc.setFont('helvetica', 'bold'); doc.text("Program / Dept:", 10, 66);
        doc.setFont('helvetica', 'normal'); doc.text(`${user.department || 'Computer Science Engineering'}`, 45, 66);

        // 📋 Step 4: Live Payment Fields Data Mapping (Right Column)
        doc.setFont('helvetica', 'bold'); doc.text("Session:", 110, 45);
        doc.setFont('helvetica', 'normal'); doc.text("W26", 155, 45);

        doc.setFont('helvetica', 'bold'); doc.text("Fees Received On:", 110, 52);
        doc.setFont('helvetica', 'normal'); doc.text(new Date(bookingDetails.createdAt).toLocaleDateString('en-IN'), 155, 52);

        doc.setFont('helvetica', 'bold'); doc.text("Transaction Ref No.:", 110, 59);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.text(`${sessionId ? sessionId.slice(0, 24) : 'N/A'}...`, 155, 59);
        doc.setFontSize(10);

        doc.setFont('helvetica', 'bold'); doc.text("Challan No.:", 110, 66);
        doc.setFont('helvetica', 'normal'); doc.text(`CH${bookingDetails._id.toString().toUpperCase().slice(-10)}`, 155, 66);

        doc.setLineWidth(0.3);
        doc.line(5, 72, 205, 72);

        // 🛏️ Step 5: Tabular Reservation Particular Breakdown Matrix
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(240, 242, 245);
        doc.rect(5, 72, 200, 8, 'F'); // Table Header Bar
        doc.text("Particular Description", 10, 77);
        doc.text("Config specs / Stay Timeline", 90, 77);
        doc.text("Amount (INR)", 170, 77);
        
        doc.line(5, 80, 205, 80);

        // Populating the Row Details
        doc.setFont('helvetica', 'normal');
        doc.text(`VNIT Guest House Stay Request\nGuest Profile: ${bookingDetails.guestDetails?.occupation || 'Student'}\nContact: +91 ${bookingDetails.guestDetails?.phone}`, 10, 88);
        
        const checkIn = new Date(bookingDetails.timeFrame?.startDate).toLocaleDateString('en-IN');
        const checkOut = new Date(bookingDetails.timeFrame?.endDate).toLocaleDateString('en-IN');
        doc.text(`Tier: ${bookingDetails.roomDetails?.roomType || 'Single'} Unit\nTimeline: ${checkIn} to ${checkOut}\nFloor Preference: ${bookingDetails.roomDetails?.floorPreference || 'Ground'}`, 90, 88);
        
        doc.setFont('helvetica', 'bold');
        doc.text(`₹ ${bookingDetails.financials?.totalPrice || '0'}.00`, 170, 88);

        // Divider Row Lines
        doc.line(5, 108, 205, 108);
        
        // Total Invoicing Banner Row
        doc.setFillColor(245, 247, 250);
        doc.rect(5, 108, 200, 10, 'F');
        doc.text("NET FEES SUCCESSFUL RECEIVED TOTAL:", 90, 114);
        doc.text(`₹ ${bookingDetails.financials?.totalPrice || '0'}.00`, 170, 114);
        doc.line(5, 118, 205, 118);

        // 🔐 Step 6: Verified Legal Compliance Footnotes
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text("Note: This report is a digital receipt generated natively via the VNIT hospitality transaction loop. No physical administrative signatures are required.", 10, 130);

        // Initiate the programmatic automatic local file down-stream download prompt
        doc.save(`VNIT_Guesthouse_Receipt_${bookingDetails._id.toString().slice(-6)}.pdf`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-10 h-10 text-vnit-blue animate-spin" />
                <span className="text-sm font-medium text-slate-500">Compiling financial receipt report ledger...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 font-sans">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100 flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
                    <CheckCircle className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Payment Verified!</h1>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto">
                        Your transaction cleared safely. Your room hold status is now promoted to an official booking request awaiting estate office room allocation.
                    </p>
                </div>

                {bookingDetails && (
                    <div className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl p-4 text-left text-xs space-y-2 font-medium text-slate-600">
                        <div className="flex justify-between"><span className="text-slate-400">Transaction ID:</span><span className="font-mono text-slate-900 font-bold">{bookingDetails._id}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Amount Paid:</span><span className="text-vnit-blue font-extrabold">₹ {bookingDetails.financials?.totalPrice}</span></div>
                    </div>
                )}

                <div className="w-full flex flex-col gap-3 pt-2">
                    <button 
                        onClick={generateTabularReceipt}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 text-xs transition-all cursor-pointer"
                    >
                        <Download className="w-4 h-4" /> Download Official Fee Receipt
                    </button>
                    
                    <button 
                        onClick={() => navigate('/student-dashboard')}
                        className="w-full bg-vnit-blue hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 text-xs transition-all cursor-pointer"
                    >
                        <LayoutDashboard className="w-4 h-4" /> Go To Student Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingSuccess;