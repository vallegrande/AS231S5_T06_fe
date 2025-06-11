
import type {
  GeminiGenerationRequest,
  GeminiApiTest,
  BackendTranslationRequest,
  BackendTranslationRecord
} from '@/types/backend';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';
console.log(`[API Client] Initial BASE_URL: ${BASE_URL}`);


async function fetchWithErrorHandling<T>(url: string, options?: RequestInit): Promise<T> {
  // This log helps confirm the BASE_URL at the time of a call
  console.log(`[API Client] Using BASE_URL for this call: ${BASE_URL}`);
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  console.log(`[API Client] Attempting to fetch: ${fullUrl}`, options ? `with options: ${JSON.stringify(options.method)}` : '');

  try {
    const response = await fetch(fullUrl, options);
    console.log(`[API Client] Fetch response status for ${fullUrl}: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorMessage = `Backend Error: ${response.status} ${response.statusText} when fetching ${fullUrl}`;
      try {
        const errorBodyText = await response.text(); 
        console.error(`[API Client] Error body from ${fullUrl} (status ${response.status}):`, errorBodyText);
        if (response.headers.get("content-type")?.includes("application/json") || errorBodyText.trim().startsWith('{')) {
          const errorBody = JSON.parse(errorBodyText);
          errorMessage = errorBody.message || errorBody.error || errorMessage;
        } else {
          errorMessage = `${errorMessage}. Response: ${errorBodyText.substring(0, 200)}`;
        }
      } catch (e) {
        console.warn(`[API Client] Could not parse error response from ${fullUrl} as JSON, or error in parsing. Status: ${response.status}. Error:`, e);
      }
      throw new Error(errorMessage);
    }
    
    // Handle cases where the response might be empty (e.g., 204 No Content for DELETE)
    if (response.status === 204) {
      return null as unknown as Promise<T>; // Or appropriate response for a 204
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("text/plain") || contentType?.includes("text/html")) {
      const textResponse = await response.text();
      // Specifically for generate and translate endpoints that return plain text
      if (url.includes("/api/gemini/generate") || url.includes("/api/translation/translate")) {
        return textResponse as unknown as Promise<T>;
      }
      // If it's text but not one of those, try to parse as JSON just in case, but prioritize as text.
      try {
        return JSON.parse(textResponse) as Promise<T>;
      } catch (e) {
        console.warn(`[API Client] Response from ${fullUrl} was text/plain or text/html but not for generate/translate endpoints and not valid JSON. Returning as plain text. Error:`, e);
        return textResponse as unknown as Promise<T>;
      }
    } else if (contentType?.includes("application/json")) {
      return response.json() as Promise<T>;
    } else { // No content-type or unexpected
        console.warn(`[API Client] Unexpected or missing content type: ${contentType} from ${fullUrl}. Attempting to read as JSON, then text.`);
        try {
            // Try to parse as JSON first for unknown content types
            const jsonData = await response.json();
            return jsonData as Promise<T>;
        } catch (jsonError) {
            // If JSON parsing fails, fall back to text. Clone response as body can be read only once.
            const textResponse = await response.clone().text();
            console.warn(`[API Client] Failed to parse response from ${fullUrl} as JSON, returning as text. JSON Error:`, jsonError);
            return textResponse as unknown as Promise<T>;
        }
    }

  } catch (error: any) {
    let detailedErrorMessage = `API Call Failed: ${fullUrl}.`;
    if (error instanceof TypeError && error.message.toLowerCase().includes("failed to fetch")) { 
        detailedErrorMessage += ` This usually means the backend server at ${BASE_URL} is not reachable or a CORS policy is blocking the request.`;
        detailedErrorMessage += `\n\nTroubleshooting steps:`;
        detailedErrorMessage += `\n1. Verify your backend server (and ngrok, if used) is running correctly. Target URL: ${BASE_URL}`;
        detailedErrorMessage += `\n2. Check the backend server's console for any errors.`;
        detailedErrorMessage += `\n3. Ensure the URL '${BASE_URL}' in your .env file (NEXT_PUBLIC_BACKEND_API_URL) is correct and accessible from your browser/environment.`;
        detailedErrorMessage += `\n4. MOST IMPORTANTLY: Check your browser's Network Tab for this failed request. Look for 'CORS error' messages or if the request status is 'failed'.`;
        detailedErrorMessage += `\n5. Your backend MUST have CORS configured to allow requests from this frontend's origin.`;
    } else if (error.message) {
        detailedErrorMessage += ` Error: ${error.message}`;
    }
    
    console.error("---------------------------------------------------------------------");
    console.error(`[API Client] API Call Failed: ${fullUrl}`);
    console.error(`[API Client] Full error message: ${detailedErrorMessage}`);
    console.error("[API Client] Error object:", error);
    if (error.cause) {
      console.error("[API Client] Error cause:", error.cause);
    }
    console.error("---------------------------------------------------------------------");
    
    if (typeof window !== 'undefined') {
      // Removed alert as it can be annoying during development. Errors are logged to console.
      // alert(`Frontend Error: ${detailedErrorMessage}\n\nPlease check your browser's developer console (Network and Console tabs) for more details. The most common causes are the backend server not running, the ngrok URL being incorrect/expired, or a CORS misconfiguration on the backend.`);
    }
    throw new Error(detailedErrorMessage, { cause: error });
  }
}

// Gemini API Calls
export async function generateGeminiContent(prompt: string): Promise<string> {
  const requestBody: GeminiGenerationRequest = { text: prompt };
  return fetchWithErrorHandling<string>(`/api/gemini/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });
}

export async function getGeminiHistory(): Promise<GeminiApiTest[]> {
  return fetchWithErrorHandling<GeminiApiTest[]>(`/api/gemini/history/all`);
}

export async function softDeleteGeminiHistoryItem(id: string): Promise<GeminiApiTest> {
  return fetchWithErrorHandling<GeminiApiTest>(`/api/gemini/history/${id}`, {
    method: 'DELETE',
  });
}

export async function restoreGeminiHistoryItem(id: string): Promise<GeminiApiTest> {
  return fetchWithErrorHandling<GeminiApiTest>(`/api/gemini/history/${id}/restore`, {
    method: 'POST',
  });
}

export async function permanentlyDeleteGeminiHistoryItem(id: string): Promise<void> {
  return fetchWithErrorHandling<void>(`/api/gemini/history/permanent/${id}`, {
    method: 'DELETE',
  });
}

// Translation API Calls
export async function translateText(request: BackendTranslationRequest): Promise<string> {
  return fetchWithErrorHandling<string>(`/api/translation/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
}

export async function getTranslationHistory(): Promise<BackendTranslationRecord[]> {
  return fetchWithErrorHandling<BackendTranslationRecord[]>(`/api/translation/history`);
}

export async function softDeleteTranslationHistoryItem(id: string): Promise<BackendTranslationRecord> {
  return fetchWithErrorHandling<BackendTranslationRecord>(`/api/translation/history/logical/${id}`, {
    method: 'DELETE',
  });
}

export async function restoreTranslationHistoryItem(id: string): Promise<BackendTranslationRecord> {
  return fetchWithErrorHandling<BackendTranslationRecord>(`/api/translation/history/restore/${id}`, {
    method: 'POST',
  });
}

export async function clearTranslationHistory(): Promise<void> {
  return fetchWithErrorHandling<void>(`/api/translation/clear`, {
    method: 'DELETE',
  });
}
