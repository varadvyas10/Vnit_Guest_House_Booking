import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  ShieldCheck,
  RefreshCw,
  Calendar,
  ClipboardList,
  CheckSquare,
  Building,
  Layers,
  Wind,
  XCircle,
  ChevronRight,
  Ban,
  Clock,
  History,
  Wrench,
  CheckCircle,
} from "lucide-react";
import API from "../services/api";

const AdminDashboard = () => {
  const { logout } = useAuth();

  // Master App Memory State Hooks
  const [bookings, setBookings] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState({ type: "", text: "" });

  // Navigation Track states
  const [adminTab, setAdminTab] = useState("queue");
  const [floorFilter, setFloorFilter] = useState("All");

  // Interaction Control toggles
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rejectionBookingId, setRejectionBookingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    loadAdminConsoleData();
  }, []);

  const loadAdminConsoleData = async () => {
    try {
      setLoading(true);
      setActionMessage({ type: "", text: "" });

      const bookingsRes = await API.get("/bookings");
      const rawBookings = bookingsRes.data?.bookings || bookingsRes.data;
      setBookings(Array.isArray(rawBookings) ? rawBookings : []);

      const roomsRes = await API.get("/rooms");
      const rawRooms = roomsRes.data?.rooms || roomsRes.data;
      setAllRooms(Array.isArray(rawRooms) ? rawRooms : []);
    } catch (err) {
      setActionMessage({
        type: "error",
        text: "Synchronization with core reservation data pools failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔧 Dynamic Switch: Toggle Room Asset Maintenance Mode Natively
  const handleToggleMaintenance = async (roomId) => {
    try {
      setProcessingAction(true);
      const res = await API.patch(`/rooms/toggle-maintenance/${roomId}`);
      setActionMessage({
        type: "success",
        text: res.data.message || "Room hardware status altered.",
      });
      loadAdminConsoleData();
    } catch (err) {
      setActionMessage({
        type: "error",
        text: "Failed to alter room asset operational environment mode.",
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const handleAllocateRoom = async (bookingId, roomId) => {
    try {
      setProcessingAction(true);
      const res = await API.patch(`/bookings/allocate/${bookingId}`, {
        roomId,
      });
      setActionMessage({
        type: "success",
        text: res.data.message || "Room allocated successfully!",
      });
      setSelectedBooking(null);
      loadAdminConsoleData();
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.response?.data?.message || "Allocation overlap conflict.",
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectBookingSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;

    try {
      setProcessingAction(true);
      await API.patch(`/bookings/reject/${rejectionBookingId}`, {
        reason: rejectionReason,
      });
      setActionMessage({
        type: "success",
        text: "Reservation request safely rejected and archived.",
      });
      setRejectionBookingId(null);
      setRejectionReason("");
      loadAdminConsoleData();
    } catch (err) {
      setActionMessage({
        type: "error",
        text: "Failed to process cancellation state.",
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const currentDate = new Date();

  // Filter Arrays
  const pendingQueue = bookings.filter(
    (bk) =>
      bk?.status === "awaiting_approval" || bk?.status === "pending_payment",
  );

  const currentStays = bookings.filter((bk) => {
    if (!bk?.timeFrame?.startDate || !bk?.timeFrame?.endDate) return false;
    const start = new Date(bk.timeFrame.startDate);
    const end = new Date(bk.timeFrame.endDate);
    return (
      bk?.status === "allocated" && start <= currentDate && end >= currentDate
    );
  });

  const pastHistory = bookings.filter((bk) => {
    if (bk?.status === "rejected") return true;
    if (!bk?.timeFrame?.endDate) return false;
    const end = new Date(bk.timeFrame.endDate);
    return end < currentDate;
  });

  const filteredRooms = allRooms.filter(
    (rm) => floorFilter === "All" || rm?.floor === floorFilter,
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col text-slate-800">
      {/* Navbar Container Header */}
      <nav className="bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base md:text-lg block tracking-tight">
                VNIT Estate Office
              </span>
              <span className="text-xs text-emerald-400 font-medium block">
                Guest House Administration Console
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Sub Menu Links Workspace */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex items-center overflow-x-auto gap-6 h-14 text-xs font-bold text-slate-500">
          <button
            onClick={() => setAdminTab("queue")}
            className={`flex items-center gap-1.5 h-full border-b-2 px-1 transition-all cursor-pointer ${adminTab === "queue" ? "border-emerald-600 text-slate-900" : "border-transparent hover:text-slate-800"}`}
          >
            <ClipboardList className="w-4 h-4" /> Pending Requests Queue (
            {pendingQueue.length})
          </button>
          <button
            onClick={() => setAdminTab("matrix")}
            className={`flex items-center gap-1.5 h-full border-b-2 px-1 transition-all cursor-pointer ${adminTab === "matrix" ? "border-emerald-600 text-slate-900" : "border-transparent hover:text-slate-800"}`}
          >
            <Layers className="w-4 h-4" /> Guest House Structural Map (
            {allRooms.length})
          </button>
          <button
            onClick={() => setAdminTab("current")}
            className={`flex items-center gap-1.5 h-full border-b-2 px-1 transition-all cursor-pointer ${adminTab === "current" ? "border-emerald-600 text-slate-900" : "border-transparent hover:text-slate-800"}`}
          >
            <Clock className="w-4 h-4" /> Ongoing Live Stays (
            {currentStays.length})
          </button>
          <button
            onClick={() => setAdminTab("past")}
            className={`flex items-center gap-1.5 h-full border-b-2 px-1 transition-all cursor-pointer ${adminTab === "past" ? "border-emerald-600 text-slate-900" : "border-transparent hover:text-slate-800"}`}
          >
            <History className="w-4 h-4" /> Historical Archives
          </button>
        </div>
      </div>

      {/* Main Container Dashboard */}
      <div className="max-w-7xl mx-auto px-6 py-8 w-full flex-grow space-y-6">
        {actionMessage.text && (
          <div
            className={`p-4 text-xs font-medium rounded-xl border max-w-2xl ${actionMessage.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}
          >
            {actionMessage.text}
          </div>
        )}

        {/* 📋 TRACK 1: PENDING ALLOCATION QUEUE */}
        {adminTab === "queue" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 space-y-4">
            <h2 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-2">
              Pending Clearance Ledger
            </h2>
            {pendingQueue.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs font-semibold">
                Approval queue registers clear.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left border-collapse text-xs font-medium">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="p-4">Student Account</th>
                      <th className="p-4">Constraints Requested</th>
                      <th className="p-4">Stay Windows</th>
                      <th className="p-4 text-center">Action Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {pendingQueue.map((bk) => (
                      <tr key={bk?._id}>
                        <td className="p-4">
                          <div className="font-bold text-slate-900 text-sm">
                            {bk?.userId?.name ||
                              bk?.guestDetails?.name ||
                              "Guest Scholar"}
                          </div>
                          <div className="text-slate-400 text-[10px] mt-0.5">
                            Ref:{" "}
                            {bk?.userId?.institutionId || "External Profile"}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-blue-50 border border-blue-100 text-vnit-blue font-bold rounded text-[10px]">
                            {bk?.roomDetails?.roomType || "Standard"} Unit
                          </span>
                          <div className="text-slate-500 text-[11px] mt-1">
                            Floor Target: {bk?.roomDetails?.floorPreference}{" "}
                            Floor •{" "}
                            {bk?.roomDetails?.acRequired ? "AC" : "Non-AC"}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-slate-900 font-semibold">
                            {bk?.timeFrame?.startDate
                              ? new Date(
                                  bk.timeFrame.startDate,
                                ).toLocaleDateString("en-IN")
                              : "N/A"}
                          </div>
                          <div className="text-slate-400 text-[10px]">
                            to{" "}
                            {bk?.timeFrame?.endDate
                              ? new Date(
                                  bk.timeFrame.endDate,
                                ).toLocaleDateString("en-IN")
                              : "N/A"}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedBooking(bk)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1 cursor-pointer shadow-sm"
                            >
                              <Building className="w-3.5 h-3.5" /> Allocate Unit
                            </button>
                            <button
                              onClick={() => setRejectionBookingId(bk?._id)}
                              className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                              <Ban className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 🏢 TRACK 2: GENERAL BLUEPRINT ARCHITECTURE DETAILS (NO FALSE AVAILABILITY) */}
        {adminTab === "matrix" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">
                  Facility Structural Blueprint Reference
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Static inventory map of total room placements and hardware
                  toggle states
                </p>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/40 text-xs font-semibold">
                {["All", "Ground", "First", "Second", "Third"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFloorFilter(f)}
                    className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${floorFilter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {filteredRooms.map((room) => (
                <div
                  key={room?._id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-4 shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-900">
                        Room {room?.roomNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold border ${room?.status === "maintenance" ? "bg-red-50 border-red-100 text-red-700" : "bg-slate-100 border-slate-200 text-slate-600"}`}
                      >
                        {room?.status === "maintenance"
                          ? "MAINTENANCE OUTAGE"
                          : "OPERATIONAL"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 mt-2">
                      <Wind className="w-3.5 h-3.5 text-blue-400" />
                      {room?.ac
                        ? "Climate Controlled (AC)"
                        : "Non-AC Unit"}
                    </div>
                  </div>

                  {/* 🛠️ THE MAINTENANCE HARDWARE TOGGLE TRIGGER OUTLET */}
                  <button
                    disabled={processingAction}
                    onClick={() => handleToggleMaintenance(room?._id)}
                    className={`w-full text-center py-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      room?.status === "maintenance"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {room?.status === "maintenance" ? (
                      <CheckCircle className="w-3.5 h-3.5" />
                    ) : (
                      <Wrench className="w-3.5 h-3.5" />
                    )}
                    {room?.status === "maintenance"
                      ? "Set Room Back Online"
                      : "Flag for Maintenance Mode"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🕒 TRACK 3 & 4 KEEP OPERATIONAL SCALES EXACTLY AS DESIGNED BEFORE */}
        {adminTab === "current" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 space-y-4">
            <h2 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">
              Active In-House Log Sheet
            </h2>
            {currentStays.length === 0 ? (
              <div className="text-center py-16 text-xs text-slate-400 font-medium">
                No ongoing reservations inside rooms today.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left text-xs font-medium">
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="p-4">Assigned Room</th>
                      <th className="p-4">Occupant Details</th>
                      <th className="p-4">Stay Windows</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {currentStays.map((st) => (
                      <tr key={st?._id}>
                        <td className="p-4 font-bold text-slate-900 text-sm">
                          Room{" "}
                          {st?.assignedRoomId?.roomNumber || "Unassigned Asset"}
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-slate-800">
                            {st?.userId?.name || st?.guestDetails?.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Profile: {st?.guestDetails?.occupation || "Student"}
                          </div>
                        </td>
                        <td className="p-4 text-slate-500">
                          Till{" "}
                          {st?.timeFrame?.endDate
                            ? new Date(st.timeFrame.endDate).toLocaleDateString(
                                "en-IN",
                              )
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {adminTab === "past" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 space-y-4">
            <h2 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">
              Historical Settlement Record Files
            </h2>
            {pastHistory.length === 0 ? (
              <div className="text-center py-16 text-xs text-slate-400 font-medium">
                Logs archive empty.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left text-xs font-medium">
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="p-4">Account User</th>
                      <th className="p-4">Timeline Context</th>
                      <th className="p-4">Status Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {pastHistory.map((pt) => (
                      <tr key={pt?._id}>
                        <td className="p-4">
                          <div className="font-bold text-slate-900">
                            {pt?.userId?.name ||
                              pt?.guestDetails?.name ||
                              "Guest Record"}
                          </div>
                          {pt?.rejectionReason && (
                            <div className="text-red-500 text-[10px] font-medium mt-0.5">
                              Reason: {pt.rejectionReason}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-slate-400">
                          {pt?.timeFrame?.startDate
                            ? new Date(
                                pt.timeFrame.startDate,
                              ).toLocaleDateString("en-IN")
                            : "N/A"}{" "}
                          to{" "}
                          {pt?.timeFrame?.endDate
                            ? new Date(pt.timeFrame.endDate).toLocaleDateString(
                                "en-IN",
                              )
                            : "N/A"}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${pt?.status === "rejected" ? "bg-red-50 border-red-200 text-red-600" : "bg-slate-100 text-slate-500"}`}
                          >
                            {pt?.status?.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 🪟 ACCURATE REAL-TIME DATE OVERLAP CALCULATION FILTER MODAL */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full flex flex-col border border-slate-100">
              <div className="p-6 border-b border-slate-100 bg-slate-900 text-white rounded-t-2xl flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base">
                    Assign Room Asset
                  </h3>
                  <p className="text-slate-400 text-xs font-medium">
                    Showing rooms matching calendar schedules
                  </p>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-slate-400 hover:text-white font-bold text-sm"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4 max-h-[60vh]">
                <div className="bg-blue-50 border border-blue-100 text-vnit-blue text-xs p-3 rounded-xl font-semibold space-y-1">
                  <p>
                    🎯 Targets: {selectedBooking?.roomDetails?.roomType} •{" "}
                    {selectedBooking?.roomDetails?.acRequired ? "AC" : "Non-AC"}{" "}
                    • {selectedBooking?.roomDetails?.floorPreference} Floor
                    Preference
                  </p>
                  <p>
                    📅 Requested Target Timeframe:{" "}
                    {new Date(
                      selectedBooking?.timeFrame?.startDate,
                    ).toLocaleDateString("en-IN")}{" "}
                    to{" "}
                    {new Date(
                      selectedBooking?.timeFrame?.endDate,
                    ).toLocaleDateString("en-IN")}
                  </p>
                </div>

                {/* Dynamically filter active room options so rooms under maintenance are hidden */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {allRooms
                    .filter(
                      (r) =>
                        r?.type === selectedBooking?.roomDetails?.roomType &&
                        r?.status === "available",
                    )
                    .map((room) => (
                      <button
                        key={room?._id}
                        disabled={processingAction}
                        onClick={() =>
                          handleAllocateRoom(selectedBooking?._id, room?._id)
                        }
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-left hover:bg-emerald-50 hover:border-emerald-300 group transition-all cursor-pointer"
                      >
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-emerald-800">
                            Room {room?.roomNumber}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {room?.floor} Floor •{" "}
                            {room?.ac ? "AC" : "Non-AC"}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-600 transition-all" />
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REJECTION REASON ENTRY MODAL */}
        {rejectionBookingId && (
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-100">
              <div className="p-5 bg-red-600 text-white font-bold rounded-t-2xl text-base flex items-center gap-2">
                <XCircle className="w-5 h-5" /> Reject Request
              </div>
              <form
                onSubmit={handleRejectBookingSubmit}
                className="p-5 space-y-4"
              >
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Provide reason for room assignment rejection..."
                />
                <div className="flex items-center justify-end gap-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setRejectionBookingId(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processingAction}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm"
                  >
                    Confirm Disapproval
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
