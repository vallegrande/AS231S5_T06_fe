
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Card puede ser reemplazado o estilizado
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { History, MessageSquareDashed } from "lucide-react";
import type { ChatEntry } from "./ChatInterface";
import { cn } from "@/lib/utils";

interface QueryHistoryPanelProps {
  history: ChatEntry[];
  onLoadQuery: (query: ChatEntry) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function QueryHistoryPanel({ history, onLoadQuery, className, style }: QueryHistoryPanelProps) {
  const userQueries = history.filter(entry => entry.type === 'user');

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
            <Button
              key={entry.id}
              variant="ghost"
              className="w-full justify-start text-left h-auto py-2 px-2 pixel-button-ghost hover:border-accent hover:shadow-pixel-accent"
              onClick={() => onLoadQuery(entry)}
              title={`Cargar consulta: ${entry.text.substring(0,50)}...`}
            >
              <MessageSquareDashed className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate text-sm font-code">{entry.text}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
