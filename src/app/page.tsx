import { HomeClient } from "./components/HomeClient";

// Ensure this component is dynamically rendered to pick up runtime environment variables
export const dynamic = 'force-dynamic';

export default function Home() {
  // 1. Check for server-side configuration (Runtime)
  // These variables are only available on the server and are NOT exposed to the client bundle
  const serverApiKey = process.env.DE_BACKEND_API_KEY;

  // We prioritize server-side configuration for security.
  const hasServerKey = !!serverApiKey && serverApiKey.length > 0;

  // If we have a server key, we pass a placeholder to the client.
  // The middleware will intercept requests and inject the real key.
  const initialApiKey = hasServerKey ? "SERVER_MANAGED" : "";

  // OpenRouter Defaults - Hardcoded as requested
  const initialBaseUrl = "https://openrouter.ai/api";
  const initialEndpoint = "/v1/chat/completions";
  const initialModelName = "openrouter/auto"; // Changed default to 'openrouter/auto' as it's a good default

  return (
    <HomeClient
      initialApiKey={initialApiKey}
      initialBaseUrl={initialBaseUrl}
      initialEndpoint={initialEndpoint}
      initialModelName={initialModelName}
      isConfigured={hasServerKey}
    />
  );
}
