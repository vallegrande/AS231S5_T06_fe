"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatInterface } from "./ChatInterface";
import { QueryHistoryPanel } from "./QueryHistoryPanel";
import { useState } from "react";
import type { ChatEntry } from "./ChatInterface";

export function ConsultasSection() {
  const [queryHistory, setQueryHistory] = useState<ChatEntry[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<ChatEntry | null>(null);

  const handleNewQueryResponse = (query: string, response: string) => {
    const newEntry: ChatEntry = { id: Date.now().toString(), type: 'user', text: query, timestamp: new Date() };
    const newResponseEntry: ChatEntry = { id: (Date.now()+1).toString(), type: 'ai', text: response, timestamp: new Date() };
    setQueryHistory(prev => [newEntry, newResponseEntry, ...prev.slice(0, 18)]); // Keep last 10 pairs (20 entries)
  };
  
  const handleLoadQuery = (query: ChatEntry) => {
    setSelectedQuery(query);
  };

  return (
    <section className="flex-grow flex flex-col md:flex-row gap-4 h-[calc(100vh-100px)] md:h-auto">
      <Card className="flex-grow-[3] flex flex-col border-panel-border bg-panel-bg shadow-lg h-full">
        <CardHeader className="p-3 border-b border-panel-border">
          <CardTitle className="text-lg text-primary">Asistente Virtual Gemini</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-grow flex flex-col overflow-hidden">
          <ChatInterface 
            onNewQueryResponse={handleNewQueryResponse}
            loadQuery={selectedQuery}
            clearLoadedQuery={() => setSelectedQuery(null)}
          />
        </CardContent>
      </Card>
      <QueryHistoryPanel history={queryHistory} onLoadQuery={handleLoadQuery} />
    </section>
  );
}
