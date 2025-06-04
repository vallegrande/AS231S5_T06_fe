"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllRecordsIncludingInactive } from '@/lib/pixeldb-api';
import type { PixelArtRecord } from '@/types/pixeldb';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DataGrid } from './DataGrid';
import { useToast } from '@/hooks/use-toast';
import { PixelSearchIcon } from '../icons/PixelSearchIcon';
import { Loader2 } from 'lucide-react';

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
    enabled: !!submittedSearchTerm, // Only run query if a search term has been submitted
    initialData: [],
  });
  
  // Separate query for initial load / all records
  const { data: allRecords, isLoading: isLoadingAll, refetch: refetchAll } = useQuery<PixelArtRecord[], Error>({
    queryKey: ['allPixelRecords'],
    queryFn: () => fetchAllRecordsIncludingInactive(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });


  const handleSearch = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    setSubmittedSearchTerm(searchTerm);
    // refetch will be triggered by queryKey change
  };
  
  const displayRecords = submittedSearchTerm ? records : allRecords;
  const currentIsLoading = submittedSearchTerm ? isLoading : isLoadingAll;

  if (error) {
    toast({
      title: 'Error Fetching Records',
      description: error.message,
      variant: 'destructive',
    });
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2 items-center">
        <Input
          type="search"
          placeholder="Search by name, tag, category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow pixel-border bg-input text-foreground focus:border-accent focus:ring-accent"
          aria-label="Search records"
        />
        <Button type="submit" disabled={currentIsLoading} className="bg-accent text-accent-foreground hover:bg-accent/90 pixel-border border-accent-foreground shadow-pixel-accent active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
          {currentIsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <PixelSearchIcon className="h-5 w-5" />}
          <span className="ml-2 hidden sm:inline">Search</span>
        </Button>
      </form>

      {currentIsLoading && (
        <div className="flex justify-center items-center p-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg font-headline">Loading Pixel Data...</p>
        </div>
      )}
      
      {!currentIsLoading && displayRecords && (
        <DataGrid
          records={displayRecords}
          caption={submittedSearchTerm ? `Search results for "${submittedSearchTerm}"` : "All Pixel Records (Active & Inactive)"}
          onEdit={onEditRecord}
          onDelete={onDeleteRecord}
          onRestore={onRestoreRecord}
          showInactive={true}
        />
      )}
      {!currentIsLoading && (!displayRecords || displayRecords.length === 0) && (
         <div className="p-8 text-center pixel-border bg-card shadow-pixel-foreground">
          <p className="text-xl font-headline text-muted-foreground">
            {submittedSearchTerm ? `No records found for "${submittedSearchTerm}".` : "No records available."}
          </p>
          <p className="mt-2 text-muted-foreground">Try a different search term or create some new pixel art!</p>
        </div>
      )}
    </div>
  );
}
