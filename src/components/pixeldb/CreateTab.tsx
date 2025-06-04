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
        title: '¡Registro Creado! ✨',
        description: `"${newRecord.name}" ha sido añadido a la base de datos.`,
      });
      onRecordCreated();
    },
    onError: (error) => {
      toast({
        title: 'Creación Fallida 😢',
        description: error.message || 'No se pudo crear el registro.',
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
        submitButtonText="Crear Registro Pixel"
      />
    </div>
  );
}
