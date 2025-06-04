"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QueryTab } from '@/components/pixeldb/QueryTab';
import { CreateTab } from '@/components/pixeldb/CreateTab';
import { UpdateTab } from '@/components/pixeldb/UpdateTab';
import { DeleteTab } from '@/components/pixeldb/DeleteTab';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PixelSearchIcon } from '@/components/icons/PixelSearchIcon';
import { PixelPlusIcon } from '@/components/icons/PixelPlusIcon';
import { PixelEditIcon } from '@/components/icons/PixelEditIcon';
import { PixelTrashIcon } from '@/components/icons/PixelTrashIcon';

type TabValue = "query" | "create" | "update" | "delete";

export default function PixelDBExplorerPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("query");
  const [recordIdToUpdate, setRecordIdToUpdate] = useState<string | null>(null);
  const [recordIdToDelete, setRecordIdToDelete] = useState<string | null>(null);

  const handleEditRecord = (id: string) => {
    setRecordIdToUpdate(id);
    setActiveTab("update");
  };

  const handleDeleteRecord = (id: string) => {
    setRecordIdToDelete(id);
    setActiveTab("delete");
  };
  
  const handleRestoreRecord = (id: string) => {
    setRecordIdToDelete(id); // Use the same mechanism for ID passing
    setActiveTab("delete"); // The delete tab handles restore as well
  };

  const clearRecordIdToUpdate = () => setRecordIdToUpdate(null);
  const clearRecordIdToDelete = () => setRecordIdToDelete(null);

  const handleRecordCreated = () => {
    // Optionally switch to query tab or clear form etc.
    setActiveTab("query");
  }

  const handleRecordUpdated = () => {
    setActiveTab("query");
  }
  
  const handleRecordDeletedOrRestored = () => {
     setActiveTab("query");
  }


  return (
    <div className="min-h-screen container mx-auto p-4 md:p-8 font-body">
      <Card className="bg-card/50 pixel-border shadow-pixel-primary mb-8">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl md:text-5xl font-headline text-primary tracking-wider">
            PixelDB Explorer
          </CardTitle>
          <CardDescription className="text-muted-foreground text-lg">
            Manage your retro database with style!
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1 p-1 bg-muted/30 h-auto pixel-border">
          <TabsTrigger value="query" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-pixel-primary pixel-border border-transparent hover:bg-primary/20 transition-all duration-150">
            <PixelSearchIcon className="w-5 h-5 mr-2" /> Query
          </TabsTrigger>
          <TabsTrigger value="create" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-pixel-primary pixel-border border-transparent hover:bg-primary/20 transition-all duration-150">
            <PixelPlusIcon className="w-5 h-5 mr-2" /> Create
          </TabsTrigger>
          <TabsTrigger value="update" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-pixel-primary pixel-border border-transparent hover:bg-primary/20 transition-all duration-150">
            <PixelEditIcon className="w-5 h-5 mr-2" /> Update
          </TabsTrigger>
          <TabsTrigger value="delete" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-pixel-primary pixel-border border-transparent hover:bg-primary/20 transition-all duration-150">
            <PixelTrashIcon className="w-5 h-5 mr-2" /> Delete/Restore
          </TabsTrigger>
        </TabsList>

        <TabsContent value="query" className="mt-4 animate-fade-in">
          <QueryTab 
            onEditRecord={handleEditRecord} 
            onDeleteRecord={handleDeleteRecord}
            onRestoreRecord={handleRestoreRecord}
          />
        </TabsContent>
        <TabsContent value="create" className="mt-4 animate-fade-in">
          <CreateTab onRecordCreated={handleRecordCreated} />
        </TabsContent>
        <TabsContent value="update" className="mt-4 animate-fade-in">
          <UpdateTab 
            recordIdToUpdate={recordIdToUpdate} 
            onRecordUpdated={handleRecordUpdated}
            clearRecordIdToUpdate={clearRecordIdToUpdate}
          />
        </TabsContent>
        <TabsContent value="delete" className="mt-4 animate-fade-in">
          <DeleteTab 
            recordIdToDelete={recordIdToDelete} 
            onRecordDeletedOrRestored={handleRecordDeletedOrRestored}
            clearRecordIdToDelete={clearRecordIdToDelete}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
