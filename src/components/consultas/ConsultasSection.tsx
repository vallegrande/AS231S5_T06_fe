
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
  });

  useEffect(() => {
    if (historyError) {
      toast({ title: "Error al Cargar Historial de Consultas", description: historyError.message, variant: "destructive"});
    }
  }, [historyError, toast]);

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
        <div className="flex-grow-[3] flex flex-col pixel-card overflow-hidden animate-slide-in-up">
          <header className="p-3 border-b-2 border-foreground bg-card flex items-center">
            <MessageSquare className="w-6 h-6 mr-2 text-primary" />
            <h2 className="text-xl font-headline text-primary">Asistente Virtual Gemini</h2>
          </header>
          <div className="p-0 flex-grow flex flex-col overflow-hidden">
            <ChatInterface 
              onQuerySubmittedAndResponded={handleQuerySubmitted}
              loadQueryText={selectedQueryText}
              clearLoadedQueryText={() => setSelectedQueryText(null)}
            />
          </div>
        </div>
        
        {isLoadingHistory && 
          <div className="md:w-96 flex items-center justify-center pixel-card p-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary mr-2"/> 
            <span className="font-headline text-lg">Cargando Historial...</span>
          </div>
        }
        {!isLoadingHistory &&
          <QueryHistoryPanel 
            history={queryHistory} 
            onLoadQuery={handleLoadQuery} 
            onSoftDeleteQueryItem={handleSoftDeleteQueryItem}
            onRestoreQueryItem={handleRestoreQueryItem}
            onPermanentDeleteQueryItem={handleRequestPermanentDelete}
            className="md:w-96 animate-slide-in-up md:animate-fade-in"
            style={{ animationDelay: '0.1s' }}
          />
        }
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
