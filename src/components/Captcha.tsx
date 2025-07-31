import { useRef, useState, useEffect, ReactNode } from 'react';
import { useTranslations } from '../utils/i18n';

interface CaptchaProps {
  onVerified: (token: string | null) => void;
  shouldLoad?: boolean; // Nuevo prop para controlar cuándo cargar
}

export function Captcha({ onVerified, shouldLoad = false }: CaptchaProps) {
  const { t } = useTranslations();
  const recaptchaRef = useRef<any>(null);
  const [ReCAPTCHAComponent, setReCAPTCHAComponent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // lazy-load del bundle de reCAPTCHA sólo cuando debe mostrarse
  useEffect(() => {
    if (!shouldLoad || ReCAPTCHAComponent || isLoading) return;

    setIsLoading(true);
    setLoadError(false);
    
    // Cargar dinámicamente react-google-recaptcha solo cuando se necesite
    import('react-google-recaptcha')
      .then(({ default: ReCAPTCHA }) => {
        setReCAPTCHAComponent(() => ReCAPTCHA);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error loading reCAPTCHA:', error);
        setLoadError(true);
        setIsLoading(false);
      });
  }, [shouldLoad, ReCAPTCHAComponent, isLoading]);

  const handleChange = (token: string | null) => {
    onVerified(token);
  };

  type CaptchaState = 'idle' | 'loading' | 'error' | 'ready';

  const state: CaptchaState = !shouldLoad
    ? 'idle'
    : loadError
    ? 'error'
    : ReCAPTCHAComponent
    ? 'ready'
    : 'loading';

  const views: Record<CaptchaState, ReactNode> = {
    idle: (
      <div className="border border-gray-300 rounded p-4 bg-gray-50">
        <p className="text-sm text-gray-500">{t('captcha.will_load')}</p>
      </div>
    ),
    loading: (
      <div className="border border-gray-300 rounded p-4 bg-gray-50">
        <p className="mb-2 text-sm text-gray-600">{t('captcha.loading')}</p>
        <div className="animate-pulse bg-gray-300 h-20 rounded" />
      </div>
    ),
    error: (
      <div className="border border-gray-300 rounded p-4 bg-gray-50">
        <p className="text-sm text-red-500">{t('captcha.error')}</p>
      </div>
    ),
    ready: ReCAPTCHAComponent ? (
      <div className="border border-gray-300 rounded p-4 bg-gray-50">
        <p className="mb-2 text-sm text-gray-600">{t('captcha.verify')}</p>
        <ReCAPTCHAComponent
          ref={recaptchaRef}
          sitekey="6Ld-qSgrAAAAAKJBgoRh93tejrGuu3pmeuEczuZj"
          onChange={handleChange}
        />
      </div>
    ) : null,
  };

  return views[state];
}
