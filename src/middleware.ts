import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SERVER_MANAGED_KEY = "SERVER_MANAGED";
const OPENROUTER_BASE_URL = "https://openrouter.ai/api";

async function sendFetch(req: NextRequest) {
  // A default error response
  const errorResponse: NextResponse = NextResponse.json({ error: 'Unknown error.' }, { status: 502 });

  const origHeaders = req.headers;

  let apiKey = origHeaders.get("DE_BACKEND_API_KEY") || "";

  // SECURITY: If server-side configuration is present, we MUST prioritize it
  // and ignore client-provided headers to prevent API key leakage.
  const serverApiKey = process.env.DE_BACKEND_API_KEY;

  // If server-side API Key is set, we use it.
  // We strictly ignore the client header if the server key is configured,
  // or if the client explicitly requests "SERVER_MANAGED".
  if (serverApiKey || apiKey === SERVER_MANAGED_KEY) {
    apiKey = serverApiKey || "";
  }

  // Trim to avoid accidental whitespace issues
  apiKey = apiKey.trim();

  // Hardcoded Base URL for OpenRouter
  const baseUrl = OPENROUTER_BASE_URL;

  if (!apiKey) {
    console.error("Missing API Key configuration.");
    return NextResponse.json({ error: 'Missing configuration.' }, { status: 500 });
  }

  // Create a headers object
  const newHeaders = new Headers();

  // Add authorization and other relevant headers
  newHeaders.set('Authorization', `Bearer ${apiKey}`);
  newHeaders.set('Accept', 'application/json');
  newHeaders.set('Content-Type', 'application/json');

  const newURL = new URL(baseUrl + req.nextUrl.pathname).toString();

  const maskedKey = apiKey.substring(0, 4) + "****";
  console.log(`[Middleware] Forwarding request to: ${newURL} with Key: ${maskedKey}`);

  try {
    const response = await fetch(newURL, {
      method: req.method,
      headers: newHeaders,
      body: req.body,
    });

    if (!response.ok) {
        console.warn(`[Middleware] Backend responded with status: ${response.status} ${response.statusText}`);
        // Clone the response to read body for more details on the error
        const errorBody = await response.clone().text();
        console.warn(`[Middleware] Error body: ${errorBody.substring(0, 500)}`);
    }

    return response;
  } catch (error: any) {
    console.error("[Middleware] Fetch error:", error);
    return errorResponse;
  }
}

export async function middleware(request: NextRequest) {
  return await sendFetch(request);
}

// Use the middleware only for certain endpoints
export const config = {
  matcher: ['/v1/completions', '/v1/chat/completions']
};
