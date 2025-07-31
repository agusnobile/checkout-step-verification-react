export type FieldRule = {
  required?: boolean;
  minLength?: number;
  pattern?: RegExp;
  placeholder?: string;
};

// Reglas base aplicables a todos los países
const BASE_RULES = {
  name: { required: true, minLength: 2 },
  email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  address: { required: true, minLength: 5 },
  country: { required: true },
} as const satisfies Record<string, FieldRule>;

// Extensiones específicas por país
export const validationRulesByCountry = {
  DEFAULT: BASE_RULES,
  BR: {
    ...BASE_RULES,
    phone: {
      required: true,
      pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
      placeholder: '(11) 99999-9999',
    },
  },
  AR: {
    ...BASE_RULES,
    phone: {
      required: true,
      pattern: /^\+54\s\d{2}\s\d{4}-\d{4}$/,
      placeholder: '+54 11 9999-9999',
    },
  },
  MX: {
    ...BASE_RULES,
    phone: {
      required: true,
      pattern: /^\+52\s\d{3}\s\d{3}\s\d{4}$/,
      placeholder: '+52 555 123 4567',
    },
  },
} as const;

export type ValidationRules = typeof BASE_RULES;

/**
 * Devuelve las reglas de validación para el país indicado.
 * Si no hay reglas específicas, devuelve las reglas por defecto.
 */
export const getValidationRules = (country: string): ValidationRules => {
  const key = country as keyof typeof validationRulesByCountry;
  return (validationRulesByCountry[key] ?? validationRulesByCountry.DEFAULT) as ValidationRules;
}; 