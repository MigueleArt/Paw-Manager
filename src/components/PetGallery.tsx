import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, Sparkles, Filter, Heart, FileText, ArrowUpRight } from "lucide-react";

interface Pet {
  id: string;
  name: string;
  species: "dog" | "cat";
  img: string;
  age: string;
  gender: string;
  tags: string[];
}

export default function PetGallery() {
  const [filterType, setFilterType] = useState<"all" | "dog" | "cat">("all");

  const pets: Pet[] = [
    {
      id: "P-01",
      name: "Toby",
      species: "dog",
      img: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80",
      age: "1.5 años",
      gender: "Macho",
      tags: ["Sociable", "Energético", "Vacunado"]
    },
    {
      id: "P-02",
      name: "Luna",
      species: "cat",
      img: "https://images.unsplash.com/photo-1615789591457-74a63395c990?w=800&q=80",
      age: "8 meses",
      gender: "Hembra",
      tags: ["Tranquila", "Cariñosa", "Esterilizada"]
    },
    {
      id: "P-03",
      name: "Chilaquil",
      species: "dog",
      img: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=800&q=80",
      age: "2 años",
      gender: "Macho",
      tags: ["Juguetón", "Protector", "Sano"]
    },
    {
      id: "P-04",
      name: "Milo",
      species: "cat",
      img: "https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=800&q=80",
      age: "4 meses",
      gender: "Macho",
      tags: ["Curioso", "Travieso", "Desparasitado"]
    },
    {
      id: "P-05",
      name: "Manchas",
      species: "dog",
      img: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&q=80",
      age: "3 años",
      gender: "Hembra",
      tags: ["Amigable", "Tranquila", "Ideal Niños"]
    },
    {
      id: "P-06",
      name: "Copito",
      species: "dog",
      img: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80",
      age: "5 meses",
      gender: "Macho",
      tags: ["Activo", "Mestizo Labrador", "Alegre"]
    }
  ];

  const filteredPets = filterType === "all" ? pets : pets.filter(p => p.species === filterType);

  return (
    <section id="galeria" className="py-20 bg-paw-pattern relative overflow-hidden">
      
      {/* Visual Accent Blurs */}
      <div className="absolute top-10 left-10 w-48 h-48 bg-[#F4845F]/5 rounded-full blur-2xl" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-[#2D6A4F]/5 rounded-full blur-2xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center space-x-2 bg-[#E9C46A]/20 text-[#805B10] px-4 py-1.5 rounded-full text-xs font-semibold shadow-inner font-mono">
            <Camera className="h-4 w-4" />
            <span>Galería de Historias Reales</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-[#1B4332]">
            Cada uno merece una historia bien contada
          </h2>
          <p className="text-gray-600 font-sans">
            PawManager te permite crear páginas públicas de adopción de alto impacto emocional con buenas fotos, 
            tags personalizados y formularios de pre-adopción integrados.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center justify-center space-x-3 mb-12">
          <button
            onClick={() => setFilterType("all")}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
              filterType === "all"
                ? "bg-[#2D6A4F] text-white shadow-md shadow-[#2D6A4F]/20"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Todos ({pets.length})
          </button>
          
          <button
            onClick={() => setFilterType("dog")}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
              filterType === "dog"
                ? "bg-[#2D6A4F] text-white shadow-md shadow-[#2D6A4F]/20"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            🐕 Perros
          </button>

          <button
            onClick={() => setFilterType("cat")}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
              filterType === "cat"
                ? "bg-[#2D6A4F] text-white shadow-md shadow-[#2D6A4F]/20"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            🐈 Gatos
          </button>
        </div>

        {/* Dynamic Grid Layout */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence>
            {filteredPets.map((pet) => (
              <motion.div
                layout
                key={pet.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-[2rem] overflow-hidden border border-[#F4845F]/10 shadow-md group relative text-left"
              >
                {/* Photo frame */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={pet.img}
                    alt={`Foto de ${pet.name}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Photo Soft Overlay for details read */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1B4332]/80 via-transparent to-transparent opacity-60" />
                  
                  {/* Floating ID badge */}
                  <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono text-gray-700 font-bold border border-[#F4845F]/10">
                    ID: {pet.id}
                  </span>

                  {/* Female/Male label floating right */}
                  <span className="absolute top-4 right-4 bg-[#2D6A4F] text-[#FDF8F0] px-3 py-1 rounded-full text-[10px] font-sans font-bold">
                    {pet.gender === "Macho" ? "♂ Macho" : "♀ Hembra"}
                  </span>

                  {/* Bottom Text inside frame */}
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <p className="text-xs font-mono text-gray-300 font-bold uppercase tracking-wider">Listo Para Adopción</p>
                    <div className="flex items-baseline space-x-2">
                      <h4 className="font-serif font-black text-2xl leading-none text-[#FDF8F0]">{pet.name}</h4>
                      <span className="text-xs text-white/90">• {pet.age}</span>
                    </div>
                  </div>
                </div>

                {/* Tags and Preview Details Footer */}
                <div className="p-5 space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {pet.tags.map((tag, iIdx) => (
                      <span
                        key={iIdx}
                        className="bg-[#2D6A4F]/10 text-[#2D6A4F] text-[10px] font-bold px-2.5 py-1 rounded-lg border border-[#2D6A4F]/5 font-sans"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-dashed border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
                      <strong>4 Candidatos</strong>
                    </span>
                    <button
                      onClick={() => {
                        const registerSection = document.getElementById("registro");
                        registerSection?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="text-[#F4845F] font-bold font-sans flex items-center space-x-1 hover:underline cursor-pointer"
                    >
                      <span>Postular refugio</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Motivational Callout */}
        <div className="mt-12 bg-white/75 backdrop-blur-md border border-[#F4845F]/15 rounded-2xl p-6 max-w-2xl mx-auto text-center space-y-3 shadow-xs">
          <p className="text-sm font-sans text-gray-700 italic">
            "Las fichas públicas de PawManager tienen plantillas SEO avanzadas para indexarse en Google e incrementar las visitas en un 34%."
          </p>
        </div>

      </div>
    </section>
  );
}
