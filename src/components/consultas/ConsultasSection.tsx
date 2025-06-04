
"use client";

import { ChatInterface } from "./ChatInterface";
import { QueryHistoryPanel } from "./QueryHistoryPanel";
import { useState } from "react";
import type { ChatEntry } from "./ChatInterface";
import { PanelLeft, MessageSquare } from "lucide-react";

export function ConsultasSection() {
  const [queryHistory, setQueryHistory] = useState<ChatEntry[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<ChatEntry | null>(null);

  const handleNewQueryResponse = (query: string, response: string) => {
    const newUserEntry: ChatEntry = { 
      id: Date.now().toString(), 
      type: 'user', 
      text: query, 
      timestamp: new Date(),
      isActive: true,
    };
    const newAiEntry: ChatEntry = { 
      id: (Date.now() + 1).toString(), 
      type: 'ai', 
      text: response, 
      timestamp: new Date(),
      isActive: true,
    };
    // Keep all entries, including soft-deleted ones, up to a limit.
    // History panel will filter/style based on isActive.
    setQueryHistory(prev => [newUserEntry, newAiEntry, ...prev.slice(0, 48)]); // e.g. last 25 interactions (50 entries)
  };
  
  const handleLoadQuery = (query: ChatEntry) => {
    setSelectedQuery(query);
  };

  const handleSoftDeleteQueryItem = (id: string) => {
    setQueryHistory(prev => prev.map(item => item.id === id ? { ...item, isActive: false } : item));
  };

  const handleRestoreQueryItem = (id: string) => {
    setQueryHistory(prev => prev.map(item => item.id === id ? { ...item, isActive: true } : item));
  };

  return (
    <div className="flex flex-col md:flex-row gap-3 md:gap-4 h-full">
      {/* Panel de Chat Principal */}
      <div className="flex-grow-[3] flex flex-col pixel-card overflow-hidden animate-slide-in-up">
        <header className="p-3 border-b-2 border-foreground bg-card flex items-center">
          <MessageSquare className="w-6 h-6 mr-2 text-primary" />
          <h2 className="text-xl font-headline text-primary">Asistente Virtual Gemini</h2>
        </header>
        <div className="p-0 flex-grow flex flex-col overflow-hidden">
          <ChatInterface 
            onNewQueryResponse={handleNewQueryResponse}
            loadQuery={selectedQuery}
            clearLoadedQuery={() => setSelectedQuery(null)}
          />
        </div>
      </div>
      
      {/* Panel de Historial de Consultas */}
      <QueryHistoryPanel 
        history={queryHistory} 
        onLoadQuery={handleLoadQuery} 
        onSoftDeleteQueryItem={handleSoftDeleteQueryItem}
        onRestoreQueryItem={handleRestoreQueryItem}
        className="md:w-96 animate-slide-in-up md:animate-fade-in"
        style={{ animationDelay: '0.1s' }}
      />
    </div>
  );
}
