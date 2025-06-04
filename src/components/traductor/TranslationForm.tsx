
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Languages, RefreshCw } from "lucide-react";
import { suggestTranslation, type SuggestTranslationInput } from "@/ai/flows/suggest-translation";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface TranslationFormProps {
  onNewTranslation: (original: string, translated: string, langFrom: string, langTo: string) => void;
}

const availableLanguages = [
  { value: "English", label: "Inglés (English)" },
  { value: "Spanish", label: "Español (Spanish)" },
  { value: "French", label: "Francés (French)" },
  { value: "German", label: "Alemán (German)" },
  { value: "Japanese", label: "Japonés (Japanese)" },
  { value: "Portuguese", label: "Portugués (Portuguese)" },
  { value: "Italian", label: "Italiano (Italian)" },
  { value: "Chinese", label: "Chino (Chinese)"},
  { value: "Russian", label: "Ruso (Russian)"},
  { value: "Arabic", label: "Árabe (Arabic)"},
];

export function TranslationForm({ onNewTranslation }: TranslationFormProps) {
  const [textToTranslate, setTextToTranslate] = useState("");
  // Source language is auto-detected by AI, this is for UI display/hint if needed
  // const [sourceLanguage, setSourceLanguage] = useState("auto"); 
  const [targetLanguage, setTargetLanguage] = useState("English");
  const [translatedText, setTranslatedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTranslate = async () => {
    if (!textToTranslate.trim() || isLoading) return;

    setIsLoading(true);
    setTranslatedText(""); 

    try {
      const input: SuggestTranslationInput = { text: textToTranslate, targetLanguage: targetLanguage };
      const result = await suggestTranslation(input);
      
      if (result.translatedText) {
        setTranslatedText(result.translatedText);
        // For simplicity, we'll pass "Auto" as source language as Genkit detects it.
        onNewTranslation(textToTranslate, result.translatedText, "Auto (Detectado)", targetLanguage);
      } else {
        throw new Error("La IA no devolvió una traducción.");
      }
    } catch (error) {
      console.error("Error en traducción:", error);
      toast({
        title: "Error de Traducción 👾",
        description: (error as Error).message || "No se pudo traducir el texto.",
        variant: "destructive",
      });
      setTranslatedText("Error al traducir. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setTextToTranslate("");
    setTranslatedText("");
    setTargetLanguage("English"); // Reset target language to default
    toast({ title: "Formulario Limpiado ✨", description: "Puedes ingresar nuevo texto para traducir." });
  };

  return (
    <div className="space-y-4 font-code">
      <div>
        <Label htmlFor="text-to-translate" className="text-sm font-medium text-text-secondary block mb-1">Texto a Traducir:</Label>
        <Textarea
          id="text-to-translate"
          placeholder="Escribe o pega el texto aquí..."
          value={textToTranslate}
          onChange={(e) => setTextToTranslate(e.target.value)}
          rows={5}
          className="pixel-textarea"
        />
        <p className="text-xs text-muted-foreground mt-1">La IA intentará detectar el idioma de origen automáticamente.</p>
      </div>

      <div>
        <Label htmlFor="target-language" className="text-sm font-medium text-text-secondary block mb-1">Traducir a:</Label>
        <Select value={targetLanguage} onValueChange={setTargetLanguage}>
          <SelectTrigger id="target-language" className="pixel-input">
            <SelectValue placeholder="Selecciona idioma de destino" />
          </SelectTrigger>
          <SelectContent className="pixel-border bg-card shadow-pixel-foreground">
            {availableLanguages.map(lang => (
              <SelectItem key={lang.value} value={lang.value} className="font-code hover:bg-accent/20">
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={handleTranslate} disabled={isLoading || !textToTranslate.trim()} className="w-full sm:flex-1 pixel-button-primary">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Languages className="w-5 h-5 mr-2" />}
          Traducir Texto
        </Button>
        <Button onClick={handleReset} variant="outline" className="w-full sm:w-auto pixel-button-ghost border-destructive text-destructive hover:bg-destructive/20 hover:text-destructive-foreground hover:border-destructive-foreground">
          <RefreshCw className="w-5 h-5 mr-2" />
          Limpiar
        </Button>
      </div>


      {translatedText && (
        <Card className="mt-4 pixel-card animate-fade-in bg-green-500/10 border-green-500">
          <CardContent className="p-3">
            <Label className="text-sm font-medium text-green-700 block mb-1">Texto Traducido:</Label>
            <p className="text-sm text-text-primary whitespace-pre-wrap font-code p-2 bg-background/50 pixel-border border-green-500/50">
              {translatedText}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
