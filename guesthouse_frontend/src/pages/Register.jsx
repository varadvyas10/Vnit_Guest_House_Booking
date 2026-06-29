import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import {
  UserPlus,
  User,
  Mail,
  ShieldAlert,
  Key,
  Building2,
  UserCheck,
} from "lucide-react";

// Unified local asset path name mapping matching your folder layout
import instituteLogo from "../assets/vnit-logo-1.jpg";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [department, setDepartment] = useState("Computer Science");
  const [institutionId, setInstitutionId] = useState("");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleRegistration = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    // 1. Structural Validation
    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      !institutionId ||
      !phone
    ) {
      setError("Please populate all required registration fields.");
      setSubmitting(false);
      return;
    }
    // 2. Strict Domain Check
    const emailLower = email.toLowerCase().trim();
    const isValidVnitDomain =
      emailLower.endsWith("@students.vnit.ac.in") ||
      emailLower.endsWith("@vnit.ac.in");

    if (!isValidVnitDomain) {
      setError(
        "Access Restrained: You must use an official @students.vnit.ac.in or @vnit.ac.in campus email address.",
      );
      setSubmitting(false);
      return;
    }

    // 3. Password Integrity Verification
    if (password !== confirmPassword) {
      setError(
        "Mismatch: Confirmation password field does not align with your selected password.",
      );
      setSubmitting(false);
      return;
    }

    try {
      await API.post("/auth/register", {
        name,
        email: emailLower,
        password,
        department,
        institutionId,
        phone,
        role: "student",
      });

      setSuccess(
        "Account provisioned successfully! Redirecting to login terminal...",
      );
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration pipeline execution aborted by server.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col">
        {/* Academic Branding Header */}
        <div className="bg-vnit-blue p-6 text-center text-white flex flex-col items-center justify-center gap-2">
          <img
            src={instituteLogo}
            alt="VNIT Logo"
            className="w-14 h-14 bg-white rounded-full p-0.5 object-contain"
          />
          <h2 className="text-xl font-bold tracking-tight">
            Create Campus Account
          </h2>
          <p className="text-slate-300 text-xs font-sans">
            VNIT Hospitality Network Access Management
          </p>
        </div>

        <form onSubmit={handleRegistration} className="p-8 space-y-5">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-xs leading-relaxed">
              <ShieldAlert className="w-5 h-5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-700 text-xs">
              <UserCheck className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {/* Split Form Group Grid Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-vnit-accent focus:bg-white transition-all text-xs"
                  placeholder="Pranav Tejankar"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Enrollment / ID Number
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={institutionId}
                  onChange={(e) => setInstitutionId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-vnit-accent focus:bg-white transition-all text-xs"
                  placeholder="BT23CSE042"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Institutional Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-vnit-accent focus:bg-white transition-all text-xs"
                placeholder="username@students.vnit.ac.in"
              />
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5 px-1">
              Must terminate explicitly in domain credentials format.
            </span>
          </div>
          {/* Add this block right above the Academic Department Cluster select element */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Contact Phone Number
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 font-sans">
                +91
              </span>
              <input
                type="tel"
                value={phone}
                maxLength={10}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} // Ensures only numeric digits are typed
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-vnit-accent focus:bg-white transition-all text-xs"
                placeholder="9422112233"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Academic Department Cluster
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-vnit-accent focus:bg-white transition-all text-xs"
            >
              <option value="Computer Science and Engineering (CSE)">
                Computer Science and Engineering (CSE)
              </option>
              <option value="Computer Science and Engineering (Artificial Intelligence and Data Science)">
                Computer Science and Engineering (Artificial Intelligence and
                Data Science)
              </option>
              <option value="Electronics and Communication Engineering (ECE)">
                Electronics and Communication Engineering (ECE)
              </option>
              <option value="Electronics Engineering (VLSI Design and Technology)">
                Electronics Engineering (VLSI Design and Technology)
              </option>
              <option value="Electrical and Electronics Engineering (EEE)">
                Electrical and Electronics Engineering (EEE)
              </option>
              <option value="Mechanical Engineering">
                Mechanical Engineering
              </option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="Chemical Engineering">Chemical Engineering</option>
              <option value="Metallurgical and Materials Engineering">
                Metallurgical and Materials Engineering
              </option>
              <option value="Mining Engineering">Mining Engineering</option>
              <option value="Engineering Physics">Engineering Physics</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Create Password
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-vnit-accent focus:bg-white transition-all text-xs"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Confirm Password
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-vnit-accent focus:bg-white transition-all text-xs"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-vnit-blue hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-xs mt-2"
          >
            <UserPlus className="w-4 h-4" />
            {submitting
              ? "Provisioning Profile..."
              : "Complete System Registration"}
          </button>

          <div className="text-center pt-2">
            <span className="text-xs text-slate-500">Already registered? </span>
            <Link
              to="/login"
              className="text-xs font-bold text-vnit-accent hover:underline cursor-pointer"
            >
              Sign In Here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
