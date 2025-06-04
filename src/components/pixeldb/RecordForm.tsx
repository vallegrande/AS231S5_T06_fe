"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { PixelArtRecord } from "@/types/pixeldb";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { suggestTranslation, SuggestTranslationInput } from "@/ai/flows/suggest-translation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PixelTranslateIcon } from "../icons/PixelTranslateIcon";
import { Loader2 } from "lucide-react";

export const recordSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50, "El nombre debe tener 50 caracteres o menos"),
  description: z.string().min(5, "La descripción debe tener al menos 5 caracteres").max(500, "La descripción debe tener 500 caracteres o menos"),
  category: z.string().min(2, "La categoría debe tener al menos 2 caracteres").max(30, "La categoría debe tener 30 caracteres o menos"),
  tags: z.string().refine(val => val.split(',').map(t => t.trim()).filter(t => t).length > 0, {
    message: "Se requiere al menos una etiqueta. Separa las etiquetas con comas.",
  }),
  imageUrl: z.string().url("Debe ser una URL válida (ej: https://placehold.co/100x100.png)").optional().or(z.literal("")),
});

export type RecordFormData = z.infer<typeof recordSchema>;

interface RecordFormProps {
  onSubmit: (data: RecordFormData) => Promise<void>;
  defaultValues?: Partial<PixelArtRecord>;
  isSubmitting?: boolean;
  submitButtonText?: string;
}

export function RecordForm({ onSubmit, defaultValues, isSubmitting = false, submitButtonText = "Enviar" }: RecordFormProps) {
  const { toast } = useToast();
  const [isTranslating, setIsTranslating] = useState(false);

  const form = useForm<RecordFormData>({
    resolver: zodResolver(recordSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      category: defaultValues?.category || "",
      tags: defaultValues?.tags?.join(", ") || "",
      imageUrl: defaultValues?.imageUrl || "https://placehold.co/100x100.png",
    },
  });

  const handleSuggestTranslation = async () => {
    const description = form.getValues("description");
    if (!description) {
      toast({ title: "No se Puede Traducir", description: "El campo de descripción está vacío.", variant: "destructive" });
      return;
    }
    setIsTranslating(true);
    try {
      // Translating Spanish description to English
      const input: SuggestTranslationInput = { text: description, targetLanguage: "English" }; 
      const result = await suggestTranslation(input);
      if (result.translatedText) {
        form.setValue("description", result.translatedText);
        toast({ title: "Traducción Sugerida", description: "Descripción actualizada con traducción al Inglés." });
      } else {
        toast({ title: "Traducción Fallida", description: "No se pudo obtener la traducción.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Translation error:", error);
      toast({ title: "Error de Traducción", description: "Ocurrió un error durante la traducción.", variant: "destructive" });
    } finally {
      setIsTranslating(false);
    }
  };


  return (
    <Card className="pixel-border bg-card shadow-pixel-foreground">
      <CardHeader>
        <CardTitle className="text-primary font-headline">{submitButtonText === "Crear Registro Pixel" ? "Crear Nuevo Registro" : (submitButtonText === "Actualizar Registro Pixel" ? "Actualizar Registro" : submitButtonText)}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Espada Pixel" {...field} className="pixel-border bg-input text-foreground focus:border-primary focus:ring-primary" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Descripción</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Textarea placeholder="Un arma legendaria..." {...field} rows={4} className="pixel-border bg-input text-foreground focus:border-primary focus:ring-primary pr-12" />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleSuggestTranslation}
                      disabled={isTranslating}
                      className="absolute top-2 right-2 p-1 h-8 w-8 text-accent hover:text-accent hover:bg-accent/20"
                      title="Sugerir Traducción al Inglés"
                    >
                      {isTranslating ? <Loader2 className="h-4 w-4 animate-spin" /> : <PixelTranslateIcon className="h-5 w-5" />}
                    </Button>
                  </div>
                  <FormDescription>Describe el objeto. Puedes usar IA para sugerir una traducción al inglés.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Categoría</FormLabel>
                    <FormControl>
                      <Input placeholder="Arma" {...field} className="pixel-border bg-input text-foreground focus:border-primary focus:ring-primary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Etiquetas (separadas por coma)</FormLabel>
                    <FormControl>
                      <Input placeholder="cuerpo a cuerpo, afilado, retro" {...field} className="pixel-border bg-input text-foreground focus:border-primary focus:ring-primary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">URL de Imagen</FormLabel>
                  <FormControl>
                    <Input placeholder="https://placehold.co/100x100.png" {...field} className="pixel-border bg-input text-foreground focus:border-primary focus:ring-primary" />
                  </FormControl>
                  <FormDescription>URL para la imagen pixel art del objeto.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 pixel-border border-primary-foreground shadow-pixel-primary active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitButtonText}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
