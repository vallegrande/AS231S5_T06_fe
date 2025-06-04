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
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be 50 characters or less"),
  description: z.string().min(5, "Description must be at least 5 characters").max(500, "Description must be 500 chars or less"),
  category: z.string().min(2, "Category must be at least 2 characters").max(30, "Category must be 30 chars or less"),
  tags: z.string().refine(val => val.split(',').map(t => t.trim()).filter(t => t).length > 0, {
    message: "At least one tag is required. Separate tags with commas.",
  }),
  imageUrl: z.string().url("Must be a valid URL (e.g., https://placehold.co/100x100.png)").optional().or(z.literal("")),
});

export type RecordFormData = z.infer<typeof recordSchema>;

interface RecordFormProps {
  onSubmit: (data: RecordFormData) => Promise<void>;
  defaultValues?: Partial<PixelArtRecord>;
  isSubmitting?: boolean;
  submitButtonText?: string;
}

export function RecordForm({ onSubmit, defaultValues, isSubmitting = false, submitButtonText = "Submit" }: RecordFormProps) {
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
      toast({ title: "Cannot Translate", description: "Description field is empty.", variant: "destructive" });
      return;
    }
    setIsTranslating(true);
    try {
      const input: SuggestTranslationInput = { text: description, targetLanguage: "Spanish" }; // Example target language
      const result = await suggestTranslation(input);
      if (result.translatedText) {
        form.setValue("description", result.translatedText);
        toast({ title: "Translation Suggested", description: "Description updated with Spanish translation." });
      } else {
        toast({ title: "Translation Failed", description: "Could not get translation.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Translation error:", error);
      toast({ title: "Translation Error", description: "An error occurred during translation.", variant: "destructive" });
    } finally {
      setIsTranslating(false);
    }
  };


  return (
    <Card className="pixel-border bg-card shadow-pixel-foreground">
      <CardHeader>
        <CardTitle className="text-primary font-headline">{submitButtonText === "Submit" ? "Create New Record" : "Update Record"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Pixel Sword" {...field} className="pixel-border bg-input text-foreground focus:border-primary focus:ring-primary" />
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
                  <FormLabel className="text-foreground/80">Description</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Textarea placeholder="A legendary weapon..." {...field} rows={4} className="pixel-border bg-input text-foreground focus:border-primary focus:ring-primary pr-12" />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleSuggestTranslation}
                      disabled={isTranslating}
                      className="absolute top-2 right-2 p-1 h-8 w-8 text-accent hover:text-accent hover:bg-accent/20"
                      title="Suggest Spanish Translation"
                    >
                      {isTranslating ? <Loader2 className="h-4 w-4 animate-spin" /> : <PixelTranslateIcon className="h-5 w-5" />}
                    </Button>
                  </div>
                  <FormDescription>Describe the item. You can use AI to suggest a translation.</FormDescription>
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
                    <FormLabel className="text-foreground/80">Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Weapon" {...field} className="pixel-border bg-input text-foreground focus:border-primary focus:ring-primary" />
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
                    <FormLabel className="text-foreground/80">Tags (comma-separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="melee, sharp, retro" {...field} className="pixel-border bg-input text-foreground focus:border-primary focus:ring-primary" />
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
                  <FormLabel className="text-foreground/80">Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://placehold.co/100x100.png" {...field} className="pixel-border bg-input text-foreground focus:border-primary focus:ring-primary" />
                  </FormControl>
                  <FormDescription>URL for the item's pixel art image.</FormDescription>
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
