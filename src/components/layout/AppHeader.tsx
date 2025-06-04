
"use client";

import { Bot } from "lucide-react";

export function AppHeader() {
  return (
    <header className="bg-header-bg text-header-fg p-3 shadow-md flex items-center pixel-border border-b-4 border-foreground">
      <Bot size={32} className="mr-3 text-header-fg" />
      <h1 className="text-2xl font-headline tracking-wider uppercase">
        IA Power Suite - Consultas & Traductor
      </h1>
    </header>
  );
}
