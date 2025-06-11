
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
    // initialData: [], // Consider removing if you want loading state to show
  });

  useEffect(() => {
    console.log('TraductorSection: translationHistory from useQuery hook updated. Data:', translationHistory, 'IsLoading:', isLoadingHistory, 'Error:', historyError);
    if (historyError) {
      toast({ 
        title: "Error al Cargar Historial de Traducción", 
        description: (
          <div className="text-xs w-full overflow-auto max-h-40">
            <p>Detalles del error:</p>
            <pre className="mt-2 whitespace-pre-wrap bg-muted p-2 pixel-border border-destructive/50">
              {historyError.message}
            </pre>
          </div>
        ),
        variant: "destructive",
        duration: 10000 // Show for longer
      });
    }
  }, [translationHistory, isLoadingHistory, historyError, toast]);

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
      <div className="md:w-3/5 w-full flex flex-col pixel-card overflow-hidden animate-slide-in-up">
        <header className="p-3 border-b-2 border-foreground bg-card flex items-center">
          <Languages className="w-6 h-6 mr-2 text-primary" />
          <h2 className="text-xl font-headline text-primary">Traductor con IA</h2>
        </header>
        <div className="p-3 flex-grow">
          {historyError ? (
            <div className="p-4 text-center text-destructive-foreground bg-destructive/80 pixel-border border-destructive-foreground flex-grow flex flex-col items-center justify-center h-full">
              <p className="font-headline text-lg mb-2">Error al cargar el historial de traducciones</p>
              <p className="text-sm">{historyError.message}</p>
              <p className="text-xs mt-2">Consulta la consola del navegador para más detalles.</p>
            </div>
          ) : (
            <TranslationForm onNewTranslationCompleted={handleNewTranslationCompleted} />
          )}
        </div>
      </div>

      {isLoadingHistory && !historyError &&
        <div className="md:w-2/5 w-full flex items-center justify-center pixel-card p-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mr-2"/> 
          <span className="font-headline text-lg">Cargando Historial...</span>
        </div>
      }
      {!isLoadingHistory && !historyError &&
        <TranslationHistoryPanel 
          history={translationHistory} 
          onClearHistory={handleClearHistory} 
          onSoftDeleteTranslationRecord={handleSoftDeleteTranslationRecord}
          onRestoreTranslationRecord={handleRestoreTranslationRecord}
          className="md:w-2/5 w-full animate-slide-in-up md:animate-fade-in"
          style={{ animationDelay: '0.1s' }}
          isClearingHistory={clearHistoryMutation.isPending}
        />
      }
      {/* Fallback for history error state for the panel width */}
      {historyError && !isLoadingHistory && (
         <div className="md:w-2/5 w-full flex items-center justify-center pixel-card p-4 bg-destructive/10 border-destructive">
          <span className="font-headline text-lg text-destructive">Error en Historial</span>
        </div>
      )}
    </div>
  );
}
