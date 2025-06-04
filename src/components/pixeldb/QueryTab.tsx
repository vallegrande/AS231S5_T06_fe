"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllRecordsIncludingInactive } from '@/lib/pixeldb-api';
import type { PixelArtRecord } from '@/types/pixeldb';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DataGrid } from './DataGrid';
import { useToast } from '@/hooks/use-toast';
import { Search, Loader2 } from 'lucide-react'; // Changed PixelSearchIcon

interface QueryTabProps {
  onEditRecord: (id: string) => void;
  onDeleteRecord: (id: string) => void;
  onRestoreRecord: (id: string) => void;
}

export function QueryTab({ onEditRecord, onDeleteRecord, onRestoreRecord }: QueryTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState('');
  const { toast } = useToast();

  const { data: records, isLoading, error, refetch } = useQuery<PixelArtRecord[], Error>({
    queryKey: ['pixelRecords', submittedSearchTerm],
    queryFn: () => fetchAllRecordsIncludingInactive(submittedSearchTerm),
    enabled: !!submittedSearchTerm, 
    initialData: [],
  });
  
  const { data: allRecords, isLoading: isLoadingAll, error: errorAll, refetch: refetchAll } = useQuery<PixelArtRecord[], Error>({
    queryKey: ['allPixelRecords'],
    queryFn: () => fetchAllRecordsIncludingInactive(),
    staleTime: 5 * 60 * 1000, 
  });


  const handleSearch = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    setSubmittedSearchTerm(searchTerm);
  };
  
  const displayRecords = submittedSearchTerm ? records : allRecords;
  const currentIsLoading = submittedSearchTerm ? isLoading : isLoadingAll;
  const currentError = submittedSearchTerm ? error : errorAll;

  if (currentError) {
    toast({
      title: 'Error al Cargar Registros',
      description: currentError.message,
      variant: 'destructive',
    });
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2 items-center">
        <Input
          type="search"
          placeholder="Buscar por nombre, etiqueta, categoría..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow pixel-border bg-input text-foreground focus:border-accent focus:ring-accent"
          aria-label="Buscar registros"
        />
        <Button type="submit" disabled={currentIsLoading} className="bg-accent text-accent-foreground hover:bg-accent/90 pixel-border border-accent-foreground shadow-pixel-accent active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
          {currentIsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
          <span className="ml-2 hidden sm:inline">Buscar</span>
        </Button>
      </form>

      {currentIsLoading && (
        <div className="flex justify-center items-center p-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg font-headline">Cargando Datos Pixel...</p>
        </div>
      )}
      
      {!currentIsLoading && displayRecords && (
        <DataGrid
          records={displayRecords}
          caption={submittedSearchTerm ? `Resultados de búsqueda para "${submittedSearchTerm}"` : "Todos los Registros Pixel (Activos e Inactivos)"}
          onEdit={onEditRecord}
          onDelete={onDeleteRecord}
          onRestore={onRestoreRecord}
          showInactive={true}
        />
      )}
      {!currentIsLoading && (!displayRecords || displayRecords.length === 0) && !currentError && (
         <div className="p-8 text-center pixel-border bg-card shadow-pixel-foreground">
          <p className="text-xl font-headline text-muted-foreground">
            {submittedSearchTerm ? `No se encontraron registros para "${submittedSearchTerm}".` : "No hay registros disponibles."}
          </p>
          <p className="mt-2 text-muted-foreground">¡Intenta un término de búsqueda diferente o crea nuevo pixel art!</p>
        </div>
      )}
    </div>
  );
}
