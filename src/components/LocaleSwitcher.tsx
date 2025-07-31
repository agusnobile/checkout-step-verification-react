import { useTranslations, getTestUrls } from '../utils/i18n';

export function LocaleSwitcher() {
  const { locale, currentLang } = useTranslations();
  const testUrls = getTestUrls();

  // Solo mostrar en desarrollo
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-white shadow-lg rounded-lg p-4 border z-50">
      <h3 className="text-sm font-bold mb-2">🌍 Probá el soporte para otros idiomas</h3>
      
      <div className="text-xs mb-2 text-gray-600">
        <strong>Actual:</strong> {locale.country} ({currentLang})
      </div>
      
      <div className="flex flex-col gap-1">
        <a 
          href={testUrls.argentina}
          className={`text-xs px-2 py-1 rounded transition ${
            locale.country === 'AR' 
              ? 'bg-blue-100 text-blue-800 border border-blue-300' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          🇦🇷 Argentina (ES)
        </a>
        
        <a 
          href={testUrls.brasil}
          className={`text-xs px-2 py-1 rounded transition ${
            locale.country === 'BR' 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          🇧🇷 Brasil (PT)
        </a>
        
        <a 
          href={testUrls.mexico}
          className={`text-xs px-2 py-1 rounded transition ${
            locale.country === 'MX' 
              ? 'bg-red-100 text-red-800 border border-red-300' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          🇲🇽 México (ES)
        </a>
      </div>
    </div>
  );
} 