import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PawPrint, Lock, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '../lib/firebase';

type Status = 'checking' | 'valid' | 'invalid' | 'success';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get('oobCode');

  const [status, setStatus] = useState<Status>('checking');
  const [email, setEmail] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!oobCode) {
      setStatus('invalid');
      return;
    }
    verifyPasswordResetCode(auth, oobCode)
      .then((verifiedEmail) => {
        setEmail(verifiedEmail);
        setStatus('valid');
      })
      .catch(() => {
        setStatus('invalid');
      });
  }, [oobCode]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode as string, newPassword);
      setStatus('success');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/expired-action-code') {
        setError('Este enlace ha expirado. Solicita uno nuevo desde la pantalla de login.');
      } else if (err.code === 'auth/invalid-action-code') {
        setError('Este enlace ya fue usado o no es válido. Solicita uno nuevo.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña es demasiado débil. Usa al menos 6 caracteres.');
      } else {
        setError('Ocurrió un error al restablecer tu contraseña. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F0] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <button
        onClick={() => navigate('/login')}
        className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center text-gray-500 hover:text-[#1B4332] transition-colors font-medium text-sm bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 shadow-sm hover:shadow-md"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver al login
      </button>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="mx-auto h-16 w-16 bg-[#1B4332] rounded-2xl flex items-center justify-center shadow-lg">
          <PawPrint className="h-10 w-10 text-[#E9C46A] -rotate-3" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[#1B4332]">
          Restablecer contraseña
        </h2>
      </div>

      <div className="mt-8 mx-4 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-white/90 backdrop-blur-md py-8 px-4 shadow-2xl shadow-[#1B4332]/10 sm:rounded-3xl sm:px-10 border border-white">

          {status === 'checking' && (
            <p className="text-center text-gray-600 py-4">Verificando enlace...</p>
          )}

          {status === 'invalid' && (
            <div className="text-center space-y-4 py-2">
              <AlertTriangle className="h-12 w-12 text-red-400 mx-auto" />
              <p className="text-gray-700">
                Este enlace de recuperación no es válido o ya expiró.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-[#1B4332] text-white p-3 rounded-xl font-bold hover:bg-[#2a6b50] transition-colors"
              >
                Solicitar un nuevo enlace
              </button>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center space-y-4 py-2">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
              <p className="text-gray-700">
                Tu contraseña se actualizó correctamente.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-[#1B4332] text-white p-3 rounded-xl font-bold hover:bg-[#2a6b50] transition-colors"
              >
                Ir a iniciar sesión
              </button>
            </div>
          )}

          {status === 'valid' && (
            <form className="space-y-6" onSubmit={handleReset}>
              <p className="text-sm text-gray-600 text-center">
                Define una nueva contraseña para <span className="font-semibold">{email}</span>
              </p>

              {error && (
                <div className="bg-red-50 p-3 rounded-xl border border-red-200 flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  Nueva contraseña
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="focus:ring-[#1B4332] focus:border-[#1B4332] block w-full pl-10 sm:text-sm border-gray-300 rounded-xl py-3 border bg-gray-50/50"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar contraseña
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="focus:ring-[#1B4332] focus:border-[#1B4332] block w-full pl-10 sm:text-sm border-gray-300 rounded-xl py-3 border bg-gray-50/50"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-[#1B4332] hover:bg-[#2a6b50] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B4332] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}