"use client";

import { Bot } from "lucide-react";

export function AppHeader() {
  return (
    <header className="bg-header-bg text-header-fg p-3 shadow-md flex items-center">
      <Bot size={28} className="mr-3" />
      <h1 className="text-xl font-semibold tracking-wide">
        GEMINI API - CONSULTAS & TRADUCTOR
      </h1>
    </header>
  );
}
