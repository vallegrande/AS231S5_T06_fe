import type { PixelArtRecord } from '@/types/pixeldb';
import { v4 as uuidv4 } from 'uuid'; // Needs: npm install uuid && npm install @types/uuid

// In-memory store for mock data
let records: PixelArtRecord[] = [
  {
    id: '1',
    name: 'Pixel Sword',
    description: 'A mighty fine sword crafted from the rarest pixels.',
    category: 'Weapon',
    tags: ['sharp', 'melee', 'classic'],
    imageUrl: 'https://placehold.co/100x100.png',
    isActive: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
  {
    id: '2',
    name: '8-bit Potion',
    description: 'Restores 50 HP. Tastes like cherries and nostalgia.',
    category: 'Consumable',
    tags: ['health', 'healing', 'retro'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Coin Block',
    description: 'Hit it to get coins! Or a mushroom. Maybe.',
    category: 'Interactive',
    tags: ['item', 'block', 'mystery'],
    isActive: false, // Example of a soft-deleted item
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchRecords(query?: string): Promise<PixelArtRecord[]> {
  await delay(500);
  if (!query) {
    return records.filter(r => r.isActive); // By default, only show active records on general fetch
  }
  const lowerQuery = query.toLowerCase();
  return records.filter(record =>
    (record.name.toLowerCase().includes(lowerQuery) ||
     record.description.toLowerCase().includes(lowerQuery) ||
     record.category.toLowerCase().includes(lowerQuery) ||
     record.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) && record.isActive
  );
}

export async function fetchAllRecordsIncludingInactive(query?: string): Promise<PixelArtRecord[]> {
  await delay(500);
  if (!query) {
    return [...records];
  }
  const lowerQuery = query.toLowerCase();
  return records.filter(record =>
    record.name.toLowerCase().includes(lowerQuery) ||
    record.description.toLowerCase().includes(lowerQuery) ||
    record.category.toLowerCase().includes(lowerQuery) ||
    record.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}


export async function getRecordById(id: string): Promise<PixelArtRecord | null> {
  await delay(300);
  const record = records.find(r => r.id === id);
  return record || null;
}

export async function createRecord(data: Omit<PixelArtRecord, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>): Promise<PixelArtRecord> {
  await delay(700);
  const now = new Date().toISOString();
  const newRecord: PixelArtRecord = {
    ...data,
    id: uuidv4(),
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
  records.push(newRecord);
  return newRecord;
}

export async function updateRecord(id: string, data: Partial<Omit<PixelArtRecord, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PixelArtRecord | null> {
  await delay(600);
  const recordIndex = records.findIndex(r => r.id === id);
  if (recordIndex === -1) {
    return null;
  }
  records[recordIndex] = {
    ...records[recordIndex],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  return records[recordIndex];
}

export async function softDeleteRecord(id: string): Promise<PixelArtRecord | null> {
  await delay(400);
  const recordIndex = records.findIndex(r => r.id === id);
  if (recordIndex === -1 || !records[recordIndex].isActive) {
    return null; // Or throw error if already deleted/not found
  }
  records[recordIndex].isActive = false;
  records[recordIndex].updatedAt = new Date().toISOString();
  return records[recordIndex];
}

export async function restoreRecord(id: string): Promise<PixelArtRecord | null> {
  await delay(400);
  const recordIndex = records.findIndex(r => r.id === id);
  if (recordIndex === -1 || records[recordIndex].isActive) {
    return null; // Or throw error if already active/not found
  }
  records[recordIndex].isActive = true;
  records[recordIndex].updatedAt = new Date().toISOString();
  return records[recordIndex];
}
