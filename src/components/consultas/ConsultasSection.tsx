
"use client";

import { ChatInterface } from "./ChatInterface";
import { QueryHistoryPanel } from "./QueryHistoryPanel";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getGeminiHistory, 
  softDeleteGeminiHistoryItem, 
  restoreGeminiHistoryItem,
  permanentlyDeleteGeminiHistoryItem 
} from '@/lib/backend-api-client';
import type { GeminiApiTest } from "@/types/backend";
import { MessageSquare, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ConsultasSection() {
  const [selectedQueryText, setSelectedQueryText] = useState<string | null>(null);
  const [itemToPermanentlyDeleteId, setItemToPermanentlyDeleteId] = useState<string | null>(null);
  const [isConfirmPermanentDeleteDialogOpen, setIsConfirmPermanentDeleteDialogOpen] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: queryHistory = [], isLoading: isLoadingHistory, error: historyError, refetch: refetchHistory } = useQuery<GeminiApiTest[], Error>({
    queryKey: ['geminiHistory'],
    queryFn: getGeminiHistory,
    // initialData: [], // Consider removing if you want loading state to show, or keep for optimistic UI
  });

  useEffect(() => {
    console.log('ConsultasSection: queryHistory from useQuery hook updated. Data:', queryHistory, 'IsLoading:', isLoadingHistory, 'Error:', historyError);
    if (historyError) {
      toast({ 
        title: "Error al Cargar Historial de Consultas", 
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
  }, [queryHistory, isLoadingHistory, historyError, toast]);


  const softDeleteMutation = useMutation({
    mutationFn: softDeleteGeminiHistoryItem,
    onSuccess: () => {
      toast({ title: "Consulta Eliminada", description: "La consulta ha sido marcada como eliminada." });
      queryClient.invalidateQueries({ queryKey: ['geminiHistory'] });
    },
    onError: (error) => {
      toast({ title: "Error al Eliminar", description: error.message, variant: "destructive" });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: restoreGeminiHistoryItem,
    onSuccess: () => {
      toast({ title: "Consulta Restaurada", description: "La consulta ha sido restaurada." });
      queryClient.invalidateQueries({ queryKey: ['geminiHistory'] });
    },
    onError: (error) => {
      toast({ title: "Error al Restaurar", description: error.message, variant: "destructive" });
    },
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: permanentlyDeleteGeminiHistoryItem,
    onSuccess: () => {
      toast({ title: "Consulta Eliminada Permanentemente", description: "La consulta ha sido eliminada de la base de datos." });
      queryClient.invalidateQueries({ queryKey: ['geminiHistory'] });
      setItemToPermanentlyDeleteId(null);
    },
    onError: (error) => {
      toast({ title: "Error en Eliminación Permanente", description: error.message, variant: "destructive" });
      setItemToPermanentlyDeleteId(null);
    },
  });

  const handleQuerySubmitted = () => {
    refetchHistory(); 
  };
  
  const handleLoadQuery = (item: GeminiApiTest) => {
    setSelectedQueryText(item.prompt);
  };

  const handleSoftDeleteQueryItem = (id: string) => {
    softDeleteMutation.mutate(id);
  };

  const handleRestoreQueryItem = (id: string) => {
    restoreMutation.mutate(id);
  };

  const handleRequestPermanentDelete = (id: string) => {
    setItemToPermanentlyDeleteId(id);
    setIsConfirmPermanentDeleteDialogOpen(true);
  };

  const confirmPermanentDelete = () => {
    if (itemToPermanentlyDeleteId) {
      permanentDeleteMutation.mutate(itemToPermanentlyDeleteId);
    }
    setIsConfirmPermanentDeleteDialogOpen(false);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 h-full">
        <div className="md:w-2/5 w-full flex flex-col pixel-card overflow-hidden animate-slide-in-up">
          <header className="p-3 border-b-2 border-foreground bg-card flex items-center">
            <MessageSquare className="w-6 h-6 mr-2 text-primary" />
            <h2 className="text-xl font-headline text-primary">Asistente Virtual Gemini</h2>
          </header>
          <div className="p-0 flex-grow flex flex-col overflow-hidden">
            {historyError ? (
              <div className="p-4 text-center text-destructive-foreground bg-destructive/80 pixel-border border-destructive-foreground flex-grow flex flex-col items-center justify-center">
                <p className="font-headline text-lg mb-2">Error al cargar el historial de consultas</p>
                <p className="text-sm">{historyError.message}</p>
                <p className="text-xs mt-2">Consulta la consola del navegador para más detalles.</p>
              </div>
            ) : (
              <ChatInterface 
                onQuerySubmittedAndResponded={handleQuerySubmitted}
                loadQueryText={selectedQueryText}
                clearLoadedQueryText={() => setSelectedQueryText(null)}
              />
            )}
          </div>
        </div>
        
        {isLoadingHistory && !historyError &&
          <div className="md:w-3/5 w-full flex items-center justify-center pixel-card p-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary mr-2"/> 
            <span className="font-headline text-lg">Cargando Historial...</span>
          </div>
        }
        {!isLoadingHistory && !historyError &&
          <QueryHistoryPanel 
            history={queryHistory} 
            onLoadQuery={handleLoadQuery} 
            onSoftDeleteQueryItem={handleSoftDeleteQueryItem}
            onRestoreQueryItem={handleRestoreQueryItem}
            onPermanentDeleteQueryItem={handleRequestPermanentDelete}
            className="md:w-3/5 w-full animate-slide-in-up md:animate-fade-in"
            style={{ animationDelay: '0.1s' }}
          />
        }
        {/* Fallback for history error state for the panel width */}
        {historyError && !isLoadingHistory && (
           <div className="md:w-3/5 w-full flex items-center justify-center pixel-card p-4 bg-destructive/10 border-destructive">
            <span className="font-headline text-lg text-destructive">Error en Historial</span>
          </div>
        )}

      </div>

      <AlertDialog open={isConfirmPermanentDeleteDialogOpen} onOpenChange={setIsConfirmPermanentDeleteDialogOpen}>
        <AlertDialogContent className="pixel-border bg-background shadow-pixel-primary">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-primary">Confirmar Eliminación Permanente</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar esta consulta permanentemente? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setIsConfirmPermanentDeleteDialogOpen(false);
                setItemToPermanentlyDeleteId(null);
              }}
              className="pixel-border hover:bg-muted/50 active:translate-x-[1px] active:translate-y-[1px]"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmPermanentDelete} 
              disabled={permanentDeleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 pixel-border border-destructive-foreground shadow-[2px_2px_0px_hsl(var(--destructive-foreground))] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            >
              {permanentDeleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Eliminar Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
