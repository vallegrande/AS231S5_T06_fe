
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, MessageSquareDashed, Trash2, RotateCcw, FilePenLine, Trash, ListFilter, ListX } from "lucide-react";
import type { GeminiApiTest } from "@/types/backend";
import { cn } from "@/lib/utils";
import { ClientTimestamp } from "../common/ClientTimestamp";

interface QueryHistoryPanelProps {
  history: GeminiApiTest[] | undefined | null;
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
  
  const safeHistory: GeminiApiTest[] = Array.isArray(history) ? history : [];
  console.log('QueryHistoryPanel received history:', safeHistory);

  const [activeTab, setActiveTab] = useState<'active' | 'deleted'>('active');

  const getFilteredAndSortedHistory = (filterDeleted: boolean) => {
    return safeHistory
      .filter(item => item && item.id && item.deleted === filterDeleted)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const activeQueries = getFilteredAndSortedHistory(false);
  const deletedQueries = getFilteredAndSortedHistory(true);

  const renderHistoryList = (items: GeminiApiTest[], isDeletedList: boolean) => {
    if (items.length === 0) {
      return (
        <p className="text-sm text-muted-foreground text-center py-4 font-code">
          {isDeletedList ? "No hay consultas eliminadas." : "No hay consultas activas."}
        </p>
      );
    }

    return items.map((item) => (
      <div 
        key={item.id} 
        className={cn(
          "p-1.5 pixel-border hover:border-accent hover:shadow-pixel-accent flex flex-col group",
          item.deleted && "opacity-80 bg-muted/30 border-dashed"
        )}
      >
        <div className="flex items-center justify-between w-full">
          <Button
            variant="ghost"
            className={cn(
              "flex-grow justify-start text-left h-auto py-1 px-1 flex flex-col items-start text-sm",
              item.deleted && "line-through text-muted-foreground/70"
            )}
            onClick={() => !item.deleted && onLoadQuery(item)}
            disabled={item.deleted}
            title={item.deleted ? `Consulta eliminada: ${(item.prompt || '').substring(0,50)}...` :`Cargar consulta: ${(item.prompt || '').substring(0,50)}...`}
          >
            <div className="flex items-center w-full">
                <MessageSquareDashed className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="truncate font-code">{item.prompt || "Sin prompt"}</span>
            </div>
          </Button>
          
          {!item.deleted && (
            <div className="flex-shrink-0 ml-1 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 p-1.5 text-blue-500 hover:bg-blue-500/20 hover:text-blue-600"
                onClick={() => onLoadQuery(item)}
                title="Editar consulta (cargar en chat)"
              >
                <FilePenLine className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 p-1.5 text-orange-500 hover:bg-orange-500/20 hover:text-orange-600"
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
          {item.deleted && (
            <div className="flex-shrink-0 ml-1 space-x-1 opacity-100">
               <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 p-1.5 text-green-500 hover:bg-green-500/20 hover:text-green-600"
                onClick={() => onRestoreQueryItem(item.id)}
                title="Restaurar consulta"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 p-1.5 text-red-600 hover:bg-red-500/20 hover:text-red-700"
                onClick={() => onPermanentDeleteQueryItem(item.id)}
                title="Eliminar permanentemente"
              >
                <Trash className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    ));
  };

  return (
    <div className={cn("w-full md:w-2/5 flex-shrink-0 pixel-card flex flex-col h-full", className)} style={style}>
      <header className="p-3 border-b-2 border-foreground bg-card flex items-center justify-between">
        <div className="flex items-center">
          <History className="w-6 h-6 mr-2 text-primary" />
          <h2 className="text-xl font-headline text-primary">Historial de Consultas</h2>
        </div>
      </header>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'active' | 'deleted')} className="flex flex-col flex-grow">
        <TabsList className="pixel-tabs-list mx-2 mt-2 self-stretch">
          <TabsTrigger value="active" className="pixel-tabs-trigger flex-1 text-sm">
            <ListFilter className="w-4 h-4 mr-1.5" />
            Activas ({activeQueries.length})
          </TabsTrigger>
          <TabsTrigger value="deleted" className="pixel-tabs-trigger flex-1 text-sm">
            <ListX className="w-4 h-4 mr-1.5" />
            Eliminadas ({deletedQueries.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="flex-grow mt-0">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-2">
              {renderHistoryList(activeQueries, false)}
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="deleted" className="flex-grow mt-0">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-2">
              {renderHistoryList(deletedQueries, true)}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
