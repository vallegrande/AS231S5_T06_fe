"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Languages } from "lucide-react";
import { suggestTranslation, type SuggestTranslationInput } from "@/ai/flows/suggest-translation";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

interface TranslationFormProps {
  onNewTranslation: (original: string, translated: string, langFrom: string, langTo: string) => void;
}

const availableLanguages = [
  { value: "English", label: "Inglés" },
  { value: "Spanish", label: "Español" },
  { value: "French", label: "Francés" },
  { value: "German", label: "Alemán" },
  { value: "Japanese", label: "Japonés" },
  { value: "Portuguese", label: "Portugués" },
  { value: "Italian", label: "Italiano" },
];

export function TranslationForm({ onNewTranslation }: TranslationFormProps) {
  const [textToTranslate, setTextToTranslate] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("Spanish"); // Default source
  const [targetLanguage, setTargetLanguage] = useState("English");
  const [translatedText, setTranslatedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTranslate = async () => {
    if (!textToTranslate.trim() || isLoading) return;

    setIsLoading(true);
    setTranslatedText(""); 

    try {
      // For now, the suggestTranslation flow implicitly detects source language.
      // We will pass targetLanguage. The `sourceLanguage` state is for UI indication.
      const input: SuggestTranslationInput = { text: textToTranslate, targetLanguage: targetLanguage };
      const result = await suggestTranslation(input);
      
      if (result.translatedText) {
        setTranslatedText(result.translatedText);
        onNewTranslation(textToTranslate, result.translatedText, sourceLanguage, targetLanguage);
      } else {
        throw new Error("La IA no devolvió una traducción.");
      }
    } catch (error) {
      console.error("Error en traducción:", error);
      toast({
        title: "Error de Traducción",
        description: (error as Error).message || "No se pudo traducir el texto.",
        variant: "destructive",
      });
      setTranslatedText("Error al traducir.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="source-language" className="text-sm font-medium text-text-secondary">Idioma de Origen (Detectado Automáticamente)</Label>
        <Select value={sourceLanguage} onValueChange={setSourceLanguage} disabled>
           <SelectTrigger id="source-language-display" className="mt-1 border-panel-border bg-white">
            <SelectValue placeholder="Selecciona idioma" />
          </SelectTrigger>
          {/* This is just for display, actual detection is by AI */}
          <SelectContent><SelectItem value="Spanish">Español</SelectItem></SelectContent>
        </Select>
         <p className="text-xs text-muted-foreground mt-1">La IA intentará detectar el idioma de origen automáticamente.</p>
      </div>

      <div>
        <Label htmlFor="text-to-translate" className="text-sm font-medium text-text-secondary">Texto a Traducir</Label>
        <Textarea
          id="text-to-translate"
          placeholder="Escribe el texto que quieres traducir..."
          value={textToTranslate}
          onChange={(e) => setTextToTranslate(e.target.value)}
          rows={4}
          className="mt-1 border-panel-border focus:ring-accent bg-white"
        />
      </div>

      <div>
        <Label htmlFor="target-language" className="text-sm font-medium text-text-secondary">Traducir a</Label>
        <Select value={targetLanguage} onValueChange={setTargetLanguage}>
          <SelectTrigger id="target-language" className="mt-1 border-panel-border bg-white">
            <SelectValue placeholder="Selecciona idioma de destino" />
          </SelectTrigger>
          <SelectContent>
            {availableLanguages.map(lang => (
              <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleTranslate} disabled={isLoading || !textToTranslate.trim()} className="w-full bg-button-primary-bg text-text-on-primary-button hover:bg-button-primary-bg/90">
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Languages className="w-5 h-5 mr-2" />}
        Traducir
      </Button>

      {translatedText && (
        <div className="mt-4 p-3 border border-panel-border rounded-md bg-gray-50">
          <Label className="text-sm font-medium text-text-secondary">Texto Traducido:</Label>
          <p className="mt-1 text-sm text-text-primary whitespace-pre-wrap">{translatedText}</p>
        </div>
      )}
    </div>
  );
}
