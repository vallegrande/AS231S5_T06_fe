
"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Trash2, ArrowRightToLine, RotateCcw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ClientTimestamp } from "@/components/common/ClientTimestamp";
import type { BackendTranslationRecord } from "@/types/backend";

interface TranslationHistoryPanelProps {
  history: BackendTranslationRecord[];
  onClearHistory: () => void;
  onSoftDeleteTranslationRecord: (id: string) => void;
  onRestoreTranslationRecord: (id: string) => void;
  className?: string;
  style?: React.CSSProperties;
  isClearingHistory?: boolean;
}

export function TranslationHistoryPanel({
  history = [], // Ensure history is always an array
  onClearHistory,
  onSoftDeleteTranslationRecord,
  onRestoreTranslationRecord,
  className,
  style,
  isClearingHistory = false,
}: TranslationHistoryPanelProps) {

  const sortedHistory = [...history].sort((a, b) => {
     if (a.deleted === b.deleted) {
      // Ensure createdAt exists before trying to parse it
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    }
    return a.deleted ? 1 : -1; // Non-deleted items first
  });

  const activeItemsCount = history.filter(r => r && !r.deleted).length;

  return (
    <div className={cn("w-full md:w-96 flex-shrink-0 pixel-card flex flex-col h-full", className)} style={style}>
      <header className="p-3 border-b-2 border-foreground bg-card flex flex-row justify-between items-center">
        <div className="flex items-center">
          <History className="w-6 h-6 mr-2 text-primary" />
          <h2 className="text-xl font-headline text-primary">Historial</h2>
        </div>
        {activeItemsCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearHistory}
            className="pixel-button-ghost text-destructive hover:bg-destructive/20 hover:text-destructive-foreground hover:border-destructive-foreground p-1.5"
            title="Limpiar Historial (elementos activos)"
            disabled={isClearingHistory}
          >
            {isClearingHistory ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            <span className="sr-only">Limpiar Historial</span>
          </Button>
        )}
      </header>
      <ScrollArea className="flex-grow">
        <div className="p-3 space-y-2">
          {sortedHistory.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4 font-code">No hay traducciones recientes.</p>
          )}
          {sortedHistory
            .filter(record => record && record.id) // Filter out records with no id
            .map((record) => (
            <div
              key={record.id}
              className={cn(
                "p-2.5 pixel-border bg-background/50 text-xs font-code shadow-pixel-foreground/30 animate-fade-in",
                record.deleted && "opacity-60"
              )}
            >
              <div className="flex justify-between items-start mb-1.5">
                <div className={cn(record.deleted && "line-through")}>
                  <span className="font-medium text-accent flex items-center">
                    {(record.sourceLanguage || 'N/A').toUpperCase()} <ArrowRightToLine className="inline w-3.5 h-3.5 mx-1.5 text-muted-foreground" /> {(record.targetLanguage || 'N/A').toUpperCase()}
                  </span>
                  <ClientTimestamp date={new Date(record.createdAt)} className="text-muted-foreground text-xs" />
                </div>
                <div className="flex-shrink-0 ml-1 space-x-1">
                  {!record.deleted ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 p-1 text-destructive hover:bg-destructive/20 hover:text-destructive-foreground"
                      onClick={() => onSoftDeleteTranslationRecord(record.id)}
                      title="Eliminar traducción (lóg.)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 p-1 text-green-600 hover:bg-green-500/20 hover:text-green-700"
                      onClick={() => onRestoreTranslationRecord(record.id)}
                      title="Restaurar traducción"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
              <div className={cn("space-y-1", record.deleted && "line-through")}>
                <p className="text-text-primary break-words">
                  <strong className="text-muted-foreground">Original:</strong> {(record.sourceText || '').substring(0, 70)}{(record.sourceText || '').length > 70 ? "..." : ""}
                </p>
                <p className="text-primary break-words">
                  <strong className="text-muted-foreground">Traducción:</strong> {(record.translatedText || '').substring(0, 70)}{(record.translatedText || '').length > 70 ? "..." : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
