"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { History, Trash2, ArrowRight } from "lucide-react";

export interface TranslationRecord {
  id: string;
  originalText: string;
  translatedText: string;
  languageFrom: string; // e.g., "Español (Detectado)"
  languageTo: string;   // e.g., "Inglés"
  timestamp: Date;
}

interface TranslationHistoryPanelProps {
  history: TranslationRecord[];
  onClearHistory: () => void;
}

export function TranslationHistoryPanel({ history, onClearHistory }: TranslationHistoryPanelProps) {
  return (
    <Card className="flex-grow flex flex-col border-panel-border bg-panel-bg shadow-lg h-full">
      <CardHeader className="p-3 border-b border-panel-border flex flex-row justify-between items-center">
        <CardTitle className="text-lg text-primary flex items-center">
          <History className="w-5 h-5 mr-2" />
          Historial de Traducciones
        </CardTitle>
      </CardHeader>
      <ScrollArea className="flex-grow">
        <CardContent className="p-3 space-y-2">
          {history.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No hay traducciones recientes.</p>
          )}
          {history.map((record) => (
            <div key={record.id} className="p-2 border border-panel-border rounded-md bg-gray-50 text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-text-secondary">
                  {record.languageFrom} <ArrowRight className="inline w-3 h-3 mx-1" /> {record.languageTo}
                </span>
                <span className="text-muted-foreground">
                  {record.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="mb-1 text-text-primary"><strong>Original:</strong> {record.originalText.substring(0, 100)}{record.originalText.length > 100 ? "..." : ""}</p>
              <p className="text-text-primary"><strong>Traducción:</strong> {record.translatedText.substring(0, 100)}{record.translatedText.length > 100 ? "..." : ""}</p>
            </div>
          ))}
        </CardContent>
      </ScrollArea>
      {history.length > 0 && (
        <CardFooter className="p-3 border-t border-panel-border">
          <Button variant="destructive" size="sm" onClick={onClearHistory} className="w-full bg-button-destructive-bg text-text-on-destructive-button hover:bg-button-destructive-bg/90">
            <Trash2 className="w-4 h-4 mr-2" />
            Limpiar Historial
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
