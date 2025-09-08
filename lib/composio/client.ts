import { Composio } from '@composio/core';
import { VercelProvider } from '@composio/vercel';

let composioInstance: Composio<any> | null = null;

export function getComposioClient() {
  if (!composioInstance) {
    // You'll need to set this in your environment variables
    const apiKey = process.env.COMPOSIO_API_KEY;

    if (!apiKey) {
      throw new Error('COMPOSIO_API_KEY environment variable is required');
    }

    composioInstance = new Composio({
      apiKey,
      provider: new VercelProvider(),
    });
  }

  return composioInstance;
}

export { Composio };
