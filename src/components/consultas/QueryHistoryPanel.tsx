"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { History, MessageSquare } from "lucide-react";
import type { ChatEntry } from "./ChatInterface";

interface QueryHistoryPanelProps {
  history: ChatEntry[];
  onLoadQuery: (query: ChatEntry) => void;
}

export function QueryHistoryPanel({ history, onLoadQuery }: QueryHistoryPanelProps) {
  const userQueries = history.filter(entry => entry.type === 'user');

  return (
    <Card className="w-full md:w-80 flex-shrink-0 border-panel-border bg-panel-bg shadow-lg flex flex-col h-full">
      <CardHeader className="p-3 border-b border-panel-border">
        <CardTitle className="text-lg text-primary flex items-center">
          <History className="w-5 h-5 mr-2" />
          Historial de Consultas
        </CardTitle>
      </CardHeader>
      <ScrollArea className="flex-grow">
        <CardContent className="p-3 space-y-2">
          {userQueries.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No hay consultas recientes.</p>
          )}
          {userQueries.map((entry) => (
            <Button
              key={entry.id}
              variant="ghost"
              className="w-full justify-start text-left h-auto py-2 px-2 border border-transparent hover:border-accent hover:bg-accent/10"
              onClick={() => onLoadQuery(entry)}
              title={`Cargar consulta: ${entry.text.substring(0,50)}...`}
            >
              <MessageSquare className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate text-sm">{entry.text}</span>
            </Button>
          ))}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
