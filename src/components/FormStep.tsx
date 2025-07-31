import { useEffect, useState, useMemo, useRef } from 'react';
import { useUserData } from '../hooks/useUserData';
import { useCountries } from '../hooks/useCountries';
import { useTranslations } from '../utils/i18n';
import { getValidationRules } from '../config/validationRules';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Captcha } from './Captcha';
import { FormData } from '../types/form';

// Hook para debounce de validaciones (como sugiere el documento de arquitectura)
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Validaciones inline como sugiere el documento
interface FormErrors {
  name?: string;
  email?: string;
  address?: string;
  country?: string;
}

export function FormStep() {
  const { t, locale } = useTranslations();
  
  const validationRules = useMemo(() => getValidationRules(locale.country), [locale.country]);

  // validateField function removed - using inline validation in useEffect to avoid dependency issues
  const { userData, loading } = useUserData();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    address: '',
    country: '',
    captchaVerified: false,
  });

  const { countries, loading: loadingCountries, defaultCountry } = useCountries();
  const [searchParams] = useSearchParams();
  const referrer = searchParams.get('referrer') || '/dashboard';
  const token = searchParams.get('token') || 'default-token';
  const [isValidParams, setIsValidParams] = useState(true);

  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const navigate = useNavigate();

  // Estados para validaciones en tiempo real
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Ref para controlar si ya se hizo la pre-selección inicial
  const hasPreselectedCountry = useRef(false);
  
  // debounce para optimizar validaciones
  const debouncedFormData = useDebounce(formData, 300);

  useEffect(() => {
    if (!referrer.startsWith('/') || !token) {
      console.warn('Parámetros inválidos en la URL');
      setIsValidParams(false);
    }
  }, [referrer, token]);

  useEffect(() => {
    if (userData) {
      setFormData(userData);
      hasPreselectedCountry.current = true; // Marcar que ya tenemos datos de usuario
      const { name, email, address, country } = userData;
      if (name && email && address && country) {
        setShowCaptcha(true);
      }
    }
  }, [userData]);

  // preselect country once
  useEffect(() => {
    if (defaultCountry && !userData && !hasPreselectedCountry.current) {
      setFormData(prev => ({ ...prev, country: defaultCountry }));
      hasPreselectedCountry.current = true;
    }
  }, [defaultCountry, userData]); // Sin formData.country en dependencias

  // realtime validations (debounced)
  useEffect(() => {
    const newErrors: FormErrors = {};
    
    Object.keys(debouncedFormData).forEach((key) => {
      if (touched[key] && key !== 'captchaVerified') {
        // Inline validation logic to avoid callback dependencies
        const value = debouncedFormData[key as keyof FormData] as string;
        const rules = validationRules[key as keyof typeof validationRules] as any;
        
        let error: string | undefined;
        
        if (rules?.required && !value.trim()) {
          error = t('validation.required');
        } else {
          switch (key) {
            case 'name':
              if (rules?.minLength && value.trim().length < rules.minLength) {
                error = t('validation.min_length', { min: rules.minLength.toString() });
              }
              break;
            case 'email':
              if (rules?.pattern && !rules.pattern.test(value)) {
                error = t('validation.invalid_email');
              }
              break;
            case 'address':
              if (rules?.minLength && value.trim().length < rules.minLength) {
                error = t('validation.min_length', { min: rules.minLength.toString() });
              }
              break;
          }
        }
        
        if (error) {
          newErrors[key as keyof FormErrors] = error;
        }
      }
    });
    
    setErrors(newErrors);
  }, [debouncedFormData, touched, validationRules, t]); // Dependencias específicas y estables

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Marcar como touched solo si no estaba ya marcado (evitar re-renders innecesarios)
    setTouched(prev => prev[name] ? prev : { ...prev, [name]: true });
    
    setFormData(prev => ({ ...prev, [name]: value }));
    if (!showCaptcha) {
      setShowCaptcha(true);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    // Solo actualizar si no estaba ya marcado como touched
    setTouched(prev => prev[name] ? prev : { ...prev, [name]: true });
  };

  const isFormComplete = (): boolean => {
    const { name, email, address, country } = formData;
    const hasNoErrors = Object.keys(errors).length === 0;
    const allFieldsFilled = !!(name && email && address && country && captchaToken);
    return hasNoErrors && allFieldsFilled;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormComplete()) return;

    const finalRef = referrer || 'https://www.mercadolibre.com.ar/';
    navigate('/checkout', { state: { referrer: finalRef, token: captchaToken } });
  };

  if (!isValidParams) {
    return (
      <div className="text-center text-red-600 mt-10">
        <p>Error: La URL no contiene los parámetros necesarios.</p>
        <p>Por favor, accede desde un flujo válido.</p>
      </div>
    );
  }

  if (loading) {
    return <p className="text-center mt-10">{t('messages.loading')}</p>;
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">{t('verify.title')}</h2>
        {/* Form remains; feedback handled in /checkout route */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 font-medium">{t('form.fullname')}</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block mb-1 font-medium">{t('form.email')}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block mb-1 font-medium">País</label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.country ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loadingCountries}
            >
              <option value="">Selecciona un país</option>
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
            {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
          </div>

          <div>
            <label className="block mb-1 font-medium">{t('form.address')}</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>

          <div className="min-h-[100px] flex items-center justify-center">
            <Captcha 
              onVerified={(token) => setCaptchaToken(token)} 
              shouldLoad={showCaptcha}
            />
          </div>

          <div className="flex justify-between gap-4 pt-2">
            <button
              type="button"
              className="w-1/2 py-2 rounded bg-red-400 text-white hover:bg-red-500"
              onClick={() => {
                const fallback = 'https://www.mercadolibre.com.ar/';
                window.location.href = referrer || fallback;
              }}
            >
              {t('buttons.back') || 'Volver'}
            </button>

            <button
              type="submit"
              className={`w-1/2 py-2 rounded font-semibold transition disabled:cursor-not-allowed ${
                isFormComplete() 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-400 text-gray-200'
              }`}
              disabled={!isFormComplete()}
            >
              {t('buttons.confirm') || 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
