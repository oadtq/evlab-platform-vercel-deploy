'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Integration {
  name: string;
  logo: string;
  connected: boolean;
  description?: string;
}

export const IntegrationManager = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [authWindow, setAuthWindow] = useState<Window | null>(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/integrations');
      if (response.ok) {
        const data = await response.json();
        setIntegrations(data.integrations);
      } else {
        console.error('Failed to fetch integrations');
      }
    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (integrationName: string) => {
    setConnecting(integrationName);

    try {
      const response = await fetch('/api/integrations/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ integration: integrationName }),
      });

      if (response.ok) {
        const data = await response.json();

        // Open OAuth window
        const authWindow = window.open(
          data.redirectUrl,
          'authWindow',
          'width=600,height=700,scrollbars=yes,resizable=yes',
        );

        setAuthWindow(authWindow);

        // Poll for connection status
        const pollConnection = async () => {
          try {
            const statusResponse = await fetch(
              `/api/integrations/auth?integration=${encodeURIComponent(integrationName)}`,
            );

            if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              if (statusData.connected) {
                toast.success(`${integrationName} connected successfully!`);
                fetchIntegrations(); // Refresh integrations
                if (authWindow) {
                  authWindow.close();
                }
                return;
              }
            }
          } catch (error) {
            console.error('Error checking connection status:', error);
          }

          // Continue polling if not connected yet
          setTimeout(pollConnection, 2000);
        };

        // Start polling after a short delay
        setTimeout(pollConnection, 2000);

        // Fallback: close auth window after 5 minutes
        setTimeout(
          () => {
            if (authWindow && !authWindow.closed) {
              authWindow.close();
            }
          },
          5 * 60 * 1000,
        );
      } else {
        const errorData = await response.json();
        toast.error(`Failed to connect ${integrationName}: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error connecting integration:', error);
      toast.error(`Failed to connect ${integrationName}`);
    } finally {
      setConnecting(null);
    }
  };

  if (loading) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Integrations</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-96 p-4">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">Integrations</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-4">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Connect your apps
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {integrations.map((integration, index) => (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-all group h-33"
              >
                <div className="w-8 h-8 rounded-md bg-white dark:bg-black flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Image
                    src={integration.logo}
                    alt={integration.name}
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                </div>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight mb-2 min-h-[32px] flex items-center justify-center px-1">
                  {integration.name}
                </div>
                <Button
                  size="sm"
                  variant={integration.connected ? 'secondary' : 'default'}
                  className="text-xs h-6 px-2 mt-auto"
                  disabled={
                    integration.connected || connecting === integration.name
                  }
                  onClick={() => handleConnect(integration.name)}
                >
                  {connecting === integration.name ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : integration.connected ? (
                    'Connected'
                  ) : (
                    'Connect'
                  )}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
