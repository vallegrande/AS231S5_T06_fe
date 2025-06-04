
"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { ConsultasSection } from "@/components/consultas/ConsultasSection";
import { TraductorSection } from "@/components/traductor/TraductorSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, LanguagesIcon } from "lucide-react"; // Iconos para las pestañas

export default function MainPage() {
  return (
    <div className="flex flex-col min-h-screen bg-app-bg text-text-primary font-body">
      <AppHeader />
      <main className="flex-1 p-3 md:p-4 overflow-hidden">
        <Tabs defaultValue="consultas" className="w-full h-full flex flex-col">
          <TabsList className="pixel-tabs-list self-center mb-4">
            <TabsTrigger value="consultas" className="pixel-tabs-trigger px-4 py-2 text-base">
              <MessageCircle className="w-5 h-5 mr-2" />
              Consultas IA
            </TabsTrigger>
            <TabsTrigger value="traductor" className="pixel-tabs-trigger px-4 py-2 text-base">
              <LanguagesIcon className="w-5 h-5 mr-2" />
              Traductor IA
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="consultas" className="flex-grow overflow-auto animate-fade-in">
            <ConsultasSection />
          </TabsContent>
          <TabsContent value="traductor" className="flex-grow overflow-auto animate-fade-in">
            <TraductorSection />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
