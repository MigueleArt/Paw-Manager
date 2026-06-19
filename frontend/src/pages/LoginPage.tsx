import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PawPrint, Mail, Lock, ArrowRight, AlertTriangle, ArrowLeft, Building, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        const clinicRef = await addDoc(collection(db, 'clinics'), {
          name: clinicName,
          ownerUid: userCredential.user.uid,
          createdAt: new Date().toISOString(),
        });

        await addDoc(collection(db, 'roles'), {
          name: fullName,
          email: email,
          role: 'Administrador',
          status: 'Activo',
          uid: userCredential.user.uid,
          clinicId: clinicRef.id,
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);

      let errorMessage = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';

      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password'
      ) {
        errorMessage = 'Correo o contraseña incorrectos. Por favor, verifica tus datos.';
      } else if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Este correo ya está registrado. Por favor, inicia sesión.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'El formato del correo electrónico no es válido.';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAuthMode = () => {
    setIsRegistering(!isRegistering);
    setError(null);
    setEmail('');
    setPassword('');
    setFullName('');
    setClinicName('');
  };

  return (
    <div className="min-h-screen bg-[#FDF8F0] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center text-gray-500 hover:text-[#1B4332] transition-colors font-medium text-sm bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 shadow-sm hover:shadow-md"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver al inicio
      </button>

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 150, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[#E9C46A]/10 blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 150, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#1B4332]/5 blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="sm:mx-auto sm:w-full sm:max-w-md z-10"
      >
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 3 }}
          transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
          className="mx-auto h-16 w-16 bg-[#1B4332] rounded-2xl flex items-center justify-center shadow-lg"
        >
          <PawPrint className="h-10 w-10 text-[#E9C46A] -rotate-3" />
        </motion.div>

        <h2 className="mt-6 text-center text-3xl font-extrabold text-[#1B4332]">
          {isRegistering ? 'Crea tu Veterinaria' : 'Accede a tu Clínica'}
        </h2>

        <p className="mt-2 text-center text-sm text-gray-600">
          PawManager, el sistema definitivo.
        </p>
      </motion.div>

      <div className="mt-8 mx-4 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
          className="bg-white/90 backdrop-blur-md py-8 px-4 shadow-2xl shadow-[#1B4332]/10 sm:rounded-3xl sm:px-10 border border-white"
        >
          <form className="space-y-6" onSubmit={handleAuth}>
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.9 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.9 }}
                  className="bg-red-50 p-3 rounded-xl border border-red-200 flex items-start space-x-2"
                >
                  <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                  <span className="text-sm text-red-700">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isRegistering && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-6 overflow-hidden"
                >
                  <motion.div whileTap={{ scale: 0.99 }}>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                      Nombre Completo
                    </label>

                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>

                      <input
                        id="fullName"
                        type="text"
                        required={isRegistering}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="focus:ring-[#1B4332] focus:border-[#1B4332] block w-full pl-10 sm:text-sm border-gray-300 rounded-xl py-3 border bg-gray-50/50"
                        placeholder="Ej. Dr. Juan Pérez"
                      />
                    </div>
                  </motion.div>

                  <motion.div whileTap={{ scale: 0.99 }}>
                    <label htmlFor="clinicName" className="block text-sm font-medium text-gray-700">
                      Nombre de la Veterinaria
                    </label>

                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-5 w-5 text-gray-400" />
                      </div>

                      <input
                        id="clinicName"
                        type="text"
                        required={isRegistering}
                        value={clinicName}
                        onChange={(e) => setClinicName(e.target.value)}
                        className="focus:ring-[#1B4332] focus:border-[#1B4332] block w-full pl-10 sm:text-sm border-gray-300 rounded-xl py-3 border bg-gray-50/50"
                        placeholder="Ej. Clínica Veterinaria San Roque"
                      />
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div whileTap={{ scale: 0.99 }}>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>

              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:ring-[#1B4332] focus:border-[#1B4332] block w-full pl-10 sm:text-sm border-gray-300 rounded-xl py-3 border bg-gray-50/50 transition-shadow focus:shadow-md"
                  placeholder="admin@clinicavet.com"
                />
              </div>
            </motion.div>

            <motion.div whileTap={{ scale: 0.99 }}>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>

              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>

                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isRegistering ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-[#1B4332] focus:border-[#1B4332] block w-full pl-10 sm:text-sm border-gray-300 rounded-xl py-3 border bg-gray-50/50 transition-shadow focus:shadow-md"
                  placeholder="••••••••"
                />
              </div>
            </motion.div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <button
                  type="button"
                  onClick={handleToggleAuthMode}
                  className="font-medium text-[#1B4332] hover:text-[#2a6b50] transition-colors"
                >
                  {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                </button>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-[#1B4332] hover:bg-[#2a6b50] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B4332] transition-all group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Procesando...' : isRegistering ? 'Crear Cuenta' : 'Ingresar al Dashboard'}
                {!loading && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}