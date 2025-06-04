
import type { 
  GeminiGenerationRequest,
  GeminiApiTest,
  BackendTranslationRequest,
  BackendTranslationRecord 
} from '@/types/backend';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';

async function fetchWithErrorHandling<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      let errorMessage = `Error: ${response.status} ${response.statusText}`;
      try {
        const errorBody = await response.json();
        errorMessage = errorBody.message || errorBody.error || errorMessage;
      } catch (e) {
        // Ignore if error body is not JSON
      }
      throw new Error(errorMessage);
    }
    if (response.headers.get("content-type")?.includes("application/json")) {
      return response.json() as Promise<T>;
    }
    // For text/plain responses
    return response.text() as unknown as Promise<T>;
  } catch (error) {
    console.error(`API call failed: ${url}`, error);
    throw error;
  }
}

// Gemini API Calls
export async function generateGeminiContent(prompt: string): Promise<string> {
  const requestBody: GeminiGenerationRequest = { text: prompt };
  return fetchWithErrorHandling<string>(`${BASE_URL}/api/gemini/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });
}

export async function getGeminiHistory(): Promise<GeminiApiTest[]> {
  return fetchWithErrorHandling<GeminiApiTest[]>(`${BASE_URL}/api/gemini/history`);
}

export async function softDeleteGeminiHistoryItem(id: string): Promise<GeminiApiTest> {
  return fetchWithErrorHandling<GeminiApiTest>(`${BASE_URL}/api/gemini/history/logical/${id}`, {
    method: 'DELETE',
  });
}

export async function restoreGeminiHistoryItem(id: string): Promise<GeminiApiTest> {
  return fetchWithErrorHandling<GeminiApiTest>(`${BASE_URL}/api/gemini/history/restore/${id}`, {
    method: 'POST',
  });
}

// Translation API Calls
export async function translateText(request: BackendTranslationRequest): Promise<string> {
  return fetchWithErrorHandling<string>(`${BASE_URL}/api/translation/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
}

export async function getTranslationHistory(): Promise<BackendTranslationRecord[]> {
  return fetchWithErrorHandling<BackendTranslationRecord[]>(`${BASE_URL}/api/translation/history`);
}

export async function softDeleteTranslationHistoryItem(id: string): Promise<BackendTranslationRecord> {
  return fetchWithErrorHandling<BackendTranslationRecord>(`${BASE_URL}/api/translation/history/logical/${id}`, {
    method: 'DELETE',
  });
}

export async function restoreTranslationHistoryItem(id: string): Promise<BackendTranslationRecord> {
  return fetchWithErrorHandling<BackendTranslationRecord>(`${BASE_URL}/api/translation/history/restore/${id}`, {
    method: 'POST',
  });
}

export async function clearTranslationHistory(): Promise<void> {
  return fetchWithErrorHandling<void>(`${BASE_URL}/api/translation/clear`, {
    method: 'DELETE',
  });
}
