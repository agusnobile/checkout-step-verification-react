import { useState, useEffect } from 'react';
import { UserData } from '../types/user';

export function useUserData() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        const response = await fetch('http://localhost:3000/api/meli-users');
        if (!response.ok) throw new Error('Error al obtener usuario');

        const data: UserData = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return { userData, loading };
}
