import { Request, Response, NextFunction } from 'express';

export interface Locale {
  country: string;
  lang: string;
  region: string;
}

// Middleware para detectar locale en el servidor como sugiere el documento de arquitectura
export function detectLocaleMiddleware(req: Request, res: Response, next: NextFunction) {
  // Detectar desde query parameters (localhost)
  const countryParam = req.query.country as string;
  const langParam = req.query.lang as string;
  
  let locale: Locale;
  
  if (countryParam && langParam) {
    locale = {
      country: countryParam.toUpperCase(),
      lang: langParam,
      region: getRegionByCountry(countryParam.toUpperCase())
    };
  } else {
    // Detectar desde hostname (producción)
    const hostname = req.hostname;
    
    if (hostname.includes('mercadolivre.com.br') || hostname.includes('brasil')) {
      locale = { country: 'BR', lang: 'pt-BR', region: 'LATAM' };
    } else if (hostname.includes('mercadolibre.com.ar') || hostname.includes('argentina')) {
      locale = { country: 'AR', lang: 'es-AR', region: 'LATAM' };
    } else if (hostname.includes('mercadolibre.com.mx') || hostname.includes('mexico')) {
      locale = { country: 'MX', lang: 'es-MX', region: 'LATAM' };
    } else {
      // Fallback
      locale = { country: 'AR', lang: 'es-AR', region: 'LATAM' };
    }
  }
  
  // Agregar locale al objeto request
  (req as any).locale = locale;
  
  next();
}

function getRegionByCountry(country: string): string {
  const regionMap: Record<string, string> = {
    'AR': 'LATAM',
    'BR': 'LATAM', 
    'MX': 'LATAM',
    'CO': 'LATAM',
    'CL': 'LATAM',
    'PE': 'LATAM',
    'UY': 'LATAM',
    'ES': 'EUROPE',
    'IT': 'EUROPE',
    'FR': 'EUROPE',
    'DE': 'EUROPE',
    'US': 'NORTH_AMERICA',
    'CA': 'NORTH_AMERICA'
  };
  return regionMap[country] || 'LATAM';
}

// Función para obtener traducciones del servidor
export function getServerTranslations(locale: Locale) {
  // En un caso real, esto cargaría archivos JSON como en el cliente
  const translations: Record<string, any> = {
    'es-AR': {
      title: 'Estamos casi listos...',
      subtitle: 'Actualiza tus datos de contacto',
      loading: 'Cargando...'
    },
    'pt-BR': {
      title: 'Estamos quase prontos...',
      subtitle: 'Atualize seus dados de contato',
      loading: 'Carregando...'
    },
    'es-MX': {
      title: 'Ya casi terminamos...',
      subtitle: 'Actualiza tus datos de contacto', 
      loading: 'Cargando...'
    }
  };
  
  return translations[locale.lang] || translations['es-AR'];
} 