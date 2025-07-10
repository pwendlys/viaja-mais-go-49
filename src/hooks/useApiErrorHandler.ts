
import { useCallback } from 'react';
import { toast } from 'sonner';

interface ApiError {
  message: string;
  code?: string | number;
  details?: any;
}

export const useApiErrorHandler = () => {
  const handleError = useCallback((error: any, context?: string) => {
    console.error(`API Error${context ? ` in ${context}` : ''}:`, error);

    let userMessage = 'Ocorreu um erro inesperado';
    
    // Handle different types of errors
    if (error?.message) {
      userMessage = error.message;
    } else if (typeof error === 'string') {
      userMessage = error;
    } else if (error?.error?.message) {
      userMessage = error.error.message;
    }

    // Handle specific error codes
    if (error?.code === 'PGRST301') {
      userMessage = 'Você não tem permissão para realizar esta ação';
    } else if (error?.code === 'PGRST116') {
      userMessage = 'Dados não encontrados';
    } else if (error?.message?.includes('JWT')) {
      userMessage = 'Sessão expirada. Faça login novamente';
    } else if (error?.message?.includes('Network')) {
      userMessage = 'Erro de conexão. Verifique sua internet';
    }

    // Show error toast
    toast.error(userMessage);

    return {
      message: userMessage,
      originalError: error
    };
  }, []);

  const handleSuccess = useCallback((message: string, data?: any) => {
    toast.success(message);
    return data;
  }, []);

  const handleWarning = useCallback((message: string) => {
    toast.warning(message);
  }, []);

  const handleInfo = useCallback((message: string) => {
    toast.info(message);
  }, []);

  return {
    handleError,
    handleSuccess,
    handleWarning,
    handleInfo
  };
};
