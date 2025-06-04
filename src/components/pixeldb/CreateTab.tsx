"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRecord } from '@/lib/pixeldb-api';
import { RecordForm, type RecordFormData, recordSchema } from './RecordForm';
import { useToast } from '@/hooks/use-toast';
import type { PixelArtRecord } from '@/types/pixeldb';

interface CreateTabProps {
  onRecordCreated: () => void;
}

export function CreateTab({ onRecordCreated }: CreateTabProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation<PixelArtRecord, Error, Omit<PixelArtRecord, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>>({
    mutationFn: createRecord,
    onSuccess: (newRecord) => {
      queryClient.invalidateQueries({ queryKey: ['pixelRecords'] });
      queryClient.invalidateQueries({ queryKey: ['allPixelRecords'] });
      toast({
        title: 'Record Created! ✨',
        description: `"${newRecord.name}" has been added to the database.`,
      });
      onRecordCreated(); // Potentially switch tab or clear form
    },
    onError: (error) => {
      toast({
        title: 'Creation Failed 😢',
        description: error.message || 'Could not create the record.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async (data: RecordFormData) => {
    const tagsArray = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    const recordToCreate = { ...data, tags: tagsArray };
    await mutation.mutateAsync(recordToCreate);
  };

  return (
    <div className="p-4 md:p-6">
      <RecordForm
        onSubmit={handleSubmit}
        isSubmitting={mutation.isPending}
        submitButtonText="Create Pixel Record"
      />
    </div>
  );
}
