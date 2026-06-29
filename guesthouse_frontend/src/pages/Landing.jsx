import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ShieldCheck, Coffee, ChevronRight } from 'lucide-react';

// Import local assets out of the src folder path
import instituteLogo from '../assets/vnit-logo-1.jpg';
import campusHeroBg from '../assets/vnit_bg.jpg';

const Landing = () => {
    const navigate = useNavigate();

    // Establish template references for smooth structural layout scrolling
    const infoSectionRef = useRef(null);
    const roomSectionRef = useRef(null);

    const executeScrollTarget = (elementRef) => {
        elementRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const roomTiers = [
        {
            title: "Single Executive Room",
            desc: "Perfect for visiting scholars and individual researchers. Complete with a dedicated study workspace.",
            price: "800 - 1200",
            image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=600&q=80"
        },
        {
            title: "Deluxe Double Suite",
            desc: "Spacious layout tailored for family members of students or official institutional guests.",
            price: "1800",
            image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
            
            {/* 🗺️ Header Navigation Hub */}
            <nav className="bg-vnit-blue text-white shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Render the local circular emblem layout */}
                        <img 
                            src={instituteLogo} 
                            alt="VNIT Emblem" 
                            className="w-12 h-12 object-contain bg-white rounded-full p-0.5"
                        />
                        <div>
                            <span className="font-bold text-base md:text-lg block tracking-tight leading-none">VNIT Nagpur</span>
                            <span className="text-xs text-slate-300 block mt-1">Guest House Portal</span>
                        </div>
                    </div>

                    {/* Smooth Scrolling Navigation Hooks */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-200">
                        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors cursor-pointer">Home</button>
                        <button onClick={() => executeScrollTarget(infoSectionRef)} className="hover:text-white transition-colors cursor-pointer">About Facility</button>
                        <button onClick={() => executeScrollTarget(roomSectionRef)} className="hover:text-white transition-colors cursor-pointer">Accommodation Tiers</button>
                    </div>

                    <button 
                        onClick={() => navigate('/login')}
                        className="bg-vnit-accent hover:bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
                    >
                        Sign In
                    </button>
                </div>
            </nav>

            {/* 🏙️ Hero Section with Local Image Backdrop */}
            <header 
                className="relative py-28 px-6 text-center bg-cover bg-center bg-no-repeat overflow-hidden flex items-center justify-center min-h-[480px]"
                style={{ backgroundImage: `url(${campusHeroBg})` }}
            >
                {/* Visual Overlay Mask Layer for Readability */}
                <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"></div>
                
                <div className="max-w-3xl mx-auto relative z-10 space-y-5">
                    <span className="bg-vnit-accent/20 border border-vnit-accent/30 text-blue-400 px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider inline-block">
                        Campus Hospitality Services
                    </span>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                        Premium Accommodation For The <br className="hidden md:block" /> VNIT Academic Community
                    </h1>
                    <p className="text-slate-300 text-sm md:text-base max-w-xl mx-auto font-normal leading-relaxed">
                        Secure digital booking ecosystem for students, faculty members, and visiting delegates.
                    </p>
                    <div className="pt-2">
                        <button 
                            onClick={() => navigate('/login')}
                            className="bg-vnit-accent hover:bg-blue-600 text-white font-semibold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-vnit-accent/20 inline-flex items-center gap-2 group cursor-pointer text-sm"
                        >
                            Initialize Stay Booking
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </header>

            {/* 🏷️ Core Feature Grid */}
            <section ref={infoSectionRef} className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-6 -mt-10 relative z-20">
                <div className="bg-white p-5 rounded-xl shadow-md border border-slate-100 flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-vnit-accent" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-slate-900 mb-1">Temporal Date Holds</h3>
                        <p className="text-slate-500 text-xs leading-relaxed">Secures your preferred room allocation for 5 minutes during checkout.</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-md border border-slate-100 flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-slate-900 mb-1">Strict Domain Gate</h3>
                        <p className="text-slate-500 text-xs leading-relaxed">Exclusively open to official institutional email endpoints (@vnit.ac.in).</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-md border border-slate-100 flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                        <Coffee className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-slate-900 mb-1">Fully Equipped Units</h3>
                        <p className="text-slate-500 text-xs leading-relaxed">Air-conditioned choices, study areas, and campus network hooks.</p>
                    </div>
                </div>
            </section>

            {/* 🛏️ Accommodation Showcase */}
            <main ref={roomSectionRef} className="max-w-7xl mx-auto px-6 pb-20 flex-grow w-full scroll-mt-24">
                <h2 className="text-2xl font-bold text-slate-900 text-center mb-2 tracking-tight">Available Accommodation Tiers</h2>
                <p className="text-slate-500 text-center max-w-sm mx-auto mb-10 text-xs">Explore premium configurations maintained by the estate office.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {roomTiers.map((room, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200/60 group hover:shadow-md transition-all">
                            <div className="h-56 overflow-hidden relative">
                                <img src={room.image} alt={room.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-vnit-blue font-bold px-3 py-1 rounded-lg text-xs shadow-sm">
                                    ₹ {room.price} / Night
                                </div>
                            </div>
                            <div className="p-5 space-y-2">
                                <h3 className="text-lg font-bold text-slate-900">{room.title}</h3>
                                <p className="text-slate-500 text-xs leading-relaxed">{room.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* 🏛️ Official Institutional Links Footer Base */}
            <footer className="bg-vnit-blue text-white pt-10 border-t-4 border-vnit-accent">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 text-xs md:text-sm">
                    
                    {/* Important Column */}
                    <div className="space-y-3">
                        <h4 className="font-bold border-l-2 border-vnit-accent pl-2 text-slate-200 uppercase tracking-wider text-xs">Important Links</h4>
                        <ul className="space-y-2 text-slate-300">
                            <li><a href="https://vnit.samarth.ac.in/index.php/site/login" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Samarth eGov Suite</a></li>
                            <li><a href="#complaints" className="hover:text-white transition-colors">How to Raise Complaint</a></li>
                            <li><a href="#eoffice" className="hover:text-white transition-colors">eOffice-VNIT</a></li>
                            <li><a href="https://vnitaims.vnit.ac.in/mproaims/#/" className="hover:text-white transition-colors">New AIMS Login</a></li>
                        </ul>
                    </div>

                    {/* Quick Column */}
                    <div className="space-y-3">
                        <h4 className="font-bold border-l-2 border-vnit-accent pl-2 text-slate-200 uppercase tracking-wider text-xs">Quick Links</h4>
                        <ul className="space-y-2 text-slate-300">
                            <li><a href="https://vnit.ac.in/administrative-forms/" className="hover:text-white transition-colors">Administrative Forms</a></li>
                            <li><a href="https://vnit.ac.in/telephone-directory/" className="hover:text-white transition-colors">Telephone Directory</a></li>
                            <li><a href="https://vnit.ac.in/maps-directions/" className="hover:text-white transition-colors">Maps & Directions</a></li>
                            <li><a href="https://vnit.ac.in/contact-us/" className="hover:text-white transition-colors">Contact Us</a></li>
                        </ul>
                    </div>

                   
                    
                </div>

                {/* Flat Copyright Ending Banner Strip */}
                <div className="bg-slate-950/40 py-4 text-center text-[11px] text-slate-400 border-t border-white/5">
                    Copyright © 2026 VNIT Nagpur. All Rights Reserved.
                </div>
            </footer>
        </div>
    );
};

export default Landing;