import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslations } from '../utils/i18n';

interface CheckoutState {
  referrer: string;
  token: string | null;
}

export default function Checkout() {
  const { t } = useTranslations();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as CheckoutState | null;

  if (!state) {
    // Si no hay data, volver al formulario
    navigate('/', { replace: true });
    return null;
  }

  const { referrer, token } = state;

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="flex flex-col items-center justify-center gap-4 bg-green-50 border border-green-300 rounded-xl p-6 shadow-inner w-full max-w-md">
        <span className="text-4xl">✅</span>
        <h3 className="text-2xl font-bold text-green-700">{t('feedback.title')}</h3>
        <div className="w-full text-left text-sm text-gray-700 space-y-1">
          <p>
            <strong>{t('feedback.referrer')}</strong>{' '}
            <span className="break-all">{referrer}</span>
          </p>
          <p>
            <strong>{t('feedback.captcha')}</strong>{' '}
            {token && (
              <span title={token} className="break-all">
                {token.slice(0, 20)}...
              </span>
            )}
          </p>
        </div>
      </div>
    </main>
  );
} 