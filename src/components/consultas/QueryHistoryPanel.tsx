
"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, MessageSquareDashed, Trash2, RotateCcw } from "lucide-react";
import type { GeminiApiTest } from "@/types/backend";
import { cn } from "@/lib/utils";
import { ClientTimestamp } from "../common/ClientTimestamp";


interface QueryHistoryPanelProps {
  history: GeminiApiTest[];
  onLoadQuery: (item: GeminiApiTest) => void;
  onSoftDeleteQueryItem: (id: string) => void;
  onRestoreQueryItem: (id: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function QueryHistoryPanel({ 
  history, 
  onLoadQuery, 
  onSoftDeleteQueryItem, 
  onRestoreQueryItem, 
  className, 
  style 
}: QueryHistoryPanelProps) {
  
  const sortedHistory = [...history].sort((a, b) => {
    if (a.deleted === b.deleted) {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
    return a.deleted ? 1 : -1; // Non-deleted items first
  });

  return (
    <div className={cn("w-full md:w-80 flex-shrink-0 pixel-card flex flex-col h-full", className)} style={style}>
      <header className="p-3 border-b-2 border-foreground bg-card flex items-center">
        <History className="w-6 h-6 mr-2 text-primary" />
        <h2 className="text-xl font-headline text-primary">Historial de Consultas</h2>
      </header>
      <ScrollArea className="flex-grow">
        <div className="p-3 space-y-2">
          {sortedHistory.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4 font-code">No hay consultas recientes.</p>
          )}
          {sortedHistory.map((item) => (
            <div 
              key={item.id} 
              className={cn(
                "flex items-center justify-between p-1.5 pixel-border-ghost hover:border-accent hover:shadow-pixel-accent",
                item.deleted && "opacity-60 bg-muted/30"
              )}
            >
              <Button
                variant="ghost"
                className={cn(
                  "flex-grow justify-start text-left h-auto py-1 px-1 flex flex-col items-start",
                  item.deleted && "line-through"
                )}
                onClick={() => onLoadQuery(item)}
                title={`Cargar consulta: ${(item.prompt || '').substring(0,50)}...`}
              >
                <div className="flex items-center w-full">
                    <MessageSquareDashed className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate text-sm font-code">{item.prompt || "Sin prompt"}</span>
                </div>
                <ClientTimestamp date={new Date(item.timestamp)} className="text-xs text-muted-foreground/80 self-start ml-6" />

              </Button>
              <div className="flex-shrink-0 ml-1 space-x-1">
                {!item.deleted ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-1 text-destructive hover:bg-destructive/20 hover:text-destructive-foreground"
                    onClick={() => onSoftDeleteQueryItem(item.id)}
                    title="Eliminar consulta (lóg.)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-1 text-green-600 hover:bg-green-500/20 hover:text-green-700"
                    onClick={() => onRestoreQueryItem(item.id)}
                    title="Restaurar consulta"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
