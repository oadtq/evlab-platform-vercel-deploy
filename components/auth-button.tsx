import { Button } from '@/components/ui/button';
import { ExternalLink, Shield } from 'lucide-react';
import { useState } from 'react';

interface AuthButtonProps {
  integrationName: string;
  authUrl: string;
  authToolName?: string;
  className?: string;
}

export function AuthButton({
  integrationName,
  authUrl,
  authToolName,
  className = '',
}: AuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthClick = async () => {
    setIsLoading(true);
    try {
      // Open auth URL in new window/tab
      window.open(authUrl, '_blank', 'width=600,height=700');

      // Optional: You could also call the auth tool here if needed
      // This would be useful if you want to track the auth initiation
      if (authToolName) {
        console.log(
          `Initiating authentication for ${integrationName} using tool: ${authToolName}`,
        );
      }
    } catch (error) {
      console.error('Error opening auth URL:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`flex flex-col gap-2 p-4 border rounded-lg bg-muted/50 ${className}`}
    >
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-orange-500" />
        <span className="font-medium">
          {integrationName} Authentication Required
        </span>
      </div>

      <p className="text-sm text-muted-foreground">
        To use {integrationName} features, you need to authenticate with your
        account.
      </p>

      <Button
        onClick={handleAuthClick}
        disabled={isLoading}
        className="w-full"
        variant="default"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Opening Authentication...
          </>
        ) : (
          <>
            <ExternalLink className="w-4 h-4 mr-2" />
            Authenticate with {integrationName}
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground">
        This will open {integrationName} in a new window. After authentication,
        return here and try your request again.
      </p>
    </div>
  );
}

interface AuthButtonsProps {
  authRequests: Array<{
    integrationName: string;
    authUrl: string;
    authToolName?: string;
  }>;
  className?: string;
}

export function AuthButtons({
  authRequests,
  className = '',
}: AuthButtonsProps) {
  if (!authRequests || authRequests.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-6 h-6 text-orange-500" />
        <h3 className="text-lg font-semibold">Authentication Required</h3>
      </div>

      <div className="space-y-3">
        {authRequests.map((request, index) => (
          <AuthButton
            key={`${request.integrationName}-${index}`}
            integrationName={request.integrationName}
            authUrl={request.authUrl}
            authToolName={request.authToolName}
          />
        ))}
      </div>
    </div>
  );
}
