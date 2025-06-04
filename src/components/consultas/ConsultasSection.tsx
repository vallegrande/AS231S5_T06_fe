
"use client";

import { ChatInterface } from "./ChatInterface";
import { QueryHistoryPanel } from "./QueryHistoryPanel";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGeminiHistory, softDeleteGeminiHistoryItem, restoreGeminiHistoryItem } from '@/lib/backend-api-client';
import type { GeminiApiTest } from "@/types/backend";
import { PanelLeft, MessageSquare, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ConsultasSection() {
  const [selectedQueryText, setSelectedQueryText] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: queryHistory = [], isLoading: isLoadingHistory, error: historyError, refetch: refetchHistory } = useQuery<GeminiApiTest[], Error>({
    queryKey: ['geminiHistory'],
    queryFn: getGeminiHistory,
  });

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

  const handleQuerySubmitted = () => {
    refetchHistory(); // Refetch history after a new query is made
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

  if (historyError) {
    toast({ title: "Error al Cargar Historial", description: historyError.message, variant: "destructive"});
  }

  return (
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
          className="md:w-96 animate-slide-in-up md:animate-fade-in"
          style={{ animationDelay: '0.1s' }}
        />
      }
    </div>
  );
}
