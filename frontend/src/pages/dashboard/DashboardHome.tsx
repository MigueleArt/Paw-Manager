import React, { useState, useEffect } from 'react';
import { Calendar, Users, Activity, Clock } from 'lucide-react';
import { collection, onSnapshot, query, where, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';

export default function DashboardHome() {
  const { userData } = useAuth();

  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [petsCount, setPetsCount] = useState(0);
  const [rolesCount, setRolesCount] = useState(0);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);

  const [pendingCount, setPendingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    if (!userData?.clinicId) return;

    const clinicId = userData.clinicId;

    setCurrentDate(new Date().toLocaleString());

    const unsubAppts = onSnapshot(
      query(collection(db, 'appointments'), where('clinicId', '==', clinicId)),
      snapshot => setAppointmentsCount(snapshot.size)
    );

    const unsubPets = onSnapshot(
      query(collection(db, 'pets'), where('clinicId', '==', clinicId)),
      snapshot => setPetsCount(snapshot.size)
    );

    const unsubRoles = onSnapshot(
      query(collection(db, 'roles'), where('clinicId', '==', clinicId)),
      snapshot => setRolesCount(snapshot.size)
    );

    const unsubPending = onSnapshot(
      query(
        collection(db, 'appointments'),
        where('clinicId', '==', clinicId),
        where('status', '==', 'Pendiente')
      ),
      snapshot => setPendingCount(snapshot.size)
    );

    const unsubCompleted = onSnapshot(
      query(
        collection(db, 'appointments'),
        where('clinicId', '==', clinicId),
        where('status', '==', 'Completada')
      ),
      snapshot => setCompletedCount(snapshot.size)
    );

    const q = query(
      collection(db, 'appointments'),
      where('clinicId', '==', clinicId),
      where('status', '==', 'Pendiente'),
      limit(3)
    );

    const unsubUpcoming = onSnapshot(q, snapshot => {
      setUpcomingAppointments(
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );
    });

    return () => {
      unsubAppts();
      unsubPets();
      unsubRoles();
      unsubPending();
      unsubCompleted();
      unsubUpcoming();
    };
  }, [userData]);

  const stats = [
    {
      name: 'Citas Registradas',
      value: appointmentsCount,
      icon: Calendar,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      name: 'Pacientes Registrados',
      value: petsCount,
      icon: Activity,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      name: 'Personal (Roles)',
      value: rolesCount,
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    {
      name: 'Citas Pendientes',
      value: pendingCount,
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-100'
    }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Resumen de la Clínica
      </h1>

      {/* Bienvenida */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-8">
        <h2 className="font-bold text-[#1B4332] text-lg">
          Bienvenido {userData?.name || 'Usuario'}
        </h2>

        <p className="text-sm text-gray-600 mt-1">
          Última actualización: {currentDate}
        </p>

        <div className="mt-3 flex gap-6 text-sm">
          <span className="text-yellow-700 font-medium">
            Citas pendientes: {pendingCount}
          </span>

          <span className="text-green-700 font-medium">
            Citas completadas: {completedCount}
          </span>
        </div>
      </div>

      {/* Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center"
          >
            <div className={`${stat.bg} ${stat.color} p-4 rounded-xl mr-4`}>
              <stat.icon className="h-6 w-6" />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                {stat.name}
              </p>

              <p className="text-2xl font-semibold text-gray-900">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Próximas citas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Próximas Citas (Pendientes)
          </h2>

          <div className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No hay citas pendientes próximas.
              </p>
            ) : (
              upcomingAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                      🐾
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {apt.petName || apt.pet}
                      </p>

                      <p className="text-xs text-gray-500">
                        {apt.type} • Dr: {apt.doctor}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium text-[#1B4332]">
                      {apt.time}
                    </p>

                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Actividad Reciente
          </h2>

          <div className="space-y-4">

            <div className="flex items-start space-x-3">
              <div className="bg-green-100 text-green-600 p-2 rounded-full mt-1">
                <Activity className="h-4 w-4" />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900">
                  Actualización de Sistema
                </p>

                <p className="text-xs text-gray-500">
                  Conexión en tiempo real establecida bajo la arquitectura
                  multiclínica. Tus datos están 100% aislados y seguros.
                </p>
              </div>
            </div>

            {petsCount > 0 && (
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-full mt-1">
                  <Users className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Directorio Activo
                  </p>

                  <p className="text-xs text-gray-500">
                    Tu clínica cuenta actualmente con {petsCount} pacientes
                    registrados y {rolesCount} miembros del personal.
                  </p>
                </div>
              </div>
            )}

            {appointmentsCount > 0 && (
              <div className="flex items-start space-x-3">
                <div className="bg-purple-100 text-purple-600 p-2 rounded-full mt-1">
                  <Calendar className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Gestión de Agenda
                  </p>

                  <p className="text-xs text-gray-500">
                    Se han gestionado {appointmentsCount} citas a través de la
                    plataforma.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start space-x-3">
              <div className="bg-orange-100 text-orange-600 p-2 rounded-full mt-1">
                <Clock className="h-4 w-4" />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900">
                  Monitoreo en tiempo real
                </p>

                <p className="text-xs text-gray-500">
                  Los cambios realizados en citas y pacientes se sincronizan
                  automáticamente mediante Firebase.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}