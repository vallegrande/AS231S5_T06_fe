"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { ConsultasSection } from "@/components/consultas/ConsultasSection";
import { TraductorSection } from "@/components/traductor/TraductorSection";

export default function MainPage() {
  return (
    <div className="flex flex-col min-h-screen bg-app-bg text-text-primary">
      <AppHeader />
      <main className="flex flex-1 flex-col md:flex-row p-3 md:p-4 gap-3 md:gap-4 overflow-hidden">
        <ConsultasSection />
        <TraductorSection />
      </main>
    </div>
  );
}
