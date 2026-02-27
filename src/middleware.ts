import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

async function sendFetch(req: NextRequest) {
  // A default error response
  const errorResponse: NextResponse = NextResponse.json({ error: 'Unknown error.' }, { status: 502 });

  const origHeaders = req.headers;
  // Fallback to server-side environment variables if headers are missing
  const apiKey = origHeaders.get("DE_BACKEND_API_KEY") || process.env.DE_BACKEND_API_KEY || process.env.NEXT_PUBLIC_DE_BACKEND_API_KEY || "";
  const baseUrl = origHeaders.get("DE_BASE_URL") || process.env.DE_BASE_URL || process.env.NEXT_PUBLIC_DE_BASE_URL || "";

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

  console.log(`[Middleware] Forwarding request to: ${newURL}`);

  try {
    const response = await fetch(newURL, {
      method: req.method,
      headers: newHeaders,
      body: req.body,
    });

    if (!response.ok) {
        console.warn(`[Middleware] Backend responded with status: ${response.status} ${response.statusText}`);
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
