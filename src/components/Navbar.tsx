import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PawPrint, Menu, X, ArrowRight } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#FDF8F0]/90 backdrop-blur-md shadow-sm border-b border-[#F4845F]/10 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => scrollToSection("hero")}
            className="flex items-center space-x-2 cursor-pointer group"
          >
            <div className="bg-[#2D6A4F] text-[#FDF8F0] p-2 rounded-xl transition-transform group-hover:scale-110 duration-200">
              <PawPrint className="h-5 w-5 fill-[#E9C46A] text-[#E9C46A]" />
            </div>
            <span className="text-xl font-bold font-serif text-[#2D6A4F] tracking-tight">
              Paw<span className="text-[#F4845F]">Manager</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("problemas")}
              className="text-gray-700 hover:text-[#2D6A4F] font-medium transition-colors text-sm"
            >
              Problemas
            </button>
            <button
              onClick={() => scrollToSection("solucion")}
              className="text-gray-700 hover:text-[#2D6A4F] font-medium transition-colors text-sm"
            >
              Características
            </button>
            <button
              onClick={() => scrollToSection("beneficios")}
              className="text-gray-700 hover:text-[#2D6A4F] font-medium transition-colors text-sm"
            >
              Beneficios
            </button>
            <button
              onClick={() => scrollToSection("galeria")}
              className="text-gray-700 hover:text-[#2D6A4F] font-medium transition-colors text-sm"
            >
              Adopciones
            </button>
            <button
              onClick={() => scrollToSection("testimonios")}
              className="text-gray-700 hover:text-[#2D6A4F] font-medium transition-colors text-sm"
            >
              Testimonios
            </button>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToSection("registro")}
              className="bg-[#2D6A4F] hover:bg-[#1B4332] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors duration-250 flex items-center space-x-2 shadow-md shadow-[#2D6A4F]/10 cursor-pointer"
            >
              <span>Quiero probarlo gratis</span>
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-[#2D6A4F] p-2 rounded-lg transition-colors focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-[#FDF8F0] border-t border-[#F4845F]/15 px-4 pt-4 pb-6 space-y-3 shadow-lg"
          >
            <button
              onClick={() => scrollToSection("problemas")}
              className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-[#F4845F]/10 hover:text-[#2D6A4F] rounded-lg transition-colors"
            >
              Problemas
            </button>
            <button
              onClick={() => scrollToSection("solucion")}
              className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-[#F4845F]/10 hover:text-[#2D6A4F] rounded-lg transition-colors"
            >
              Características
            </button>
            <button
              onClick={() => scrollToSection("beneficios")}
              className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-[#F4845F]/10 hover:text-[#2D6A4F] rounded-lg transition-colors"
            >
              Beneficios
            </button>
            <button
              onClick={() => scrollToSection("galeria")}
              className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-[#F4845F]/10 hover:text-[#2D6A4F] rounded-lg transition-colors"
            >
              Adopciones
            </button>
            <button
              onClick={() => scrollToSection("testimonios")}
              className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-[#F4845F]/10 hover:text-[#2D6A4F] rounded-lg transition-colors"
            >
              Testimonios
            </button>
            <button
              onClick={() => scrollToSection("registro")}
              className="w-full mt-2 bg-[#2D6A4F] text-white px-4 py-3 rounded-xl text-center font-bold transition-all flex items-center justify-center space-x-2"
            >
              <span>Quiero probarlo gratis</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
