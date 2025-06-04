
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
        const textResponse = await response.text();
        // For Gemini generate, which returns plain text, and translateText
        if (url.includes("/api/gemini/generate") || url.includes("/api/translation/translate")) {
          return textResponse as unknown as Promise<T>;
        }
        // Attempt to parse as JSON if it's not explicitly text for generate/translate
        try {
          return JSON.parse(textResponse) as Promise<T>;
        } catch (e) {
          console.warn(`Response from ${url} was text/plain but not for generate/translate and not valid JSON. Returning as plain text. Error:`, e);
          return textResponse as unknown as Promise<T>;
        }
    }
    
    console.warn(`Unexpected content type: ${contentType} from ${url}. Attempting to read as text.`);
    return response.text() as unknown as Promise<T>;

  } catch (error: any) {
    let detailedErrorMessage = `Failed to fetch from ${url}.`;
    if (error instanceof TypeError && error.message.toLowerCase().includes("failed to fetch")) { 
        detailedErrorMessage += ` This usually means the backend server at ${BASE_URL} is not reachable or a CORS policy is blocking the request.`;
        detailedErrorMessage += `\n\nTroubleshooting steps:`;
        detailedErrorMessage += `\n1. Verify your backend server (and ngrok, if used) is running correctly. Target URL: ${BASE_URL}`;
        detailedErrorMessage += `\n2. Check the backend server's console for any errors.`;
        detailedErrorMessage += `\n3. Ensure the URL '${BASE_URL}' in your .env file is correct and accessible from your browser/environment.`;
        detailedErrorMessage += `\n4. MOST IMPORTANTLY: Check your browser's Network Tab for this failed request. Look for 'CORS error' messages or if the request status is 'failed'.`;
        detailedErrorMessage += `\n5. Your backend MUST have CORS configured to allow requests from this frontend's origin.`;
    } else if (error.message) {
        detailedErrorMessage += ` Error: ${error.message}`;
    }
    
    console.error("---------------------------------------------------------------------");
    console.error(`API Call Failed: ${url}`);
    console.error(`Full error message: ${detailedErrorMessage}`);
    console.error("Error object:", error);
    if (error.cause) {
      console.error("Error cause:", error.cause);
    }
    console.error("---------------------------------------------------------------------");
    
    // Only show alert in client-side environments
    if (typeof window !== 'undefined') {
        alert(`Frontend Error: ${detailedErrorMessage}\n\nPlease check your browser's developer console (Network and Console tabs) for more details. The most common causes are the backend server not running, the ngrok URL being incorrect/expired, or a CORS misconfiguration on the backend.`);
    }
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
