
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

export const useRideSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingOperations, setPendingOperations] = useState<PendingOperation[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Carregar operações pendentes do localStorage
    const saved = localStorage.getItem('pendingRideOperations');
    if (saved) {
      try {
        setPendingOperations(JSON.parse(saved));
      } catch (error) {
        console.error('Erro ao carregar operações pendentes:', error);
      }
    }

    // Listener para status de conexão
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Conexão restaurada. Sincronizando dados...');
      syncPendingOperations();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Sem conexão. Dados serão salvos localmente.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Salvar operações pendentes no localStorage
    localStorage.setItem('pendingRideOperations', JSON.stringify(pendingOperations));
  }, [pendingOperations]);

  const addPendingOperation = useCallback((operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retryCount'>) => {
    const newOperation: PendingOperation = {
      ...operation,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0
    };

    setPendingOperations(prev => [...prev, newOperation]);
    
    if (isOnline) {
      syncPendingOperations();
    }
  }, [isOnline]);

  const syncPendingOperations = useCallback(async () => {
    if (!isOnline || pendingOperations.length === 0 || isSyncing) {
      return;
    }

    setIsSyncing(true);
    let successCount = 0;
    let failureCount = 0;

    try {
      for (const operation of pendingOperations) {
        try {
          await executeOperation(operation);
          
          // Remover operação bem-sucedida
          setPendingOperations(prev => prev.filter(op => op.id !== operation.id));
          successCount++;
          
        } catch (error) {
          console.error(`Falha na sincronização da operação ${operation.id}:`, error);
          
          // Incrementar contador de retry
          setPendingOperations(prev => 
            prev.map(op => 
              op.id === operation.id 
                ? { ...op, retryCount: op.retryCount + 1 }
                : op
            )
          );
          
          failureCount++;
          
          // Remover operações com muitas tentativas
          if (operation.retryCount >= 3) {
            setPendingOperations(prev => prev.filter(op => op.id !== operation.id));
            console.error(`Operação ${operation.id} removida após 3 tentativas falharam`);
          }
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} operação(ões) sincronizada(s) com sucesso`);
      }
      
      if (failureCount > 0) {
        toast.warning(`${failureCount} operação(ões) falharam na sincronização`);
      }

    } catch (error) {
      console.error('Erro geral na sincronização:', error);
      toast.error('Erro na sincronização de dados');
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, pendingOperations, isSyncing]);

  const executeOperation = async (operation: PendingOperation) => {
    const { type, table, data } = operation;

    switch (type) {
      case 'create':
        const { error: createError } = await supabase
          .from(table as any)
          .insert(data);
        if (createError) throw createError;
        break;

      case 'update':
        const { error: updateError } = await supabase
          .from(table as any)
          .update(data.updates)
          .eq('id', data.id);
        if (updateError) throw updateError;
        break;

      case 'delete':
        const { error: deleteError } = await supabase
          .from(table as any)
          .delete()
          .eq('id', data.id);
        if (deleteError) throw deleteError;
        break;

      default:
        throw new Error(`Tipo de operação não suportado: ${type}`);
    }
  };

  const createRideOffline = useCallback((rideData: any) => {
    const offlineRide = {
      ...rideData,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending_sync',
      created_at: new Date().toISOString(),
      isOffline: true
    };

    // Salvar no localStorage para exibição imediata
    const savedRides = JSON.parse(localStorage.getItem('offlineRides') || '[]');
    savedRides.push(offlineRide);
    localStorage.setItem('offlineRides', JSON.stringify(savedRides));

    // Adicionar à fila de sincronização
    addPendingOperation({
      type: 'create',
      table: 'rides',
      data: { ...rideData, id: undefined } // Remover ID offline para o banco gerar um novo
    });

    toast.info('Corrida salva localmente. Será sincronizada quando conectar.');
    return offlineRide;
  }, [addPendingOperation]);

  const updateRideOffline = useCallback((rideId: string, updates: any) => {
    // Atualizar no localStorage se existir
    const savedRides = JSON.parse(localStorage.getItem('offlineRides') || '[]');
    const updatedRides = savedRides.map((ride: any) => 
      ride.id === rideId ? { ...ride, ...updates } : ride
    );
    localStorage.setItem('offlineRides', JSON.stringify(updatedRides));

    // Adicionar à fila de sincronização (apenas se não for um ID offline)
    if (!rideId.startsWith('offline_')) {
      addPendingOperation({
        type: 'update',
        table: 'rides',
        data: { id: rideId, updates }
      });
    }

    toast.info('Atualização salva localmente. Será sincronizada quando conectar.');
  }, [addPendingOperation]);

  const getOfflineRides = useCallback(() => {
    return JSON.parse(localStorage.getItem('offlineRides') || '[]');
  }, []);

  const clearOfflineData = useCallback(() => {
    localStorage.removeItem('offlineRides');
    localStorage.removeItem('pendingRideOperations');
    setPendingOperations([]);
    toast.success('Dados offline limpos');
  }, []);

  const forcSync = useCallback(() => {
    if (isOnline) {
      syncPendingOperations();
    } else {
      toast.error('Não é possível sincronizar sem conexão');
    }
  }, [isOnline, syncPendingOperations]);

  return {
    isOnline,
    isSyncing,
    pendingOperations: pendingOperations.length,
    createRideOffline,
    updateRideOffline,
    getOfflineRides,
    clearOfflineData,
    forcSync,
    syncPendingOperations
  };
};
