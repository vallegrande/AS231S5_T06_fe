
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, User, Bot, CornerDownLeft } from "lucide-react";
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
   const textAreaRef = useRef<HTMLTextAreaElement>(null);


  useEffect(() => {
    setChatLog([
      { id: "0", type: "ai", text: "¡Hola! Soy Gemini, tu asistente virtual pixelado. ¿En qué puedo ayudarte hoy?", timestamp: new Date() }
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
      textAreaRef.current?.focus();
      clearLoadedQuery(); 
    }
  }, [loadQuery, clearLoadedQuery]);


  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage: ChatEntry = { id: Date.now().toString(), type: "user", text: userInput, timestamp: new Date() };
    setChatLog(prevLog => [...prevLog, userMessage]);
    setIsLoading(true);
    const currentInput = userInput;
    setUserInput("");

    try {
      const input: ChatWithGeminiInput = { message: currentInput };
      const result = await chatWithGemini(input);
      const aiMessage: ChatEntry = { id: (Date.now()+1).toString(), type: "ai", text: result.reply, timestamp: new Date() };
      setChatLog(prevLog => [...prevLog, aiMessage]);
      onNewQueryResponse(currentInput, result.reply);
    } catch (error) {
      console.error("Error en chat con Gemini:", error);
      const errorMessage: ChatEntry = {id: (Date.now()+1).toString(), type: "ai", text: "Lo siento, ocurrió un error al procesar tu solicitud pixelada.", timestamp: new Date() };
      setChatLog(prevLog => [...prevLog, errorMessage]);
      toast({
        title: "Error de Comunicación 👾",
        description: (error as Error).message || "No se pudo obtener respuesta de la IA.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      textAreaRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-full bg-card">
      <ScrollArea className="flex-grow p-3 space-y-3" ref={scrollAreaRef}>
        {chatLog.map((entry) => (
          <div
            key={entry.id}
            className={cn(
              "flex items-start gap-2 p-2.5 text-sm max-w-[85%] pixel-border mb-2 shadow-pixel-foreground/50",
              entry.type === "user" ? "ml-auto bg-blue-500/20 border-blue-500 text-foreground" : "mr-auto bg-green-500/20 border-green-500 text-foreground"
            )}
          >
            {entry.type === 'ai' ? 
              <Bot className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" /> : 
              <User className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />}
            <div className="flex flex-col">
              <p className="whitespace-pre-wrap font-code">{entry.text}</p>
              <ClientTimestamp date={entry.timestamp} className="text-xs text-muted-foreground self-end mt-1"/>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-2 p-2.5 pixel-border border-accent bg-accent/20 text-sm max-w-[85%] mr-auto text-foreground">
            <Bot className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
            <Loader2 className="w-5 h-5 animate-spin text-accent" /> 
            <p className="font-code">Pensando...</p>
          </div>
        )}
      </ScrollArea>
      <form onSubmit={handleSubmit} className="p-3 border-t-2 border-foreground flex items-center gap-2 bg-muted">
        <Textarea
          ref={textAreaRef}
          placeholder="Escribe tu consulta aquí..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          rows={2}
          className="flex-grow resize-none pixel-input focus:border-accent focus:ring-accent"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <Button type="submit" disabled={isLoading || !userInput.trim()} className="pixel-button-primary px-3 py-2 h-auto">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          <span className="sr-only">Enviar</span>
        </Button>
      </form>
    </div>
  );
}
