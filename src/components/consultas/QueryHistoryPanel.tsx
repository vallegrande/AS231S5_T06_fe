
"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, MessageSquareDashed, Trash2, RotateCcw } from "lucide-react";
import type { ChatEntry } from "./ChatInterface";
import { cn } from "@/lib/utils";

interface QueryHistoryPanelProps {
  history: ChatEntry[];
  onLoadQuery: (query: ChatEntry) => void;
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
  
  // Display user queries; active ones first, then inactive ones.
  const userQueries = history.filter(entry => entry.type === 'user')
                            .sort((a, b) => (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0) || new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className={cn("w-full md:w-80 flex-shrink-0 pixel-card flex flex-col h-full", className)} style={style}>
      <header className="p-3 border-b-2 border-foreground bg-card flex items-center">
        <History className="w-6 h-6 mr-2 text-primary" />
        <h2 className="text-xl font-headline text-primary">Historial de Consultas</h2>
      </header>
      <ScrollArea className="flex-grow">
        <div className="p-3 space-y-2">
          {userQueries.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4 font-code">No hay consultas recientes.</p>
          )}
          {userQueries.map((entry) => (
            <div 
              key={entry.id} 
              className={cn(
                "flex items-center justify-between p-1.5 pixel-border-ghost hover:border-accent hover:shadow-pixel-accent",
                !entry.isActive && "opacity-60 bg-muted/30"
              )}
            >
              <Button
                variant="ghost"
                className={cn(
                  "flex-grow justify-start text-left h-auto py-1 px-1",
                  !entry.isActive && "line-through"
                )}
                onClick={() => onLoadQuery(entry)}
                title={`Cargar consulta: ${entry.text.substring(0,50)}...`}
              >
                <MessageSquareDashed className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate text-sm font-code">{entry.text}</span>
              </Button>
              <div className="flex-shrink-0 ml-1 space-x-1">
                {entry.isActive ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-1 text-destructive hover:bg-destructive/20 hover:text-destructive-foreground"
                    onClick={() => onSoftDeleteQueryItem(entry.id)}
                    title="Eliminar consulta (lóg.)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-1 text-green-600 hover:bg-green-500/20 hover:text-green-700"
                    onClick={() => onRestoreQueryItem(entry.id)}
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
