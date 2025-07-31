import { useState, useEffect } from 'react';
import { Country } from '../types/country';

import { detectLocale } from '../utils/i18n';

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [defaultCountry, setDefaultCountry] = useState<string>('');

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const locale = detectLocale();
        setDefaultCountry(locale.country);
        
        // Usar la región detectada para filtrar países relevantes
        const res = await fetch(`http://localhost:3000/api/meli-countries?region=${locale.region}`);
        if (!res.ok) throw new Error('Error al cargar países');

        const data: Country[] = await res.json();
        setCountries(data);
      } catch (error) {
        console.error('Error cargando países:', error);
        // Fallback: cargar todos los países si falla
        try {
          const res = await fetch('http://localhost:3000/api/meli-countries');
          if (res.ok) {
            const data: Country[] = await res.json();
            setCountries(data);
          }
        } catch (fallbackError) {
          console.error('Error en fallback:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return { countries, loading, defaultCountry };
}
