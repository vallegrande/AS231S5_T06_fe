
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Languages, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { translateText, type BackendTranslationRequest } from "@/lib/backend-api-client";

interface TranslationFormProps {
  onNewTranslationCompleted: () => void;
}

const languageOptions = [
  { value: "auto", label: "Detectar Idioma Automáticamente" },
  { value: "es", label: "Español (Spanish)" },
  { value: "en", label: "Inglés (English)" },
  { value: "fr", label: "Francés (French)" },
  { value: "de", label: "Alemán (German)" },
  { value: "it", label: "Italiano (Italian)" },
  { value: "pt", label: "Portugués (Portuguese)" },
  { value: "ja", label: "Japonés (Japanese)" },
  { value: "zh", label: "Chino (Chinese)"},
  { value: "ru", label: "Ruso (Russian)"},
  { value: "ar", label: "Árabe (Arabic)"},
];

// Filter out "auto" for target languages
const targetLanguageOptions = languageOptions.filter(lang => lang.value !== "auto");


export function TranslationForm({ onNewTranslationCompleted }: TranslationFormProps) {
  const [textToTranslate, setTextToTranslate] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("auto"); 
  const [targetLanguage, setTargetLanguage] = useState("en"); // Default to English
  const [translatedText, setTranslatedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTranslate = async () => {
    if (!textToTranslate.trim() || isLoading) return;

    setIsLoading(true);
    setTranslatedText(""); 

    try {
      const request: BackendTranslationRequest = { 
        text: textToTranslate, 
        from: sourceLanguage,
        to: targetLanguage 
      };
      const resultText = await translateText(request);
      
      setTranslatedText(resultText);
      onNewTranslationCompleted(); // Notify parent to refetch history
    } catch (error) {
      console.error("Error en traducción (backend):", error);
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
    setSourceLanguage("auto");
    setTargetLanguage("en"); 
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
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <Label htmlFor="source-language" className="text-sm font-medium text-text-secondary block mb-1">Idioma de Origen:</Label>
            <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
            <SelectTrigger id="source-language" className="pixel-input">
                <SelectValue placeholder="Selecciona idioma de origen" />
            </SelectTrigger>
            <SelectContent className="pixel-border bg-card shadow-pixel-foreground">
                {languageOptions.map(lang => (
                <SelectItem key={lang.value} value={lang.value} className="font-code hover:bg-accent/20">
                    {lang.label}
                </SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>

        <div>
            <Label htmlFor="target-language" className="text-sm font-medium text-text-secondary block mb-1">Traducir a:</Label>
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
            <SelectTrigger id="target-language" className="pixel-input">
                <SelectValue placeholder="Selecciona idioma de destino" />
            </SelectTrigger>
            <SelectContent className="pixel-border bg-card shadow-pixel-foreground">
                {targetLanguageOptions.map(lang => (
                <SelectItem key={lang.value} value={lang.value} className="font-code hover:bg-accent/20">
                    {lang.label}
                </SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>
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
