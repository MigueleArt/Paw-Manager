import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Send, CheckCircle, Shield, AlertTriangle, Sparkles, PawPrint, HelpCircle } from "lucide-react";

interface WaitlistEntry {
  id: string;
  shelterName: string;
  userName: string;
  email: string;
  whatsapp?: string;
  petCount: string;
  timestamp: string;
}

interface CTAFormProps {
  onRegisterSuccess: (entry: WaitlistEntry) => void;
}

export default function CTAForm({ onRegisterSuccess }: CTAFormProps) {
  // Input fields state
  const [shelterName, setShelterName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [petCount, setPetCount] = useState("");

  // validation states
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form handle
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // reset errors
    const currentErrors: { [key: string]: string } = {};
    if (!shelterName.trim()) currentErrors.shelterName = "El nombre de la organización es obligatorio";
    if (!userName.trim()) currentErrors.userName = "Tu nombre es obligatorio";
    if (!email.trim()) {
      currentErrors.email = "El correo electrónico es obligatorio";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      currentErrors.email = "Correo electrónico no válido";
    }
    if (!petCount) currentErrors.petCount = "Por favor selecciona el rango de mascotas";

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdvAI5MQoQJJ3fGujbCsj2ylpiJegP0WzDZ7A52m-4U4EG1nA/formResponse";
    const formData = new FormData();
    formData.append("entry.1732942400", shelterName);
    formData.append("entry.483762169", userName);
    formData.append("entry.758779826", email);
    if (whatsapp) {
      formData.append("entry.342753457", whatsapp);
    }
    formData.append("entry.1079769614", petCount);

    fetch(FORM_URL, {
      method: "POST",
      body: formData,
      mode: "no-cors",
    })
      .then(() => {
        const newEntry: WaitlistEntry = {
          id: "WLT-" + Math.floor(Math.random() * 9000 + 1000),
          shelterName,
          userName,
          email,
          whatsapp: whatsapp || undefined,
          petCount,
          timestamp: new Date().toISOString()
        };

        // 1. Store in localStorage fallback
        try {
          const stored = localStorage.getItem("pawmanager_beta_waitlist");
          const list = stored ? JSON.parse(stored) : [];
          list.push(newEntry);
          localStorage.setItem("pawmanager_beta_waitlist", JSON.stringify(list));
        } catch (err) {
          console.error("No se pudo guardar en localStorage", err);
        }

        // 2. Bubble up to App.tsx reactive state
        onRegisterSuccess(newEntry);

        setIsSubmitting(false);
        setIsSuccess(true);

        // reset inputs
        setShelterName("");
        setUserName("");
        setEmail("");
        setWhatsapp("");
        setPetCount("");
      })
      .catch((error) => {
        console.error("Error al enviar el formulario a Google Forms", error);
        setIsSubmitting(false);
        alert("Hubo un error al enviar la solicitud. Por favor intenta de nuevo.");
      });
  };

  return (
    <section id="registro" className="py-24 bg-paw-pattern relative overflow-hidden">
      {/* Decorative Warm Blobs */}
      <div className="absolute top-1/4 right-0 w-80 h-80 bg-[#E9C46A]/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-[#F4845F]/10 rounded-full blur-3xl -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main curved layout container */}
        <div className="bg-white rounded-[2.5rem] border border-[#F4845F]/15 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12">

          {/* Informative Left Sidebar Panel (Cozy and emotional pitch) */}
          <div className="md:col-span-5 bg-[#2D6A4F] text-white p-8 sm:p-10 flex flex-col justify-between text-left relative">
            {/* Paw background pattern hint */}
            <div className="absolute inset-0 bg-[#1B4332]/20 mix-blend-overlay pointer-events-none" />

            <div className="space-y-6 relative z-10">
              <div className="bg-white/10 p-3 rounded-2xl w-12 h-12 flex items-center justify-center">
                <Heart className="h-6 w-6 fill-[#E9C46A] text-[#E9C46A]" />
              </div>
              <h3 className="font-serif font-black text-2xl sm:text-3xl leading-tight">
                Hagamos equipo por ellos 🐾
              </h3>
              <p className="text-sm text-emerald-100 font-sans leading-relaxed">
                Estamos abriendo accesos semanales ordenados para asegurar la mejor asesoría técnica directa a cada refugio.
              </p>


            </div>

            {/* Shield disclaimer */}
            <div className="relative z-10 pt-8 mt-8 border-t border-emerald-100/15 flex items-center space-x-2.5 text-[11px] text-emerald-200">
              <Shield className="h-4 w-4 shrink-0 text-[#E9C46A]" />
              <span>Garantía de Privacidad de Datos Animales.</span>
            </div>
          </div>

          {/* Form Side (Right) */}
          <div className="md:col-span-7 p-8 sm:p-10 text-left">
            <h4 className="font-serif font-black text-[#1B4332] text-2xl sm:text-3xl leading-tight mb-2">
              Sé de los primeros en acceder
            </h4>
            <p className="text-sm text-gray-500 mb-6 font-sans">
              Regístrate y te contactaremos para darte acceso en menos de 24 horas.
            </p>

            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.form
                  key="form"
                  onSubmit={handleFormSubmit}
                  className="space-y-4"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Shelter Name input */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest font-mono">
                      Nombre del Refugio / Organización *
                    </label>
                    <input
                      type="text"
                      value={shelterName}
                      onChange={(e) => setShelterName(e.target.value)}
                      placeholder="Ej. Albergue La Esperanza MTY"
                      className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.shelterName ? "border-red-400 focus:ring-red-200" : "border-gray-200 focus:border-[#2D6A4F] focus:ring-[#2D6A4F]/25"
                        } focus:ring-4 focus:outline-none text-sm transition-all text-gray-800`}
                    />
                    {errors.shelterName && (
                      <p className="text-xs text-red-600 flex items-center space-x-1 font-sans">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>{errors.shelterName}</span>
                      </p>
                    )}
                  </div>

                  {/* Two columns: User Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* User Name */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest font-mono">
                        Tu Nombre *
                      </label>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Ej. Juan Pérez"
                        className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.userName ? "border-red-400 focus:ring-red-200" : "border-gray-200 focus:border-[#2D6A4F] focus:ring-[#2D6A4F]/25"
                          } focus:ring-4 focus:outline-none text-sm transition-all text-gray-800`}
                      />
                      {errors.userName && (
                        <p className="text-xs text-red-600 flex items-center space-x-1">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                          <span>{errors.userName}</span>
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest font-mono">
                        Correo Electrónico *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ejemplo@refugio.org"
                        className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.email ? "border-red-400 focus:ring-red-200" : "border-gray-200 focus:border-[#2D6A4F] focus:ring-[#2D6A4F]/25"
                          } focus:ring-4 focus:outline-none text-sm transition-all text-gray-800`}
                      />
                      {errors.email && (
                        <p className="text-xs text-red-600 flex items-center space-x-1">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                          <span>{errors.email}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* WhatsApp optional */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest font-mono flex items-center justify-between">
                      <span>WhatsApp (Opcional)</span>
                      <span className="text-[10px] text-[#2D6A4F] lowercase italic font-sans font-normal">Para soporte directo</span>
                    </label>
                    <input
                      type="text"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="Ej. +52 1 55 1234 5678"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#2D6A4F] focus:ring-4 focus:ring-[#2D6A4F]/25 focus:outline-none text-sm transition-all text-gray-800"
                    />
                  </div>

                  {/* Pet volume select */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest font-mono">
                      ¿Cuántas mascotas administras? *
                    </label>
                    <select
                      value={petCount}
                      onChange={(e) => setPetCount(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.petCount ? "border-red-400 focus:ring-red-200" : "border-gray-200 focus:border-[#2D6A4F] focus:ring-[#2D6A4F]/25"
                        } focus:ring-4 focus:outline-none text-sm transition-all text-gray-800 cursor-pointer`}
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="1-10">1 a 10 mascotas</option>
                      <option value="10-50">10 a 50 mascotas</option>
                      <option value="50-100">50 a 100 mascotas</option>
                      <option value="+100">Más de 100 mascotas</option>
                    </select>
                    {errors.petCount && (
                      <p className="text-xs text-red-600 flex items-center space-x-1">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>{errors.petCount}</span>
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isSubmitting}
                      type="submit"
                      className="w-full bg-[#F4845F] hover:bg-[#e26d47] text-white font-bold py-4 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <PawPrint className="h-5 w-5 animate-bounce text-[#E9C46A]" />
                          <span>Procesando tu solicitud...</span>
                        </>
                      ) : (
                        <>
                          <span>¡Quiero acceso!</span>
                          <Send className="h-4.5 w-4.5" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="success-box"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-emerald-50 border-2 border-dashed border-[#2D6A4F]/30 p-8 rounded-3xl text-center space-y-4"
                >
                  <div className="bg-[#2D6A4F] text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto shadow-md">
                    <Sparkles className="h-8 w-8 text-[#E9C46A] fill-[#E9C46A]" />
                  </div>
                  <h5 className="font-serif font-black text-[#1B4332] text-2xl">
                    🐾 ¡Listo! Te contactaremos pronto.
                  </h5>
                  <p className="text-sm text-gray-700 font-sans max-w-md mx-auto leading-relaxed">
                    Hemos agendado tu pre-registro con éxito. Tu organización ha sido añadida a la lista de espera activa y te enviaremos tu liga de acceso al correo registrado.
                  </p>

                  <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs max-w-sm mx-auto text-xs text-left space-y-2">
                    <p className="font-bold text-[#2D6A4F] flex items-center space-x-1">
                      <span>✓ Expediente Pre-Aprobado</span>
                    </p>
                    <p className="text-gray-500 font-sans">
                      Aceleramos la entrega de tu plan Beta. Recibirás un mensaje de WhatsApp técnico para confirmar tu importación de Excel.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsSuccess(false)}
                    className="text-xs font-bold text-[#F4845F] hover:underline"
                  >
                    Registrar otra organización o corregir datos
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}
