export interface PixelArtRecord {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  isActive: boolean;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}
