
"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, MessageSquareDashed, Trash2, RotateCcw, FilePenLine, Trash } from "lucide-react";
import type { GeminiApiTest } from "@/types/backend";
import { cn } from "@/lib/utils";
import { ClientTimestamp } from "../common/ClientTimestamp";

interface QueryHistoryPanelProps {
  history: GeminiApiTest[] | undefined | null; // Allow undefined/null for robustness
  onLoadQuery: (item: GeminiApiTest) => void;
  onSoftDeleteQueryItem: (id: string) => void;
  onRestoreQueryItem: (id: string) => void;
  onPermanentDeleteQueryItem: (id: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function QueryHistoryPanel({ 
  history, 
  onLoadQuery, 
  onSoftDeleteQueryItem, 
  onRestoreQueryItem,
  onPermanentDeleteQueryItem,
  className, 
  style 
}: QueryHistoryPanelProps) {
  
  // Ensure history is an array before performing array operations
  const safeHistory: GeminiApiTest[] = Array.isArray(history) ? history : [];
  console.log('QueryHistoryPanel received history:', safeHistory);


  const sortedHistory = [...safeHistory].sort((a, b) => {
    if (a.deleted === b.deleted) {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
    return a.deleted ? 1 : -1; // Non-deleted items first
  });

  return (
    <div className={cn("w-full md:w-2/5 flex-shrink-0 pixel-card flex flex-col h-full", className)} style={style}>
      <header className="p-3 border-b-2 border-foreground bg-card flex items-center">
        <History className="w-6 h-6 mr-2 text-primary" />
        <h2 className="text-xl font-headline text-primary">Historial de Consultas</h2>
      </header>
      <ScrollArea className="flex-grow min-h-[100px]">
        <div className="p-3 space-y-2">
          {sortedHistory.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4 font-code">No hay consultas recientes.</p>
          )}
          {sortedHistory
            .filter(item => item && item.id) 
            .map((item) => (
            <div 
              key={item.id} 
              className={cn(
                "p-1.5 pixel-border hover:border-accent hover:shadow-pixel-accent flex flex-col group",
                item.deleted && "opacity-70 bg-muted/30"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <Button
                  variant="ghost"
                  className={cn(
                    "flex-grow justify-start text-left h-auto py-1 px-1 flex flex-col items-start text-sm",
                    item.deleted && "line-through"
                  )}
                  onClick={() => !item.deleted && onLoadQuery(item)} // Only allow load if not deleted
                  disabled={item.deleted} // Disable button if deleted
                  title={item.deleted ? `Consulta eliminada: ${(item.prompt || '').substring(0,50)}...` :`Cargar consulta: ${(item.prompt || '').substring(0,50)}...`}
                >
                  <div className="flex items-center w-full">
                      <MessageSquareDashed className="w-5 h-5 mr-2 flex-shrink-0" />
                      <span className="truncate font-code">{item.prompt || "Sin prompt"}</span>
                  </div>
                </Button>
                {/* Action buttons for active items */}
                {!item.deleted && (
                  <div className="flex-shrink-0 ml-1 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 p-1.5 text-blue-600 hover:bg-blue-500/20 hover:text-blue-700"
                      onClick={() => onLoadQuery(item)}
                      title="Editar consulta (cargar en chat)"
                    >
                      <FilePenLine className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 p-1.5 text-orange-600 hover:bg-orange-500/20 hover:text-orange-700"
                      onClick={() => onSoftDeleteQueryItem(item.id)}
                      title="Eliminar consulta (lógicamente)"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center w-full mt-1 pl-1">
                <ClientTimestamp date={new Date(item.timestamp)} className="text-xs text-muted-foreground/80 self-start" />
                {/* Action buttons for logically deleted items - NOW ALWAYS VISIBLE */}
                {item.deleted && (
                  <div className="flex-shrink-0 ml-1 space-x-1">
                     <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 p-1.5 text-green-600 hover:bg-green-500/20 hover:text-green-700"
                      onClick={() => onRestoreQueryItem(item.id)}
                      title="Restaurar consulta"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 p-1.5 text-red-700 hover:bg-red-500/20 hover:text-red-800"
                      onClick={() => onPermanentDeleteQueryItem(item.id)}
                      title="Eliminar permanentemente"
                    >
                      <Trash className="w-5 h-5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
