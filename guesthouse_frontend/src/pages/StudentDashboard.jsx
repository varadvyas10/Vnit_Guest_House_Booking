import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { bookingService } from "../services/bookingService";
import {
  LogOut,
  User,
  Calendar,
  PlusCircle,
  BookmarkCheck,
  LayoutDashboard,
  RefreshCw,
  CreditCard,
} from "lucide-react";

const StudentDashboard = () => {
  const { user, logout } = useAuth();

  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState({ type: "", text: "" });

  // Stay Parameter Configurations
  const [roomType, setRoomType] = useState("Single");
  const [acRequired, setAcRequired] = useState(false);
  const [floorPreference, setFloorPreference] = useState("Ground");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [occupation, setOccupation] = useState("Student");
  const [activeTab, setActiveTab] = useState("upcoming"); // 'upcoming' or 'past'
  
  // Dynamic User Review Modals Hook State
  const [reviewBookingId, setReviewBookingId] = useState(null);
  const [starRating, setStarRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // Dynamic Pricing Engine State
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [nights, setNights] = useState(0);

  // Hardcoded static references matching your backend model pricing setup
  const PRICING_MATRIX = {
    Single: 1200,
    Double: 1800,
  };

  useEffect(() => {
    loadReservationsLog();
  }, []);

  // 💰 Live Client-Side Pricing Calculation Listener
  useEffect(() => {
    if (startDate && endDate) {
      const checkIn = new Date(startDate);
      const checkOut = new Date(endDate);

      if (checkOut > checkIn) {
        const timeDiff = checkOut.getTime() - checkIn.getTime();
        const calculatedNights = Math.ceil(timeDiff / (1000 * 3600 * 24));
        const ratePerNight = PRICING_MATRIX[roomType];

        setNights(calculatedNights);
        setEstimatedPrice(ratePerNight * calculatedNights);
      } else {
        setNights(0);
        setEstimatedPrice(0);
      }
    } else {
      setNights(0);
      setEstimatedPrice(0);
    }
  }, [startDate, endDate, roomType]);

  const loadReservationsLog = async () => {
    try {
      setLoading(true);
      const studentReservations = await bookingService.getStudentBookings();
      setMyBookings(studentReservations || []);
    } catch (err) {
      setActionMessage({
        type: "error",
        text: "Synchronization with core reservation ledger failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmission = async (e) => {
    e.preventDefault();
    setActionMessage({ type: "", text: "" });

    if (!startDate || !endDate || nights <= 0) {
      setActionMessage({
        type: "error",
        text: "Please specify a valid check-in and check-out timeframe.",
      });
      return;
    }

    const alignedPayload = {
      guestName: user?.name || "Student Self Booking",
      guestPhone: user?.phone || "9422112233",
      guestOccupation: occupation,
      roomType,
      acRequired,
      floorPreference,
      startDate,
      endDate,
    };

    try {
      setLoading(true);
      const result = await bookingService.createBookingLock(alignedPayload);

      // 🚀 THE STRIPE JUMP: If the backend successfully provides a checkout link, redirect immediately
      if (result.stripeCheckoutUrl) {
        setActionMessage({
          type: "success",
          text: "Redirecting to secure Stripe payment gateway...",
        });
        window.location.href = result.stripeCheckoutUrl;
      } else {
        setActionMessage({
          type: "success",
          text: "Stay reservation created successfully!",
        });
        loadReservationsLog();
      }
    } catch (err) {
      setActionMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          "The server rejected this combination hold lock parameters.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await bookingService.submitReview(reviewBookingId, {
        rating: Number(starRating),
        comment: reviewComment,
      });
      setActionMessage({
        type: "success",
        text: "Review posted successfully!",
      });
      setReviewBookingId(null);
      setReviewComment("");
      loadReservationsLog();
    } catch (err) {
      setActionMessage({
        type: "error",
        text: "Failed to save stay feedback.",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🗓️ Client-Side Ledger Sorting Engine
  const currentDate = new Date();

  const filteredBookings = myBookings.filter((bk) => {
    const checkOutDate = new Date(bk.timeFrame?.endDate);
    if (activeTab === "upcoming") {
      return checkOutDate >= currentDate; // Current, ongoing, or future check-outs
    } else {
      return checkOutDate < currentDate; // Historic checkout records
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* Header Navigation Bar */}
      <nav className="bg-vnit-blue text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-vnit-accent rounded-xl flex items-center justify-center shadow-md">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base md:text-lg block tracking-tight">
                VNIT Hospitality Console
              </span>
              <span className="text-xs text-slate-300 block">
                Student Reservation Desk Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs">
              <User className="w-4 h-4 text-blue-400" />
              <span className="font-semibold">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
            >
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
            <div
              className={`p-4 text-xs font-medium rounded-xl border ${
                actionMessage.type === "error"
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700"
              }`}
            >
              {actionMessage.text}
            </div>
          )}

          <form onSubmit={handleBookingSubmission} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Accommodation Scale
              </label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-900 text-xs focus:ring-2 focus:ring-vnit-accent focus:outline-none"
              >
                <option value="Single">Single Executive Unit (₹1200/N)</option>
                <option value="Double">Double Deluxe Suite (₹1800/N)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Floor Preference
              </label>
              <select
                value={floorPreference}
                onChange={(e) => setFloorPreference(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-900 text-xs focus:ring-2 focus:ring-vnit-accent focus:outline-none"
              >
                <option value="Ground">Ground Floor</option>
                <option value="First">First Floor</option>
                <option value="Second">Second Floor</option>
                <option value="Third">Third Floor</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                id="acRequired"
                checked={acRequired}
                onChange={(e) => setAcRequired(e.target.checked)}
                className="w-4 h-4 rounded accent-vnit-accent focus:ring-0"
              />
              <label
                htmlFor="acRequired"
                className="text-xs font-semibold text-slate-700 cursor-pointer select-none"
              >
                Climate Control (AC Air System)
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Guest Profile Designation
              </label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-900 text-xs focus:ring-2 focus:ring-vnit-accent focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Check-In Stay Target
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 text-xs focus:ring-2 focus:ring-vnit-accent focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Check-Out Departure Target
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 text-xs focus:ring-2 focus:ring-vnit-accent focus:outline-none"
                />
              </div>
            </div>

            {/* 📊 LIVE ESTIMATION COMPONENT PANEL */}
            {estimatedPrice > 0 && (
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <span>Calculated Duration:</span>
                  <span className="font-bold text-slate-900">{nights} Nights</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600 font-medium pt-1 border-t border-blue-100">
                  <span className="font-bold text-slate-800">Estimated Invoice:</span>
                  <span className="font-extrabold text-vnit-blue text-sm">₹ {estimatedPrice}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-vnit-blue hover:bg-slate-800 disabled:bg-slate-300 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center text-xs font-sans font-bold cursor-pointer"
            >
              {loading ? "Processing Hold..." : "Lock Room & Redirect to Payment"}
            </button>
          </form>
        </div>

        {/* Status Column */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
            <div className="flex items-center gap-2">
              <BookmarkCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="font-extrabold text-slate-900 text-base tracking-tight">Your Booking Ledgers</h2>
            </div>

            {/* 🎛 nighttime filter layout switcher switches */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/40">
              <button
                type="button"
                onClick={() => setActiveTab("upcoming")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "upcoming" ? "bg-white text-vnit-blue shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Active & Upcoming
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("past")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "past" ? "bg-white text-vnit-blue shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Past History
              </button>
            </div>

            <button
              onClick={loadReservationsLog}
              className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 transition-all cursor-pointer self-end sm:self-auto"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-100 rounded-2xl text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-700">No Records Found</h3>
              <p className="text-slate-400 text-xs max-w-xs px-4">
                There are no reservations listed under the "{activeTab === "upcoming" ? "Active & Upcoming" : "Past History"}" segment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto pr-1">
              {filteredBookings.map((bk) => (
                <div
                  key={bk._id}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between space-y-3 group hover:border-slate-300 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 block">
                        {bk.roomDetails?.roomType || "Standard"} Unit
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          bk.status === "allocated"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : bk.status === "pending_payment"
                              ? "bg-amber-50 border-amber-200 text-amber-700"
                              : bk.status === "awaiting_approval"
                                ? "bg-blue-50 border-blue-200 text-blue-700"
                                : "bg-red-50 border-red-200 text-red-700"
                        }`}
                      >
                        {bk.status ? bk.status.replace("_", " ").toUpperCase() : "PENDING"}
                      </span>
                    </div>
                    
                    <div className="text-[11px] text-slate-500 font-medium space-y-1 mt-2">
                      <p>📅 Stay: {new Date(bk.timeFrame?.startDate).toLocaleDateString()} - {new Date(bk.timeFrame?.endDate).toLocaleDateString()}</p>
                      <p>🏢 Floor Preferred: {bk.roomDetails?.floorPreference || "Ground"} Floor</p>
                      <p>❄️ AC Status: {bk.roomDetails?.acRequired ? "Enabled" : "Disabled"}</p>
                      
                      {/* 🚨 VISIBILITY BANNER: Show admin input reason if rejected */}
                      {bk.status === "rejected" && bk.rejectionReason && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-lg text-red-700 text-[10px]">
                          <strong>Rejection Reason:</strong> {bk.rejectionReason}
                        </div>
                      )}

                      {/* Render submitted star history bounds if active */}
                      {bk.review?.rating && (
                        <div className="mt-2 p-2 bg-amber-50/60 border border-amber-100 text-amber-800 rounded-lg text-[10px] font-semibold">
                          ⭐ Rated: {bk.review.rating}/5 — "{bk.review.comment}"
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-200/60 pt-3 flex flex-col gap-2">
                    <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Total Charge:</span>
                      <span className="text-vnit-blue text-sm font-extrabold">₹ {bk.financials?.totalPrice || "0"}</span>
                    </div>

                    {bk.status === "pending_payment" && bk.financials?.stripeSessionId && (
                      <a
                        href={`https://checkout.stripe.com/c/pay/${bk.financials.stripeSessionId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full mt-1 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold py-2 rounded-lg text-center flex items-center justify-center gap-1.5 shadow-sm transition-all"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Complete Secure Payment
                      </a>
                    )}

                    {/* ⭐ ACTION BUTTON: Prompts feedback modal overlay layout window */}
                    {activeTab === "past" && bk.status === "allocated" && !bk.review?.rating && (
                      <button
                        type="button"
                        onClick={() => setReviewBookingId(bk._id)}
                        className="w-full mt-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold py-2 rounded-lg text-center cursor-pointer transition-all shadow-sm"
                      >
                        Leave Stay Review Feedback
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 🪟 THE INTERACTIVE REVIEW POST MODAL COMPONENT */}
      {reviewBookingId && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-100 shadow-xl space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">Rate Your Stay Experience</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Select Star Rating</label>
                <select
                  value={starRating}
                  onChange={(e) => setStarRating(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-vnit-blue text-slate-900 focus:outline-none"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 - Excellent Experience)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
                  <option value={3}>⭐⭐⭐ (3 - Satisfactory/Average)</option>
                  <option value={2}>⭐⭐ (2 - Below Expectations)</option>
                  <option value={1}>⭐ (1 - Highly Unsatisfactory)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Additional Comments</label>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-vnit-blue bg-white"
                  placeholder="Tell us about the room state, service cleanliness, or amenities..."
                />
              </div>
              <div className="flex items-center justify-end gap-2 text-xs font-bold pt-2">
                <button
                  type="button"
                  onClick={() => setReviewBookingId(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl cursor-pointer"
                >
                  Submit Feedback Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;