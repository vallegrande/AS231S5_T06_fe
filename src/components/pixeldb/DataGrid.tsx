"use client";

import type { PixelArtRecord } from '@/types/pixeldb';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from 'next/image';
import { PixelEditIcon } from '@/components/icons/PixelEditIcon';
import { PixelTrashIcon } from '@/components/icons/PixelTrashIcon';
import { PixelRestoreIcon } from '@/components/icons/PixelRestoreIcon';
import { cn } from '@/lib/utils';

interface DataGridProps {
  records: PixelArtRecord[];
  caption?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
  showInactive?: boolean;
}

export function DataGrid({ records, caption, onEdit, onDelete, onRestore, showInactive = false }: DataGridProps) {
  if (!records || records.length === 0) {
    return <p className="p-4 text-center text-muted-foreground">No records found.</p>;
  }

  const getStatusVariant = (isActive: boolean) => {
    return isActive ? "default" : "secondary";
  };
  
  const getStatusClass = (isActive: boolean) => {
    return isActive ? "bg-green-500/20 text-green-300 border-green-500" : "bg-red-500/20 text-red-300 border-red-500";
  }


  return (
    <div className="overflow-x-auto pixel-border bg-card p-1 shadow-pixel-foreground">
      <Table className="border-collapse">
        {caption && <TableCaption className="py-2 text-base">{caption}</TableCaption>}
        <TableHeader className="bg-muted/30">
          <TableRow className="border-b-2 border-border">
            {showInactive && <TableHead className="w-[100px] pixel-border text-foreground">Status</TableHead>}
            <TableHead className="pixel-border text-foreground">Image</TableHead>
            <TableHead className="pixel-border text-foreground">Name</TableHead>
            <TableHead className="pixel-border text-foreground hidden md:table-cell">Description</TableHead>
            <TableHead className="pixel-border text-foreground hidden lg:table-cell">Category</TableHead>
            <TableHead className="pixel-border text-foreground hidden lg:table-cell">Tags</TableHead>
            <TableHead className="pixel-border text-foreground text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id} className={cn("border-b border-border hover:bg-muted/20", !record.isActive && "opacity-60")}>
              {showInactive && (
                <TableCell className="pixel-border">
                   <Badge variant={getStatusVariant(record.isActive)} className={cn("text-xs font-headline", getStatusClass(record.isActive))}>
                    {record.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
              )}
              <TableCell className="pixel-border">
                {record.imageUrl ? (
                  <Image
                    src={record.imageUrl}
                    alt={record.name}
                    width={48}
                    height={48}
                    className="object-cover w-12 h-12 border-2 border-primary"
                    data-ai-hint="pixel art item"
                  />
                ) : (
                  <div className="w-12 h-12 bg-muted flex items-center justify-center text-muted-foreground text-xs border-2 border-muted-foreground">No Img</div>
                )}
              </TableCell>
              <TableCell className="font-medium pixel-border text-primary-foreground">{record.name}</TableCell>
              <TableCell className="pixel-border hidden md:table-cell max-w-xs truncate">{record.description}</TableCell>
              <TableCell className="pixel-border hidden lg:table-cell">{record.category}</TableCell>
              <TableCell className="pixel-border hidden lg:table-cell">
                <div className="flex flex-wrap gap-1">
                  {record.tags.map(tag => <Badge key={tag} variant="secondary" className="bg-secondary/50 text-secondary-foreground text-xs">{tag}</Badge>)}
                </div>
              </TableCell>
              <TableCell className="text-right pixel-border">
                <div className="flex gap-1 justify-end">
                  {onEdit && record.isActive && (
                    <Button variant="outline" size="sm" onClick={() => onEdit(record.id)} className="pixel-border border-accent text-accent hover:bg-accent hover:text-accent-foreground p-2">
                      <PixelEditIcon className="w-4 h-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  )}
                  {record.isActive && onDelete && (
                    <Button variant="outline" size="sm" onClick={() => onDelete(record.id)} className="pixel-border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground p-2">
                      <PixelTrashIcon className="w-4 h-4" />
                       <span className="sr-only">Delete</span>
                    </Button>
                  )}
                  {!record.isActive && onRestore && (
                     <Button variant="outline" size="sm" onClick={() => onRestore(record.id)} className="pixel-border border-green-500 text-green-500 hover:bg-green-500 hover:text-white p-2">
                      <PixelRestoreIcon className="w-4 h-4" />
                       <span className="sr-only">Restore</span>
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
