import { HomeClient } from "./components/HomeClient";

// Ensure this component is dynamically rendered to pick up runtime environment variables
export const dynamic = 'force-dynamic';

export default function Home() {
  // 1. Check for server-side configuration (Runtime)
  // These variables are only available on the server and are NOT exposed to the client bundle
  // unless prefixed with NEXT_PUBLIC_ (which we check separately).
  const serverApiKey = process.env.DE_BACKEND_API_KEY;
  const serverBaseUrl = process.env.DE_BASE_URL;
  const serverEndpoint = process.env.DE_ENDPOINT_URL;

  // 2. Check for client-side configuration (Build time / Runtime)
  const clientApiKey = process.env.NEXT_PUBLIC_DE_BACKEND_API_KEY;
  const clientBaseUrl = process.env.NEXT_PUBLIC_DE_BASE_URL;
  const clientEndpoint = process.env.NEXT_PUBLIC_DE_ENDPOINT_URL;
  const clientModelName = process.env.NEXT_PUBLIC_DE_MODEL_NAME;

  // Determine effective values
  // We prioritize server-side configuration for security where possible.

  const hasServerKey = !!serverApiKey && serverApiKey.length > 0;
  const hasClientKey = !!clientApiKey && clientApiKey.length > 0;

  const isConfigured = hasServerKey || hasClientKey;

  // If we have a server key, we pass a placeholder to the client.
  // The middleware will intercept requests and inject the real key.
  // If we only have a client key, we pass it through.
  const initialApiKey = hasServerKey ? "SERVER_MANAGED" : (clientApiKey || "");

  const initialBaseUrl = serverBaseUrl || clientBaseUrl || "https://openrouter.ai/api";
  const initialEndpoint = serverEndpoint || clientEndpoint || "/v1/completions";
  const initialModelName = clientModelName || "stepfun/step-3.5-flash:free";

  return (
    <HomeClient
      initialApiKey={initialApiKey}
      initialBaseUrl={initialBaseUrl}
      initialEndpoint={initialEndpoint}
      initialModelName={initialModelName}
      isConfigured={isConfigured}
    />
  );
}
