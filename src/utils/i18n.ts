// Internationalisation helpers
import esAR from '../i18n/es-AR.json';
import ptBR from '../i18n/pt-BR.json';
import esMX from '../i18n/es-MX.json';

export interface Locale {
  country: string;
  lang: string;
  region: string;
}

export type SupportedLang = 'es-AR' | 'pt-BR' | 'es-MX';

const translations = {
  'es-AR': esAR,
  'pt-BR': ptBR,
  'es-MX': esMX,
} as const;

// Locale detection strategy
export function detectLocale(): Locale {
  // server-side fallback
  if (typeof window === 'undefined') {
    return { country: 'AR', lang: 'es-AR', region: 'LATAM' };
  }
  
  const urlParams = new URLSearchParams(window.location.search);
  const countryParam = urlParams.get('country');
  const langParam = urlParams.get('lang');
  
  // 1. explicit query params
  if (countryParam && langParam) {
    return {
      country: countryParam.toUpperCase(),
      lang: langParam as SupportedLang,
      region: getRegionByCountry(countryParam.toUpperCase())
    };
  }
  
  // 2. hostname hints
  const hostname = window.location.hostname;
  
  if (hostname.includes('mercadolivre.com.br') || hostname.includes('brasil')) {
    return { country: 'BR', lang: 'pt-BR', region: 'LATAM' };
  }
  if (hostname.includes('mercadolibre.com.ar') || hostname.includes('argentina')) {
    return { country: 'AR', lang: 'es-AR', region: 'LATAM' };
  }
  if (hostname.includes('mercadolibre.com.mx') || hostname.includes('mexico')) {
    return { country: 'MX', lang: 'es-MX', region: 'LATAM' };
  }
  
  // 3. browser locale
  const browserLang = navigator.language;
  if (browserLang.startsWith('pt')) {
    return { country: 'BR', lang: 'pt-BR', region: 'LATAM' };
  }
  if (browserLang.startsWith('es')) {
    // Determinar si es México o Argentina por otros factores
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone.includes('Mexico')) {
      return { country: 'MX', lang: 'es-MX', region: 'LATAM' };
    }
    return { country: 'AR', lang: 'es-AR', region: 'LATAM' };
  }
  
  // default fallback
  return { country: 'AR', lang: 'es-AR', region: 'LATAM' };
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

// simple memoisation
let cachedLocale: Locale | null = null;
let cachedTranslations: any = null;
let cachedGetText: ((key: string, variables?: Record<string, string | number>) => string) | null = null;

// Hook para usar traducciones con interpolación
export function useTranslations() {
  // Detectar locale solo si no está cached o si cambió
  const currentLocale = typeof window !== 'undefined' ? detectLocale() : { country: 'AR', lang: 'es-AR', region: 'LATAM' };
  
  // Solo recrear si el locale cambió
  if (!cachedLocale || cachedLocale.lang !== currentLocale.lang) {
    cachedLocale = currentLocale;
    cachedTranslations = translations[currentLocale.lang as SupportedLang] || translations['es-AR'];
    
    // Crear función getText estable
    cachedGetText = (key: string, variables?: Record<string, string | number>): string => {
      const keys = key.split('.');
      let value: any = cachedTranslations;
      
      for (const k of keys) {
        value = value?.[k];
        if (value === undefined) {
          console.warn(`Translation key not found: ${key}`);
          return key;
        }
      }
      
      if (typeof value !== 'string') {
        console.warn(`Translation value is not a string: ${key}`);
        return key;
      }

      // variable interpolation
      if (variables) {
        return value.replace(/\{(\w+)\}/g, (match, varName) => {
          return variables[varName]?.toString() || match;
        });
      }
      
      return value;
    };
  }

  return {
    t: cachedGetText!,
    locale: cachedLocale!,
    currentLang: cachedLocale!.lang,
    isRTL: false // Ninguno de nuestros idiomas es RTL
  };
}

// Función legacy para compatibilidad (será reemplazada gradualmente)
export function getTranslations() {
  const { t } = useTranslations();
  
  return {
    title: t('verify.title'),
    name: t('form.fullname'),
    email: t('form.email'),
    address: t('form.address'),
    confirm: t('buttons.confirm'),
    loading: t('buttons.loading')
  };
}

// validation rules moved to src/config/validationRules

// Formateo específico por región
export function formatPhoneNumber(phone: string, locale: Locale): string {
  const cleanPhone = phone.replace(/\D/g, '');
  
  switch (locale.country) {
    case 'BR':
      if (cleanPhone.length === 11) {
        return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 7)}-${cleanPhone.slice(7)}`;
      }
      break;
    case 'AR':
      if (cleanPhone.length >= 10) {
        return `+54 ${cleanPhone.slice(0, 2)} ${cleanPhone.slice(2, 6)}-${cleanPhone.slice(6)}`;
      }
      break;
    case 'MX':
      if (cleanPhone.length === 10) {
        return `+52 ${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6)}`;
      }
      break;
  }
  
  return phone; // Return original if no format matches
}

// URLs para testing local con diferentes países
export function getTestUrls() {
  const baseUrl = window.location.origin;
  
  return {
    argentina: `${baseUrl}?country=AR&lang=es-AR`,
    brasil: `${baseUrl}?country=BR&lang=pt-BR`,
    mexico: `${baseUrl}?country=MX&lang=es-MX`,
  };
}
