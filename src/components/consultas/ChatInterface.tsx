
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, User, Bot } from "lucide-react";
import { chatWithGemini, type ChatWithGeminiInput } from "@/ai/flows/chatWithGemini";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ClientTimestamp } from "@/components/common/ClientTimestamp";

export interface ChatEntry {
  id: string;
  type: "user" | "ai";
  text: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onNewQueryResponse: (query: string, response: string) => void;
  loadQuery: ChatEntry | null;
  clearLoadedQuery: () => void;
}

export function ChatInterface({ onNewQueryResponse, loadQuery, clearLoadedQuery }: ChatInterfaceProps) {
  const [userInput, setUserInput] = useState("");
  const [chatLog, setChatLog] = useState<ChatEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Initialize chat with AI greeting on client side to avoid hydration issues with new Date()
  useEffect(() => {
    setChatLog([
      { id: "0", type: "ai", text: "¡Hola! Soy Gemini, tu asistente virtual. ¿En qué puedo ayudarte hoy?", timestamp: new Date() }
    ]);
  }, []);


  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [chatLog]);
  
  useEffect(() => {
    if (loadQuery) {
      setUserInput(loadQuery.text);
      clearLoadedQuery(); // Clear after loading to prevent re-loading on re-renders
    }
  }, [loadQuery, clearLoadedQuery]);


  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage: ChatEntry = { id: Date.now().toString(), type: "user", text: userInput, timestamp: new Date() };
    setChatLog(prevLog => [...prevLog, userMessage]);
    setIsLoading(true);
    setUserInput("");

    try {
      const input: ChatWithGeminiInput = { message: userMessage.text };
      const result = await chatWithGemini(input);
      const aiMessage: ChatEntry = { id: (Date.now()+1).toString(), type: "ai", text: result.reply, timestamp: new Date() };
      setChatLog(prevLog => [...prevLog, aiMessage]);
      onNewQueryResponse(userMessage.text, result.reply);
    } catch (error) {
      console.error("Error en chat con Gemini:", error);
      const errorMessage: ChatEntry = {id: (Date.now()+1).toString(), type: "ai", text: "Lo siento, ocurrió un error al procesar tu solicitud.", timestamp: new Date() };
      setChatLog(prevLog => [...prevLog, errorMessage]);
      toast({
        title: "Error de Comunicación",
        description: (error as Error).message || "No se pudo obtener respuesta de la IA.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-grow p-3 space-y-3" ref={scrollAreaRef}>
        {chatLog.map((entry) => (
          <div
            key={entry.id}
            className={cn(
              "flex items-start gap-2 p-2 rounded-md text-sm max-w-[85%]",
              entry.type === "user" ? "ml-auto bg-blue-100 text-blue-800" : "mr-auto bg-gray-100 text-gray-800"
            )}
          >
            {entry.type === 'ai' ? <Bot className="w-5 h-5 text-gray-600 mt-0.5" /> : <User className="w-5 h-5 text-blue-600 mt-0.5" />}
            <div className="flex flex-col">
              <p className="whitespace-pre-wrap">{entry.text}</p>
              <ClientTimestamp date={entry.timestamp} />
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-2 p-2 rounded-md text-sm max-w-[85%] mr-auto bg-gray-100 text-gray-800">
            <Bot className="w-5 h-5 text-gray-600 mt-0.5" />
            <Loader2 className="w-5 h-5 animate-spin text-gray-600" /> 
          </div>
        )}
      </ScrollArea>
      <form onSubmit={handleSubmit} className="p-3 border-t border-panel-border flex items-center gap-2 bg-panel-bg">
        <Textarea
          placeholder="Escribe tu consulta aquí..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          rows={2}
          className="flex-grow resize-none border-panel-border focus:ring-accent bg-white"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <Button type="submit" disabled={isLoading || !userInput.trim()} className="bg-header-bg hover:bg-header-bg/90 text-header-fg px-3 py-2 h-auto">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          <span className="sr-only">Enviar</span>
        </Button>
      </form>
    </div>
  );
}
