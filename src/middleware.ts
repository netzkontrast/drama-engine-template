import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SERVER_MANAGED_KEY = "SERVER_MANAGED";

async function sendFetch(req: NextRequest) {
  // A default error response
  const errorResponse: NextResponse = NextResponse.json({ error: 'Unknown error.' }, { status: 502 });

  const origHeaders = req.headers;

  let apiKey = origHeaders.get("DE_BACKEND_API_KEY") || "";
  let baseUrl = origHeaders.get("DE_BASE_URL") || "";

  // SECURITY: If server-side configuration is present, we MUST prioritize it
  // and ignore client-provided headers to prevent SSRF and API key leakage.

  const serverApiKey = process.env.DE_BACKEND_API_KEY || process.env.NEXT_PUBLIC_DE_BACKEND_API_KEY;
  const serverBaseUrl = process.env.DE_BASE_URL || process.env.NEXT_PUBLIC_DE_BASE_URL;

  // If server-side API Key is set, we use it.
  // We strictly ignore the client header if the server key is configured,
  // or if the client explicitly requests "SERVER_MANAGED".
  if (serverApiKey || apiKey === SERVER_MANAGED_KEY) {
    apiKey = serverApiKey || "";
  }

  // If server-side Base URL is set, we MUST use it and ignore the client header.
  // This prevents a malicious client from redirecting the request (with the secret key) to their own server.
  if (serverBaseUrl) {
    baseUrl = serverBaseUrl;
  }

  // Trim to avoid accidental whitespace issues
  apiKey = apiKey.trim();
  baseUrl = baseUrl.trim();

  // Remove trailing slash from base URL to avoid double slashes when joining paths
  if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
  }

  if (!apiKey || !baseUrl) {
    console.error("Missing API Key or Base URL configuration.");
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
