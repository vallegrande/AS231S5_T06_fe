"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRecordById, updateRecord } from '@/lib/pixeldb-api';
import type { PixelArtRecord } from '@/types/pixeldb';
import { RecordForm, type RecordFormData } from './RecordForm';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PixelSearchIcon } from '../icons/PixelSearchIcon';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface UpdateTabProps {
  recordIdToUpdate: string | null;
  onRecordUpdated: () => void;
  clearRecordIdToUpdate: () => void;
}

export function UpdateTab({ recordIdToUpdate, onRecordUpdated, clearRecordIdToUpdate }: UpdateTabProps) {
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(recordIdToUpdate);
  const [idInput, setIdInput] = useState<string>(recordIdToUpdate || "");

  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (recordIdToUpdate) {
      setCurrentRecordId(recordIdToUpdate);
      setIdInput(recordIdToUpdate);
    }
  }, [recordIdToUpdate]);

  const { data: recordToUpdate, isLoading: isLoadingRecord, error: fetchError, refetch } = useQuery<PixelArtRecord | null, Error>({
    queryKey: ['pixelRecord', currentRecordId],
    queryFn: () => currentRecordId ? getRecordById(currentRecordId) : Promise.resolve(null),
    enabled: !!currentRecordId,
  });

  const mutation = useMutation<
    PixelArtRecord | null, 
    Error, 
    { id: string; data: Partial<Omit<PixelArtRecord, 'id' | 'createdAt' | 'updatedAt'>> }
  >({
    mutationFn: ({ id, data }) => updateRecord(id, data),
    onSuccess: (updatedRecord) => {
      if (updatedRecord) {
        queryClient.invalidateQueries({ queryKey: ['pixelRecords'] });
        queryClient.invalidateQueries({ queryKey: ['allPixelRecords'] });
        queryClient.invalidateQueries({ queryKey: ['pixelRecord', updatedRecord.id] });
        toast({
          title: '¡Registro Actualizado! 💾',
          description: `"${updatedRecord.name}" ha sido actualizado correctamente.`,
        });
        onRecordUpdated();
        clearRecordIdToUpdate(); 
        setCurrentRecordId(null); 
        setIdInput("");
      } else {
         toast({ title: 'Actualización Fallida', description: 'Registro no encontrado o ocurrió un error.', variant: 'destructive' });
      }
    },
    onError: (error) => {
      toast({
        title: 'Actualización Fallida 😢',
        description: error.message || 'No se pudo actualizar el registro.',
        variant: 'destructive',
      });
    },
  });

  const handleFetchRecord = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (idInput.trim()) {
      setCurrentRecordId(idInput.trim());
    } else {
      toast({ title: "ID Faltante", description: "Por favor, introduce un ID de registro para buscar.", variant: "destructive" });
    }
  };

  const handleSubmit = async (data: RecordFormData) => {
    if (!currentRecordId) return;
    const tagsArray = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    const recordDataToUpdate = { ...data, tags: tagsArray };
    await mutation.mutateAsync({ id: currentRecordId, data: recordDataToUpdate });
  };

  if (fetchError) {
     // toast({ title: 'Error al Buscar Registro', description: fetchError.message, variant: 'destructive' });
     console.error("Fetch error:", fetchError.message);
  }
  
  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card className="pixel-border bg-card shadow-pixel-foreground">
        <CardHeader>
          <CardTitle className="text-primary font-headline">Actualizar Registro Pixel</CardTitle>
          <CardDescription>Introduce el ID del registro que quieres actualizar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFetchRecord} className="flex gap-2 items-center mb-6">
            <Input
              placeholder="Introduce ID del Registro"
              value={idInput}
              onChange={(e) => setIdInput(e.target.value)}
              className="flex-grow pixel-border bg-input text-foreground focus:border-accent focus:ring-accent"
              aria-label="ID del registro a actualizar"
            />
            <Button type="submit" disabled={isLoadingRecord || !idInput} className="bg-accent text-accent-foreground hover:bg-accent/90 pixel-border border-accent-foreground shadow-pixel-accent active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
              {isLoadingRecord ? <Loader2 className="h-5 w-5 animate-spin" /> : <PixelSearchIcon className="h-5 w-5" />}
               <span className="ml-2 hidden sm:inline">Buscar Registro</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoadingRecord && currentRecordId && (
        <div className="flex justify-center items-center p-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
           <p className="ml-4 text-lg font-headline">Buscando Registro...</p>
        </div>
      )}

      {recordToUpdate && currentRecordId && (
        <RecordForm
          onSubmit={handleSubmit}
          defaultValues={recordToUpdate}
          isSubmitting={mutation.isPending}
          submitButtonText="Actualizar Registro Pixel"
        />
      )}

      {!isLoadingRecord && currentRecordId && !recordToUpdate && !fetchError && (
        <p className="p-4 text-center text-muted-foreground pixel-border bg-card shadow-pixel-foreground">Registro con ID "{currentRecordId}" no encontrado.</p>
      )}
      {fetchError && (
         <p className="p-4 text-center text-destructive pixel-border bg-card shadow-pixel-foreground">Error al buscar el registro: {fetchError.message}</p>
      )}
    </div>
  );
}
