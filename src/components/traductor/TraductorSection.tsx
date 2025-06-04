"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TranslationForm } from "./TranslationForm";
import { TranslationHistoryPanel, type TranslationRecord } from "./TranslationHistoryPanel";
import { useState } from "react";
import { Languages } from "lucide-react";

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
    <section className="w-full md:w-[450px] flex-shrink-0 flex flex-col gap-4 h-[calc(100vh-100px)] md:h-auto">
      <Card className="flex-grow-[2] flex flex-col border-panel-border bg-panel-bg shadow-lg">
        <CardHeader className="p-3 border-b border-panel-border">
          <CardTitle className="text-lg text-primary flex items-center">
            <Languages className="w-5 h-5 mr-2" />
            Traductor IA
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <TranslationForm onNewTranslation={handleNewTranslation} />
        </CardContent>
      </Card>
      <TranslationHistoryPanel history={translationHistory} onClearHistory={handleClearHistory} />
    </section>
  );
}
