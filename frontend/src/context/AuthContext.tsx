import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface UserRoleData {
  clinicId?: string;
  role?: string;
  name?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  userData: UserRoleData | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, userData: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserRoleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let roleUnsubscribe: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const q = query(collection(db, 'roles'), where('uid', '==', currentUser.uid));
          roleUnsubscribe = onSnapshot(q, (querySnapshot) => {
            if (!querySnapshot.empty) {
              setUserData(querySnapshot.docs[0].data() as UserRoleData);
            } else {
              setUserData(null);
            }
            setLoading(false);
          });
        } catch (error) {
          console.error("Error fetching user role data", error);
          setLoading(false);
        }
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (roleUnsubscribe) {
        roleUnsubscribe();
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
