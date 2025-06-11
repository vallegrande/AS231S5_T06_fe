
import type {
  GeminiGenerationRequest,
  GeminiApiTest,
  BackendTranslationRequest,
  BackendTranslationRecord
} from '@/types/backend';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';
// Log principal para verificar la URL base al inicio
console.log(`[API Client] Initial BASE_URL from environment: ${process.env.NEXT_PUBLIC_BACKEND_API_URL}, Effective BASE_URL: ${BASE_URL}`);


async function fetchWithErrorHandling<T>(url: string, options?: RequestInit): Promise<T> {
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  // Log para cada llamada
  console.log(`[API Client] Attempting to fetch: ${fullUrl}`, options ? `with method: ${options.method}` : '');

  try {
    const response = await fetch(fullUrl, options);
    const responseStatus = response.status;
    const responseStatusText = response.statusText;
    const contentType = response.headers.get("content-type");

    console.log(`[API Client] Fetch response for ${fullUrl}: Status ${responseStatus} ${responseStatusText}, Content-Type: ${contentType}`);

    if (!response.ok) {
      let errorMessage = `Backend Error: ${responseStatus} ${responseStatusText} when fetching ${fullUrl}`;
      let errorBodyText = "Could not read error body";
      try {
        errorBodyText = await response.text(); 
        console.error(`[API Client] Error body from ${fullUrl} (status ${responseStatus}):`, errorBodyText.substring(0, 500)); // Log a portion of the error body
        
        // Check if the error body is actually JSON despite a non-JSON content-type or if it's an HTML error page
        if (contentType?.includes("application/json") || errorBodyText.trim().startsWith('{')) {
          const errorBody = JSON.parse(errorBodyText); // This might fail if it's HTML that starts with {
          errorMessage = errorBody.message || errorBody.error || errorMessage;
        } else if (contentType?.includes("text/html")) {
           errorMessage = `[API Client] Backend returned HTML error page for ${fullUrl}. Status: ${responseStatus}. Check backend logs or ngrok. First 200 chars: ${errorBodyText.substring(0,200)}`;
        } else {
          errorMessage = `${errorMessage}. Response: ${errorBodyText.substring(0, 200)}`;
        }
      } catch (e: any) {
        console.warn(`[API Client] Could not parse error response from ${fullUrl} as JSON, or error in parsing. Status: ${responseStatus}. Error: ${e.message}. Original error body (first 200 chars): ${errorBodyText.substring(0,200)}`);
      }
      throw new Error(errorMessage);
    }
    
    if (responseStatus === 204) {
      return null as unknown as Promise<T>; 
    }

    // Specific handling for /generate and /translate endpoints expected to return plain text
    if (url.includes("/api/gemini/generate") || url.includes("/api/translation/translate")) {
      if (contentType?.includes("text/plain") || contentType?.includes("text/html") || !contentType) { // Be more lenient for these
        const textResponse = await response.text();
        console.log(`[API Client] Received plain text for ${fullUrl}: ${textResponse.substring(0,100)}...`);
        return textResponse as unknown as Promise<T>;
      } else {
        const errorMsg = `[API Client] Unexpected content type for text endpoint ${fullUrl}: ${contentType}. Expected text/plain.`;
        console.error(errorMsg);
        // Still try to return text if possible, or throw
        try {
            const textResponse = await response.text();
            console.warn(`[API Client] Returning as text despite unexpected Content-Type for ${fullUrl}: ${textResponse.substring(0,100)}...`);
            return textResponse as unknown as Promise<T>;
        } catch (textErr: any) {
            throw new Error(`${errorMsg} And failed to read body as text: ${textErr.message}`);
        }
      }
    }

    // For other endpoints, expect JSON
    if (contentType?.includes("application/json")) {
      const jsonData = await response.json();
      console.log(`[API Client] Received JSON data from ${fullUrl}`);
      return jsonData as Promise<T>;
    } else {
      // If not JSON and not a 204, it's an unexpected content type for a JSON endpoint
      const responseText = await response.text();
      const errorMsg = `[API Client] Unexpected content type from ${fullUrl}: ${contentType}. Expected application/json. Response (first 200 chars): ${responseText.substring(0,200)}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

  } catch (error: any) {
    let detailedErrorMessage = `[API Client] API Call Failed for ${fullUrl}.`;
    if (error instanceof TypeError && error.message.toLowerCase().includes("failed to fetch")) { 
        detailedErrorMessage += ` This usually means the backend server at ${BASE_URL} is not reachable or a CORS policy is blocking the request.`;
        detailedErrorMessage += `\n\nTroubleshooting steps:`;
        detailedErrorMessage += `\n1. Verify your backend server (and ngrok: ${BASE_URL}) is running correctly.`;
        detailedErrorMessage += `\n2. Check the backend server's console for any errors.`;
        detailedErrorMessage += `\n3. Ensure the URL '${BASE_URL}' in your .env file (NEXT_PUBLIC_BACKEND_API_URL) is correct and accessible.`;
        detailedErrorMessage += `\n4. Check your browser's Network Tab for this failed request. Look for 'CORS error' or 'failed' status.`;
        detailedErrorMessage += `\n5. Your backend MUST have CORS configured if the origin is different.`;
    } else { // For errors thrown by the logic above (e.g. unexpected content type) or other fetch errors
        detailedErrorMessage += ` Error: ${error.message}`;
    }
    
    console.error("---------------------------------------------------------------------");
    console.error(detailedErrorMessage);
    if (error.cause) {
      console.error("[API Client] Error cause:", error.cause);
    }
    console.error("---------------------------------------------------------------------");
    
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
  return fetchWithErrorHandling<GeminiApiTest[]>(`/api/gemini/history`);
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
