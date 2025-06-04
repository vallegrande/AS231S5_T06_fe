"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRecordById, softDeleteRecord, restoreRecord } from '@/lib/pixeldb-api';
import type { PixelArtRecord } from '@/types/pixeldb';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Trash2, RotateCcw, Loader2 } from 'lucide-react'; // Changed icons
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Image from 'next/image';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

interface DeleteTabProps {
  recordIdToDelete: string | null;
  onRecordDeletedOrRestored: () => void;
  clearRecordIdToDelete: () => void;
}

export function DeleteTab({ recordIdToDelete, onRecordDeletedOrRestored, clearRecordIdToDelete }: DeleteTabProps) {
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(recordIdToDelete);
  const [idInput, setIdInput] = useState<string>(recordIdToDelete || "");
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [isConfirmRestoreDialogOpen, setIsConfirmRestoreDialogOpen] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  useEffect(() => {
    if (recordIdToDelete) {
      setCurrentRecordId(recordIdToDelete);
      setIdInput(recordIdToDelete);
    }
  }, [recordIdToDelete]);


  const { data: recordToDelete, isLoading: isLoadingRecord, error: fetchError, refetch } = useQuery<PixelArtRecord | null, Error>({
    queryKey: ['pixelRecordForDeletion', currentRecordId],
    queryFn: () => currentRecordId ? getRecordById(currentRecordId) : Promise.resolve(null),
    enabled: !!currentRecordId,
  });

  const deleteMutation = useMutation<PixelArtRecord | null, Error, string>({
    mutationFn: softDeleteRecord,
    onSuccess: (deletedRecord) => {
      if (deletedRecord) {
        queryClient.invalidateQueries({ queryKey: ['pixelRecords'] });
        queryClient.invalidateQueries({ queryKey: ['allPixelRecords'] });
        queryClient.invalidateQueries({ queryKey: ['pixelRecordForDeletion', deletedRecord.id] });
        queryClient.invalidateQueries({ queryKey: ['pixelRecord', deletedRecord.id] }); 
        toast({
          title: '¡Registro Eliminado (Lóg.)! 🗑️',
          description: `"${deletedRecord.name}" ha sido marcado como inactivo.`,
        });
        onRecordDeletedOrRestored();
        clearRecordIdToDelete();
        setCurrentRecordId(null);
        setIdInput("");
      } else {
         toast({ title: 'Eliminación Fallida', description: 'Registro no encontrado o ya inactivo.', variant: 'destructive' });
      }
    },
    onError: (error) => {
      toast({
        title: 'Eliminación Fallida 😢',
        description: error.message || 'No se pudo eliminar (lóg.) el registro.',
        variant: 'destructive',
      });
    },
  });

  const restoreMutation = useMutation<PixelArtRecord | null, Error, string>({
    mutationFn: restoreRecord,
    onSuccess: (restoredRecord) => {
      if (restoredRecord) {
        queryClient.invalidateQueries({ queryKey: ['pixelRecords'] });
        queryClient.invalidateQueries({ queryKey: ['allPixelRecords'] });
        queryClient.invalidateQueries({ queryKey: ['pixelRecordForDeletion', restoredRecord.id] });
        queryClient.invalidateQueries({ queryKey: ['pixelRecord', restoredRecord.id] });
        toast({
          title: '¡Registro Restaurado! ✨',
          description: `"${restoredRecord.name}" ha sido marcado como activo.`,
        });
        onRecordDeletedOrRestored();
        clearRecordIdToDelete();
        setCurrentRecordId(null);
        setIdInput("");
      } else {
        toast({ title: 'Restauración Fallida', description: 'Registro no encontrado o ya activo.', variant: 'destructive' });
      }
    },
    onError: (error) => {
      toast({ title: 'Restauración Fallida', description: error.message, variant: 'destructive' });
    },
  });

  const handleFetchRecord = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (idInput.trim()) {
      setCurrentRecordId(idInput.trim());
    } else {
      toast({ title: "ID Faltante", description: "Por favor, introduce un ID de registro.", variant: "destructive" });
    }
  };

  const confirmDelete = () => {
    if (currentRecordId) {
      deleteMutation.mutate(currentRecordId);
    }
    setIsConfirmDeleteDialogOpen(false);
  };
  
  const confirmRestore = () => {
    if (currentRecordId) {
      restoreMutation.mutate(currentRecordId);
    }
    setIsConfirmRestoreDialogOpen(false);
  };


  if (fetchError) {
     // Showing toast directly in component might be too noisy, consider logging or a less intrusive UI element
     // toast({ title: 'Error al Buscar Registro', description: fetchError.message, variant: 'destructive' });
     console.error("Fetch error:", fetchError.message);
  }
  
  const getStatusClass = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-700 border-green-300" : "bg-red-100 text-red-700 border-red-300";
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card className="pixel-border bg-card shadow-pixel-foreground">
        <CardHeader>
          <CardTitle className="text-primary font-headline">Gestionar Estado del Registro</CardTitle>
          <CardDescription>Introduce el ID del registro para eliminarlo (lógicamente) o restaurarlo.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFetchRecord} className="flex gap-2 items-center">
            <Input
              placeholder="Introduce ID del Registro"
              value={idInput}
              onChange={(e) => setIdInput(e.target.value)}
              className="flex-grow pixel-border bg-input text-foreground focus:border-accent focus:ring-accent"
              aria-label="ID del registro a eliminar o restaurar"
            />
            <Button type="submit" disabled={isLoadingRecord || !idInput} className="bg-accent text-accent-foreground hover:bg-accent/90 pixel-border border-accent-foreground shadow-pixel-accent active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
              {isLoadingRecord ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
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

      {recordToDelete && currentRecordId && (
        <Card className="pixel-border bg-card shadow-pixel-foreground animate-fade-in">
          <CardHeader>
            <CardTitle className="font-headline text-xl">{recordToDelete.name}</CardTitle>
            <Badge variant={recordToDelete.isActive ? "default" : "secondary"} className={cn("w-fit", getStatusClass(recordToDelete.isActive))}>
              Estado: {recordToDelete.isActive ? 'Activo' : 'Inactivo'}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            {recordToDelete.imageUrl && 
              <Image src={recordToDelete.imageUrl} alt={recordToDelete.name} width={80} height={80} className="border-2 border-primary float-right ml-4 mb-2" data-ai-hint="pixel art item"/>}
            <p><strong className="text-foreground/80">ID:</strong> {recordToDelete.id}</p>
            <p><strong className="text-foreground/80">Categoría:</strong> {recordToDelete.category}</p>
            <p><strong className="text-foreground/80">Descripción:</strong> {recordToDelete.description}</p>
          </CardContent>
          <CardFooter>
            {recordToDelete.isActive ? (
              <Button
                variant="destructive"
                onClick={() => setIsConfirmDeleteDialogOpen(true)}
                disabled={deleteMutation.isPending}
                className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 pixel-border border-destructive-foreground shadow-[3px_3px_0px_hsl(var(--destructive-foreground))] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                {deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Eliminar Registro (Lóg.)
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={() => setIsConfirmRestoreDialogOpen(true)}
                disabled={restoreMutation.isPending}
                className="w-full bg-green-600 text-white hover:bg-green-600/90 pixel-border border-green-300 shadow-[3px_3px_0px_hsl(var(--accent))] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                {restoreMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
                Restaurar Registro
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
      
      {!isLoadingRecord && currentRecordId && !recordToDelete && !fetchError && (
         <p className="p-4 text-center text-muted-foreground pixel-border bg-card shadow-pixel-foreground">Registro con ID "{currentRecordId}" no encontrado.</p>
      )}
       {fetchError && (
         <p className="p-4 text-center text-destructive pixel-border bg-card shadow-pixel-foreground">Error al buscar el registro: {fetchError.message}</p>
      )}


      <AlertDialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
        <AlertDialogContent className="pixel-border bg-background shadow-pixel-primary">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-primary">Confirmar Eliminación (Lógica)</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar (lógicamente) "{recordToDelete?.name}"? Esto marcará el registro como inactivo pero podrá ser restaurado más tarde.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="pixel-border hover:bg-muted/50 active:translate-x-[1px] active:translate-y-[1px]">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 pixel-border border-destructive-foreground shadow-[2px_2px_0px_hsl(var(--destructive-foreground))] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">
              Confirmar Eliminación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isConfirmRestoreDialogOpen} onOpenChange={setIsConfirmRestoreDialogOpen}>
        <AlertDialogContent className="pixel-border bg-background shadow-pixel-primary">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-primary">Confirmar Restauración</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres restaurar "{recordToDelete?.name}"? Esto marcará el registro como activo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="pixel-border hover:bg-muted/50 active:translate-x-[1px] active:translate-y-[1px]">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRestore} className="bg-green-600 text-white hover:bg-green-600/90 pixel-border border-green-300 shadow-[2px_2px_0px_hsl(var(--accent))] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">
              Confirmar Restauración
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
