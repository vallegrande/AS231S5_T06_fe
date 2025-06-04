
"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Trash2, ArrowRightToLine, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { ClientTimestamp } from "@/components/common/ClientTimestamp";

export interface TranslationRecord {
  id: string;
  originalText: string;
  translatedText: string;
  languageFrom: string; 
  languageTo: string;   
  timestamp: Date;
}

interface TranslationHistoryPanelProps {
  history: TranslationRecord[];
  onClearHistory: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function TranslationHistoryPanel({ history, onClearHistory, className, style }: TranslationHistoryPanelProps) {
  return (
    <div className={cn("w-full md:w-96 flex-shrink-0 pixel-card flex flex-col h-full", className)} style={style}>
      <header className="p-3 border-b-2 border-foreground bg-card flex flex-row justify-between items-center">
        <div className="flex items-center">
          <History className="w-6 h-6 mr-2 text-primary" />
          <h2 className="text-xl font-headline text-primary">Historial</h2>
        </div>
        {history.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearHistory} 
            className="pixel-button-ghost text-destructive hover:bg-destructive/20 hover:text-destructive-foreground hover:border-destructive-foreground p-1.5"
            title="Limpiar Historial"
          >
            <Trash2 className="w-4 h-4" />
            <span className="sr-only">Limpiar Historial</span>
          </Button>
        )}
      </header>
      <ScrollArea className="flex-grow">
        <div className="p-3 space-y-2">
          {history.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4 font-code">No hay traducciones recientes.</p>
          )}
          {history.map((record) => (
            <div key={record.id} className="p-2.5 pixel-border bg-background/50 text-xs font-code shadow-pixel-foreground/30 animate-fade-in">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-medium text-accent flex items-center">
                  {record.languageFrom} <ArrowRightToLine className="inline w-3.5 h-3.5 mx-1.5 text-muted-foreground" /> {record.languageTo}
                </span>
                <ClientTimestamp date={record.timestamp} className="text-muted-foreground text-xs" />
              </div>
              <div className="space-y-1">
                <p className="text-text-primary break-words">
                  <strong className="text-muted-foreground">Original:</strong> {record.originalText.substring(0, 70)}{record.originalText.length > 70 ? "..." : ""}
                </p>
                <p className="text-primary break-words">
                  <strong className="text-muted-foreground">Traducción:</strong> {record.translatedText.substring(0, 70)}{record.translatedText.length > 70 ? "..." : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
