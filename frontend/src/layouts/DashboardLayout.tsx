import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Dog, Calendar, LogOut, PawPrint, Bell, Search, Menu, X } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Listen to pending appointments for notifications
    const q = query(collection(db, 'appointments'), where('status', '==', 'Pendiente'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPendingCount(snapshot.size);
    });
    return () => unsubscribe();
  }, []);

  const navigation = [
    { name: 'Inicio', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Citas', href: '/dashboard/appointments', icon: Calendar },
    { name: 'Pacientes', href: '/dashboard/pets', icon: Dog },
    { name: 'Personal (Roles)', href: '/dashboard/roles', icon: Users },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`w-64 bg-[#1B4332] text-white flex flex-col fixed inset-y-0 z-50 transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#2a6b50]/50 shrink-0">
          <div className="flex items-center">
            <PawPrint className="h-8 w-8 text-[#E9C46A] mr-3" />
            <span className="text-xl font-bold tracking-tight text-white">PawManager</span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-gray-300 hover:text-white p-1">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/dashboard'}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-[#E9C46A] text-[#1B4332] shadow-md'
                    : 'text-gray-300 hover:bg-[#2a6b50] hover:text-white'
                }`
              }
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#2a6b50]/50">
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-3 py-3 text-sm font-medium rounded-xl text-red-300 hover:bg-red-900/30 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 md:ml-64 flex flex-col w-full min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10">
          <div className="flex-1 flex items-center">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden mr-4 text-gray-500 hover:text-[#1B4332] p-1 rounded-lg">
              <Menu className="h-6 w-6" />
            </button>
            <div className="relative w-full max-w-md hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#1B4332] focus:border-[#1B4332] sm:text-sm transition-colors"
                placeholder="Buscar paciente, cliente o cita..."
              />
            </div>
          </div>
          <div className="ml-4 flex items-center space-x-2 sm:space-x-4">
            
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-400 hover:text-gray-500 relative transition-colors"
              >
                <Bell className="h-6 w-6" />
                {pendingCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-50">
                    <h3 className="text-sm font-bold text-gray-900">Notificaciones</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {pendingCount > 0 ? (
                      <div className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50" onClick={() => {navigate('/dashboard/appointments'); setShowNotifications(false);}}>
                        <p className="text-sm font-medium text-gray-900">Tienes {pendingCount} cita(s) pendiente(s)</p>
                        <p className="text-xs text-gray-500 mt-1">Revisa tu agenda para confirmar asistencias o atender pacientes en espera.</p>
                      </div>
                    ) : (
                      <div className="px-4 py-6 text-center text-gray-500">
                        <p className="text-sm">Todo al día. No hay notificaciones nuevas.</p>
                      </div>
                    )}
                    <div className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
                      <p className="text-sm font-medium text-gray-900">¡Bienvenido a PawManager!</p>
                      <p className="text-xs text-gray-500 mt-1">El sistema está conectado exitosamente a tu base de datos en la nube.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3 border-l border-gray-200 pl-4">
              <div className="h-9 w-9 rounded-full bg-[#1B4332] text-white flex items-center justify-center font-bold text-sm uppercase">
                {user?.email?.charAt(0) || 'U'}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-700">
                  {user?.email?.includes('jmiguel') || user?.email?.includes('admin') 
                    ? 'Administrador' 
                    : user?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-8 overflow-y-auto bg-gray-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
