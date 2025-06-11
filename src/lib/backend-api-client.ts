
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
        console.error(`[API Client] Error body from ${fullUrl} (status ${responseStatus}):`, errorBodyText.substring(0, 500)); 
        
        if (contentType?.includes("application/json") || errorBodyText.trim().startsWith('{')) {
          const errorBody = JSON.parse(errorBodyText);
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
    
    if (responseStatus === 204) { // No Content
      return null as unknown as Promise<T>; 
    }

    // Specific handling for /generate and /translate endpoints expected to return plain text
    if (url.endsWith("/api/gemini/generate") || url.endsWith("/api/translation/translate")) {
      if (contentType?.includes("text/plain") || contentType?.includes("text/html") || !contentType) {
        const textResponse = await response.text();
        console.log(`[API Client] Received plain text for ${fullUrl}: ${textResponse.substring(0,100)}...`);
        return textResponse as unknown as Promise<T>;
      } else {
        // For these specific text endpoints, if it's not text, it's an issue.
        const responseText = await response.text();
        const errorMsg = `[API Client] Unexpected content type for text endpoint ${fullUrl}: ${contentType}. Expected text/plain. Response: ${responseText.substring(0,200)}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
    }

    // For other endpoints, strictly expect JSON
    if (contentType?.includes("application/json")) {
      const jsonData = await response.json();
      console.log(`[API Client] Received JSON data from ${fullUrl}`);
      return jsonData as Promise<T>;
    } else {
      // If not JSON and not a 204, and not one of the text endpoints, it's an unexpected content type
      const responseText = await response.text(); // Read the text to include in the error
      let detailedErrorMessage = `[API Client] Unexpected content type from ${fullUrl}: Received '${contentType || 'Unknown/Missing Content-Type'}'. Expected 'application/json'.\n`;

      if (contentType?.includes('text/html')) {
        detailedErrorMessage += `CRITICAL ERROR: Received HTML page instead of JSON.\n`;
        detailedErrorMessage += `This often happens with ngrok tunnels showing an interstitial 'visit site' page.\n`;
        detailedErrorMessage += `TROUBLESHOOTING STEPS:\n`;
        detailedErrorMessage += `1. NGROK COMMAND: Ensure ngrok was started with: ngrok http YOUR_PORT --request-header-add "ngrok-skip-browser-warning:true"\n`;
        detailedErrorMessage += `2. BROWSER DIRECT ACCESS: Open ${fullUrl} DIRECTLY in THIS browser. If you see an ngrok page, click the 'Visit Site' button.\n`;
        detailedErrorMessage += `3. NGROK URL IN .ENV: Verify NEXT_PUBLIC_BACKEND_API_URL in .env is '${BASE_URL}' and that the Next.js dev server was RESTARTED after any .env changes.\n`;
        detailedErrorMessage += `4. CORS: Verify backend CORS configuration allows your frontend origin (though this specific error is usually ngrok's HTML page).\n`;
        detailedErrorMessage += `Response (first 300 chars): ${responseText.substring(0, 300)}\n`;
      } else {
        detailedErrorMessage += `Response (first 300 chars): ${responseText.substring(0, 300)}\n`;
      }
      
      console.error("---------------------------------------------------------------------");
      console.error(detailedErrorMessage);
      console.error("Full Response Headers from ngrok/server:", Object.fromEntries(response.headers.entries()));
      console.error("---------------------------------------------------------------------");
      throw new Error(detailedErrorMessage);
    }

  } catch (error: any) {
    let detailedApiFailedMessage = `[API Client] API Call Failed for ${fullUrl}.`;
    if (error instanceof TypeError && error.message.toLowerCase().includes("failed to fetch")) { 
        detailedApiFailedMessage += ` This usually means the backend server at ${BASE_URL} is not reachable or a CORS policy is blocking the request.`;
        detailedApiFailedMessage += `\n\nTroubleshooting steps:`;
        detailedApiFailedMessage += `\n1. Verify your backend server (and ngrok: ${BASE_URL}) is running correctly.`;
        detailedApiFailedMessage += `\n2. Check the backend server's console for any errors.`;
        detailedApiFailedMessage += `\n3. Ensure the URL '${BASE_URL}' in your .env file (NEXT_PUBLIC_BACKEND_API_URL) is correct and accessible from your development environment.`;
        detailedApiFailedMessage += `\n4. Check your browser's Network Tab for this failed request. Look for 'CORS error' or 'failed' status.`;
        detailedApiFailedMessage += `\n5. Your backend MUST have CORS configured if the origin is different (Your current backend CORS config seems okay: '*')`;
    } else { 
        detailedApiFailedMessage += ` Error: ${error.message}`;
    }
    
    // Avoid double logging if the error is the one we just constructed above
    if (!error.message.startsWith("[API Client] Unexpected content type")) {
      console.error("---------------------------------------------------------------------");
      console.error(detailedApiFailedMessage);
      if (error.cause) {
        console.error("[API Client] Error cause:", error.cause);
      }
      console.error("---------------------------------------------------------------------");
    }
    
    // Re-throw the original error if it's one we constructed, or the new detailed one.
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
  return fetchWithErrorHandling<GeminiApiTest>(`${BASE_URL}/api/gemini/history/${id}`, {
    method: 'DELETE',
  });
}

export async function restoreGeminiHistoryItem(id: string): Promise<GeminiApiTest> {
  return fetchWithErrorHandling<GeminiApiTest>(`${BASE_URL}/api/gemini/history/${id}/restore`, {
    method: 'POST',
  });
}

export async function permanentlyDeleteGeminiHistoryItem(id: string): Promise<void> {
  return fetchWithErrorHandling<void>(`${BASE_URL}/api/gemini/history/permanent/${id}`, {
    method: 'DELETE',
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
