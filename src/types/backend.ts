
export interface GeminiGenerationRequest {
  text: string;
}

export interface GeminiApiTest {
  id: string;
  prompt: string;
  response: string;
  timestamp: string; // ISO DateTime string
  deleted: boolean;
}

export interface BackendTranslationRequest {
  from: string; // Language code (e.g., "es", "en", "auto")
  to: string;   // Language code (e.g., "en", "es")
  text: string;
}

export interface BackendTranslationRecord {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  createdAt: string; // ISO DateTime string
  deleted: boolean;
}
