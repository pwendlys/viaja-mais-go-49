
import { useState, useCallback } from 'react';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

interface FormErrors {
  [key: string]: string;
}

export const useFormValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = useState<FormErrors>({});

  const validateField = useCallback((name: string, value: any): string | null => {
    const rule = rules[name];
    if (!rule) return null;

    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return 'Este campo é obrigatório';
    }

    // Skip other validations if field is empty and not required
    if (!value && !rule.required) return null;

    // String-specific validations
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return `Mínimo de ${rule.minLength} caracteres`;
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        return `Máximo de ${rule.maxLength} caracteres`;
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        return 'Formato inválido';
      }
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  }, [rules]);

  const validate = useCallback((data: any): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(rules).forEach(fieldName => {
      const error = validateField(fieldName, data[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [rules, validateField]);

  const validateSingle = useCallback((name: string, value: any) => {
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error || ''
    }));
    return !error;
  }, [validateField]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearError = useCallback((name: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  const hasErrors = useCallback(() => {
    return Object.values(errors).some(error => error);
  }, [errors]);

  return {
    errors,
    validate,
    validateSingle,
    clearErrors,
    clearError,
    hasErrors
  };
};

// Common validation patterns
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^(?:\(?\d{2}\)?\s?)?(?:9\s?)?\d{4}-?\d{4}$/,
  cpf: /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/,
  cep: /^\d{5}-?\d{3}$/,
  licensePlate: /^[A-Z]{3}-?\d{4}$|^[A-Z]{3}\d[A-Z]\d{2}$/
};

// Common validation rules
export const commonRules = {
  required: { required: true },
  email: { 
    required: true, 
    pattern: validationPatterns.email 
  },
  phone: { 
    required: true, 
    pattern: validationPatterns.phone 
  },
  cpf: { 
    required: true, 
    pattern: validationPatterns.cpf 
  },
  password: { 
    required: true, 
    minLength: 6 
  },
  name: { 
    required: true, 
    minLength: 2, 
    maxLength: 100 
  }
};
