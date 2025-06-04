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
import { PixelSearchIcon } from '../icons/PixelSearchIcon';
import { PixelTrashIcon } from '../icons/PixelTrashIcon';
import { PixelRestoreIcon } from '../icons/PixelRestoreIcon';
import { Loader2 } from 'lucide-react';
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
        queryClient.invalidateQueries({ queryKey: ['pixelRecord', deletedRecord.id] }); // For update tab if same ID
        toast({
          title: 'Record Soft Deleted! 🗑️',
          description: `"${deletedRecord.name}" has been marked as inactive.`,
        });
        onRecordDeletedOrRestored();
        clearRecordIdToDelete();
        setCurrentRecordId(null);
        setIdInput("");
      } else {
         toast({ title: 'Deletion Failed', description: 'Record not found or already inactive.', variant: 'destructive' });
      }
    },
    onError: (error) => {
      toast({
        title: 'Deletion Failed 😢',
        description: error.message || 'Could not soft delete the record.',
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
          title: 'Record Restored! ✨',
          description: `"${restoredRecord.name}" has been marked as active.`,
        });
        onRecordDeletedOrRestored();
        clearRecordIdToDelete();
        setCurrentRecordId(null);
        setIdInput("");
      } else {
        toast({ title: 'Restore Failed', description: 'Record not found or already active.', variant: 'destructive' });
      }
    },
    onError: (error) => {
      toast({ title: 'Restore Failed', description: error.message, variant: 'destructive' });
    },
  });

  const handleFetchRecord = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (idInput.trim()) {
      setCurrentRecordId(idInput.trim());
    } else {
      toast({ title: "Missing ID", description: "Please enter a record ID.", variant: "destructive" });
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
     toast({ title: 'Error Fetching Record', description: fetchError.message, variant: 'destructive' });
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card className="pixel-border bg-card shadow-pixel-foreground">
        <CardHeader>
          <CardTitle className="text-primary font-headline">Manage Record Status</CardTitle>
          <CardDescription>Enter Record ID to soft delete or restore.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFetchRecord} className="flex gap-2 items-center">
            <Input
              placeholder="Enter Record ID"
              value={idInput}
              onChange={(e) => setIdInput(e.target.value)}
              className="flex-grow pixel-border bg-input text-foreground focus:border-accent focus:ring-accent"
              aria-label="Record ID to delete or restore"
            />
            <Button type="submit" disabled={isLoadingRecord || !idInput} className="bg-accent text-accent-foreground hover:bg-accent/90 pixel-border border-accent-foreground shadow-pixel-accent active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
              {isLoadingRecord ? <Loader2 className="h-5 w-5 animate-spin" /> : <PixelSearchIcon className="h-5 w-5" />}
              <span className="ml-2 hidden sm:inline">Fetch Record</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoadingRecord && currentRecordId && (
        <div className="flex justify-center items-center p-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg font-headline">Fetching Record...</p>
        </div>
      )}

      {recordToDelete && currentRecordId && (
        <Card className="pixel-border bg-card shadow-pixel-foreground animate-fade-in">
          <CardHeader>
            <CardTitle className="font-headline text-xl">{recordToDelete.name}</CardTitle>
            <Badge variant={recordToDelete.isActive ? "default" : "secondary"} className={cn("w-fit", recordToDelete.isActive ? "bg-green-500/20 text-green-300 border-green-500" : "bg-red-500/20 text-red-300 border-red-500")}>
              Status: {recordToDelete.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            {recordToDelete.imageUrl && 
              <Image src={recordToDelete.imageUrl} alt={recordToDelete.name} width={80} height={80} className="border-2 border-primary float-right ml-4 mb-2" data-ai-hint="pixel art item"/>}
            <p><strong className="text-foreground/80">ID:</strong> {recordToDelete.id}</p>
            <p><strong className="text-foreground/80">Category:</strong> {recordToDelete.category}</p>
            <p><strong className="text-foreground/80">Description:</strong> {recordToDelete.description}</p>
          </CardContent>
          <CardFooter>
            {recordToDelete.isActive ? (
              <Button
                variant="destructive"
                onClick={() => setIsConfirmDeleteDialogOpen(true)}
                disabled={deleteMutation.isPending}
                className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 pixel-border border-destructive-foreground shadow-[3px_3px_0px_hsl(var(--destructive-foreground))] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                {deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PixelTrashIcon className="mr-2 h-4 w-4" />}
                Soft Delete Record
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={() => setIsConfirmRestoreDialogOpen(true)}
                disabled={restoreMutation.isPending}
                className="w-full bg-green-600 text-white hover:bg-green-600/90 pixel-border border-green-300 shadow-[3px_3px_0px_hsl(var(--green-300))] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                {restoreMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PixelRestoreIcon className="mr-2 h-4 w-4" />}
                Restore Record
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
      
      {!isLoadingRecord && currentRecordId && !recordToDelete && (
         <p className="p-4 text-center text-muted-foreground pixel-border bg-card shadow-pixel-foreground">Record with ID "{currentRecordId}" not found.</p>
      )}

      <AlertDialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
        <AlertDialogContent className="pixel-border bg-background shadow-pixel-primary">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-primary">Confirm Soft Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to soft delete "{recordToDelete?.name}"? This will mark the record as inactive but it can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="pixel-border hover:bg-muted/50 active:translate-x-[1px] active:translate-y-[1px]">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 pixel-border border-destructive-foreground shadow-[2px_2px_0px_hsl(var(--destructive-foreground))] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isConfirmRestoreDialogOpen} onOpenChange={setIsConfirmRestoreDialogOpen}>
        <AlertDialogContent className="pixel-border bg-background shadow-pixel-primary">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-primary">Confirm Restore</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore "{recordToDelete?.name}"? This will mark the record as active.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="pixel-border hover:bg-muted/50 active:translate-x-[1px] active:translate-y-[1px]">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRestore} className="bg-green-600 text-white hover:bg-green-600/90 pixel-border border-green-300 shadow-[2px_2px_0px_hsl(var(--green-300))] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">
              Confirm Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
