
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface ErrorHandler {
  retryCount: number;
  maxRetries: number;
  lastError?: Error;
  isRetrying: boolean;
}

interface RetryOptions {
  maxRetries?: number;
  delay?: number;
  exponentialBackoff?: boolean;
  onRetry?: (attempt: number) => void;
  onMaxRetriesReached?: (error: Error) => void;
}

export const useRideErrorHandling = () => {
  const [errorHandlers, setErrorHandlers] = useState<Map<string, ErrorHandler>>(new Map());

  const executeWithRetry = useCallback(async <T>(
    operationId: string,
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> => {
    const {
      maxRetries = 3,
      delay = 1000,
      exponentialBackoff = true,
      onRetry,
      onMaxRetriesReached
    } = options;

    let handler = errorHandlers.get(operationId) || {
      retryCount: 0,
      maxRetries,
      isRetrying: false
    };

    const updateHandler = (updates: Partial<ErrorHandler>) => {
      handler = { ...handler, ...updates };
      setErrorHandlers(prev => new Map(prev.set(operationId, handler)));
    };

    const executeAttempt = async (attempt: number): Promise<T> => {
      try {
        updateHandler({ isRetrying: attempt > 1 });
        
        const result = await operation();
        
        // Sucesso - limpar handler
        setErrorHandlers(prev => {
          const newMap = new Map(prev);
          newMap.delete(operationId);
          return newMap;
        });
        
        return result;
      } catch (error) {
        console.error(`Tentativa ${attempt} falhou para ${operationId}:`, error);
        
        updateHandler({ 
          lastError: error as Error, 
          retryCount: attempt,
          isRetrying: false 
        });

        if (attempt >= maxRetries) {
          if (onMaxRetriesReached) {
            onMaxRetriesReached(error as Error);
          }
          
          toast.error(`Falha na operação ${operationId} após ${maxRetries} tentativas`);
          throw error;
        }

        // Calcular delay
        const currentDelay = exponentialBackoff 
          ? delay * Math.pow(2, attempt - 1)
          : delay;

        if (onRetry) {
          onRetry(attempt);
        }

        toast.warning(`Tentativa ${attempt} falhou. Tentando novamente em ${currentDelay/1000}s...`);

        // Aguardar antes da próxima tentativa
        await new Promise(resolve => setTimeout(resolve, currentDelay));
        
        return executeAttempt(attempt + 1);
      }
    };

    return executeAttempt(1);
  }, [errorHandlers]);

  const handleGeolocationError = useCallback((error: GeolocationPositionError) => {
    let message = 'Erro desconhecido de geolocalização';
    let action = '';

    switch (error.code) {
      case error.PERMISSION_DENIED:
        message = 'Permissão de localização negada';
        action = 'Permita o acesso à localização nas configurações do navegador';
        break;
      case error.POSITION_UNAVAILABLE:
        message = 'Localização não disponível';
        action = 'Verifique se o GPS está habilitado e tente novamente';
        break;
      case error.TIMEOUT:
        message = 'Timeout na obtenção da localização';
        action = 'Tente novamente ou informe o endereço manualmente';
        break;
    }

    toast.error(`${message}. ${action}`);
    
    // Log para debug
    console.error('Geolocation error:', {
      code: error.code,
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }, []);

  const handleNetworkError = useCallback((error: Error, context: string) => {
    if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
      toast.error('Erro de conexão. Verifique sua internet e tente novamente.');
      
      // Tentar operação offline se aplicável
      if (context.includes('ride')) {
        toast.info('Dados salvos localmente. Sincronização automática quando conectar.');
      }
    } else {
      toast.error(`Erro em ${context}: ${error.message}`);
    }

    console.error(`Network error in ${context}:`, error);
  }, []);

  const handleSupabaseError = useCallback((error: any, context: string) => {
    let userMessage = 'Erro no servidor';

    // Mapear códigos de erro específicos do Supabase
    if (error.code === '23505') {
      userMessage = 'Registro duplicado';
    } else if (error.code === '23503') {
      userMessage = 'Referência inválida';
    } else if (error.code === '42501') {
      userMessage = 'Permissão negada';
    } else if (error.message?.includes('JWT')) {
      userMessage = 'Sessão expirada. Faça login novamente';
    } else if (error.message?.includes('Row Level Security')) {
      userMessage = 'Acesso não autorizado';
    }

    toast.error(`${userMessage} em ${context}`);
    
    console.error(`Supabase error in ${context}:`, {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
  }, []);

  const createRollbackHandler = useCallback(<T>(
    operation: () => Promise<T>,
    rollback: () => Promise<void>,
    operationName: string
  ) => {
    return async (): Promise<T> => {
      try {
        const result = await operation();
        return result;
      } catch (error) {
        console.error(`Falha em ${operationName}, executando rollback:`, error);
        
        try {
          await rollback();
          toast.info(`${operationName} foi revertida devido a erro`);
        } catch (rollbackError) {
          console.error('Falha no rollback:', rollbackError);
          toast.error('Erro crítico: falha na reversão da operação');
        }
        
        throw error;
      }
    };
  }, []);

  const logError = useCallback((error: Error, context: string, additionalData?: any) => {
    const errorLog = {
      timestamp: new Date().toISOString(),
      context,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      additionalData,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error('Error logged:', errorLog);
    
    // Em produção, enviar para serviço de monitoramento
    // Como Sentry, LogRocket, etc.
  }, []);

  const getErrorHandler = useCallback((operationId: string): ErrorHandler | undefined => {
    return errorHandlers.get(operationId);
  }, [errorHandlers]);

  const clearErrorHandler = useCallback((operationId: string) => {
    setErrorHandlers(prev => {
      const newMap = new Map(prev);
      newMap.delete(operationId);
      return newMap;
    });
  }, []);

  return {
    executeWithRetry,
    handleGeolocationError,
    handleNetworkError,
    handleSupabaseError,
    createRollbackHandler,
    logError,
    getErrorHandler,
    clearErrorHandler,
    isRetrying: (operationId: string) => errorHandlers.get(operationId)?.isRetrying || false
  };
};
