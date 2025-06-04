
"use client";

import { TranslationForm } from "./TranslationForm";
import { TranslationHistoryPanel, type TranslationRecord } from "./TranslationHistoryPanel";
import { useState } from "react";
import { Languages, PanelLeft, History } from "lucide-react";

export function TraductorSection() {
  const [translationHistory, setTranslationHistory] = useState<TranslationRecord[]>([]);

  const handleNewTranslation = (original: string, translated: string, langFrom: string, langTo: string) => {
    const newRecord: TranslationRecord = {
      id: Date.now().toString(),
      originalText: original,
      translatedText: translated,
      languageFrom: langFrom,
      languageTo: langTo,
      timestamp: new Date(),
    };
    setTranslationHistory(prev => [newRecord, ...prev.slice(0, 9)]); // Keep last 10 translations
  };

  const handleClearHistory = () => {
    setTranslationHistory([]);
  };

  return (
    <div className="flex flex-col md:flex-row gap-3 md:gap-4 h-full">
      {/* Panel de Traducción Principal */}
      <div className="flex-grow-[2] flex flex-col pixel-card overflow-hidden animate-slide-in-up">
        <header className="p-3 border-b-2 border-foreground bg-card flex items-center">
          <Languages className="w-6 h-6 mr-2 text-primary" />
          <h2 className="text-xl font-headline text-primary">Traductor con IA</h2>
        </header>
        <div className="p-3 flex-grow">
          <TranslationForm onNewTranslation={handleNewTranslation} />
        </div>
      </div>

      {/* Panel de Historial de Traducciones */}
      <TranslationHistoryPanel 
        history={translationHistory} 
        onClearHistory={handleClearHistory} 
        className="md:w-96 animate-slide-in-up md:animate-fade-in"
        style={{ animationDelay: '0.1s' }}
      />
    </div>
  );
}
