
"use client";

import { TranslationForm } from "./TranslationForm";
import { TranslationHistoryPanel } from "./TranslationHistoryPanel";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getTranslationHistory, 
  softDeleteTranslationHistoryItem, 
  restoreTranslationHistoryItem,
  clearTranslationHistory
} from '@/lib/backend-api-client';
import type { BackendTranslationRecord } from '@/types/backend';
import { Languages, History, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export function TraductorSection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: translationHistory = [], isLoading: isLoadingHistory, error: historyError, refetch: refetchHistory } = useQuery<BackendTranslationRecord[], Error>({
    queryKey: ['translationHistory'],
    queryFn: getTranslationHistory,
  });

  useEffect(() => {
    if (historyError) {
      toast({ title: "Error al Cargar Historial de Traducción", description: historyError.message, variant: "destructive"});
    }
  }, [historyError, toast]);

  const handleNewTranslationCompleted = () => {
    refetchHistory();
  };

  const clearHistoryMutation = useMutation({
    mutationFn: clearTranslationHistory,
    onSuccess: () => {
      toast({ title: "Historial Limpiado", description: "Todo el historial de traducciones ha sido eliminado." });
      queryClient.invalidateQueries({ queryKey: ['translationHistory'] });
    },
    onError: (error) => {
      toast({ title: "Error al Limpiar Historial", description: error.message, variant: "destructive" });
    }
  });

  const softDeleteMutation = useMutation({
    mutationFn: softDeleteTranslationHistoryItem,
    onSuccess: () => {
      toast({ title: "Traducción Eliminada", description: "La traducción ha sido marcada como eliminada." });
      queryClient.invalidateQueries({ queryKey: ['translationHistory'] });
    },
    onError: (error) => {
      toast({ title: "Error al Eliminar", description: error.message, variant: "destructive" });
    }
  });

  const restoreMutation = useMutation({
    mutationFn: restoreTranslationHistoryItem,
    onSuccess: () => {
      toast({ title: "Traducción Restaurada", description: "La traducción ha sido restaurada." });
      queryClient.invalidateQueries({ queryKey: ['translationHistory'] });
    },
    onError: (error) => {
      toast({ title: "Error al Restaurar", description: error.message, variant: "destructive" });
    }
  });

  const handleClearHistory = () => {
    clearHistoryMutation.mutate();
  };

  const handleSoftDeleteTranslationRecord = (id: string) => {
    softDeleteMutation.mutate(id);
  };

  const handleRestoreTranslationRecord = (id: string) => {
    restoreMutation.mutate(id);
  };
  
  return (
    <div className="flex flex-col md:flex-row gap-3 md:gap-4 h-full">
      <div className="flex-grow-[2] flex flex-col pixel-card overflow-hidden animate-slide-in-up">
        <header className="p-3 border-b-2 border-foreground bg-card flex items-center">
          <Languages className="w-6 h-6 mr-2 text-primary" />
          <h2 className="text-xl font-headline text-primary">Traductor con IA</h2>
        </header>
        <div className="p-3 flex-grow">
          <TranslationForm onNewTranslationCompleted={handleNewTranslationCompleted} />
        </div>
      </div>

      {isLoadingHistory && 
        <div className="md:w-96 flex items-center justify-center pixel-card p-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mr-2"/> 
          <span className="font-headline text-lg">Cargando Historial...</span>
        </div>
      }
      {!isLoadingHistory &&
        <TranslationHistoryPanel 
          history={translationHistory} 
          onClearHistory={handleClearHistory} 
          onSoftDeleteTranslationRecord={handleSoftDeleteTranslationRecord}
          onRestoreTranslationRecord={handleRestoreTranslationRecord}
          className="md:w-96 animate-slide-in-up md:animate-fade-in"
          style={{ animationDelay: '0.1s' }}
          isClearingHistory={clearHistoryMutation.isPending}
        />
      }
    </div>
  );
}
