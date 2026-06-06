import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Problems from "./components/Problems";
import Solution from "./components/Solution";
import Benefits from "./components/Benefits";
import PetGallery from "./components/PetGallery";

import CTAForm from "./components/CTAForm";
import Footer from "./components/Footer";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, X, Sparkles, PawPrint } from "lucide-react";

interface WaitlistEntry {
  id: string;
  shelterName: string;
  userName: string;
  email: string;
  whatsapp?: string;
  petCount: string;
  timestamp: string;
}

export default function App() {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [registeredShelterName, setRegisteredShelterName] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("pawmanager_beta_waitlist");
      if (stored) {
        setWaitlist(JSON.parse(stored));
      }
    } catch (e) {
      console.error("No se pudo leer del localStorage en el inicio", e);
    }
  }, []);

  // Handler for successful waitlist registrations
  const handleRegisterSuccess = (entry: WaitlistEntry) => {
    setWaitlist((prev) => [entry, ...prev]);
    setRegisteredShelterName(entry.shelterName);
    setShowToast(true);

    // Auto-dismiss toast
    setTimeout(() => {
      setShowToast(false);
    }, 6000);
  };

  return (
    <div className="min-h-screen bg-[#FDF8F0] text-gray-800 selection:bg-[#F4845F]/20 selection:text-[#1B4332] relative overflow-x-hidden">
      {/* Fixed Sticky Header Navbar */}
      <Navbar />

      {/* Main Sections */}
      <main>
        {/* HERO SECTION */}
        <Hero />

        {/* PAIN POINTS SECTION */}
        <Problems />

        {/* SOLUTIONS SECTION */}
        <Solution />

        {/* DETAILED SaaS BENEFITS */}
        <Benefits />

        {/* EMOTIONAL GALLERY */}
        <PetGallery />



        {/* REGISTRATION FORM (THE MAIN CTA CONVERSION DRIVER) */}
        <CTAForm onRegisterSuccess={handleRegisterSuccess} />
      </main>

      {/* THE EMOTIONAL DETAILED FOOTER */}
      <Footer />

      {/* Toast Notification Celebration popup */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#1B4332] text-white rounded-2xl shadow-2xl border-2 border-[#E9C46A] p-4 flex items-start space-x-3 text-left"
          >
            <div className="bg-[#E9C46A] text-[#1B4332] p-2 rounded-xl shrink-0">
              <PawPrint className="h-5 w-5 fill-[#F4845F] text-[#F4845F]" />
            </div>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest font-mono text-[#E9C46A] font-black">Pre-Registro Exitoso</span>
                <button
                  onClick={() => setShowToast(false)}
                  className="text-gray-400 hover:text-white p-0.5 rounded-md transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <h5 className="font-bold text-sm leading-snug font-sans">
                ¡Gracias por sumarte, {registeredShelterName}!
              </h5>
              <p className="text-xs text-gray-300 font-sans leading-relaxed">
                🐾 Hemos guardado tu información. Recibirás respuesta técnica para importar tus mascotas pronto.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
