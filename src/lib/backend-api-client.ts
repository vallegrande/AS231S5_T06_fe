
import type {
  GeminiGenerationRequest,
  GeminiApiTest,
  BackendTranslationRequest,
  BackendTranslationRecord
} from '@/types/backend';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';

async function fetchWithErrorHandling<T>(url: string, options?: RequestInit): Promise<T> {
  console.log(`Attempting to fetch: ${url}`, options ? `with options: ${JSON.stringify(options.method)}` : '');
  try {
    const response = await fetch(url, options);
    console.log(`Fetch response status for ${url}: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorMessage = `Backend Error: ${response.status} ${response.statusText} when fetching ${url}`;
      try {
        const errorBodyText = await response.text(); // Get text first to see what it is
        console.error(`Error body from ${url} (status ${response.status}):`, errorBodyText);
        // Attempt to parse as JSON only if content type suggests it or if it's a common error format
        if (response.headers.get("content-type")?.includes("application/json") || errorBodyText.trim().startsWith('{')) {
          const errorBody = JSON.parse(errorBodyText);
          errorMessage = errorBody.message || errorBody.error || errorMessage;
        } else {
          // Use the plain text error body if not JSON
          errorMessage = `${errorMessage}. Response: ${errorBodyText.substring(0, 200)}`; // Limit length
        }
      } catch (e) {
        console.warn(`Could not parse error response from ${url} as JSON, or error in parsing. Status: ${response.status}. Error:`, e);
        // errorMessage is already set with status and statusText
      }
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return response.json() as Promise<T>;
    }
    // For text/plain responses (like your Gemini generate and translate endpoints)
    if (contentType?.includes("text/plain") || contentType?.includes("text/html") || !contentType) { // Also handle cases with missing or generic content types
        return response.text() as unknown as Promise<T>;
    }
    
    console.warn(`Unexpected content type: ${contentType} from ${url}. Attempting to read as text.`);
    return response.text() as unknown as Promise<T>;

  } catch (error: any) {
    let detailedErrorMessage = `Failed to fetch from ${url}.`;
    if (error instanceof TypeError) { // Often network errors, CORS
        detailedErrorMessage += ` This might be a network issue or a CORS problem. Original error: ${error.message}`;
    } else if (error.message) {
        detailedErrorMessage += ` Error: ${error.message}`;
    }
    console.error(`API call failed: ${url}. Full error object:`, error, "Error cause:", error.cause);
    // For CORS issues, often the 'error' object itself is a simple TypeError, check network tab for more.
    alert(`Frontend Error: ${detailedErrorMessage}\n\nCheck the browser console and network tab for more details. Ensure the backend is running and accessible at ${BASE_URL} and CORS is configured.`);
    throw new Error(detailedErrorMessage, { cause: error });
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
