import { motion } from 'framer-motion';
import { MoreHorizontal, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const integrations = [
  { name: 'Gmail', logo: '/logos/gmail.svg', color: 'bg-white dark:bg-black' },
  {
    name: 'Google Calendar',
    logo: '/logos/google-calendar.svg',
    color: 'bg-white dark:bg-black',
  },
  {
    name: 'Google Docs',
    logo: '/logos/google-docs.svg',
    color: 'bg-white dark:bg-black',
  },
  {
    name: 'Google Sheets',
    logo: '/logos/google-sheets.svg',
    color: 'bg-white dark:bg-black',
  },
  {
    name: 'Notion',
    logo: '/logos/notion.svg',
    color: 'bg-white dark:bg-black',
  },
  {
    name: 'Google Drive',
    logo: '/logos/google-drive.svg',
    color: 'bg-white dark:bg-black',
  },
  { name: 'Slack', logo: '/logos/slack.svg', color: 'bg-white dark:bg-black' },
  { name: 'X', logo: '/logos/twitter.png', color: 'bg-white dark:bg-black' },
  {
    name: 'LinkedIn',
    logo: '/logos/linkedin.svg',
    color: 'bg-white dark:bg-black',
  },
];

interface Integration {
  name: string;
  logo: string;
  connected: boolean;
  description?: string;
}

export const Greeting = () => {
  const [allIntegrations, setAllIntegrations] = useState<Integration[]>([]);
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
        setAllIntegrations(data.integrations);
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

  // Get the first 9 integrations for the greeting display
  const displayIntegrations = allIntegrations.slice(0, 9);
  return (
    <div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20 px-8 size-full flex flex-col justify-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
        className="text-xl font-semibold mb-2"
      >
        Connect your apps
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
        className="text-l text-zinc-500 mb-8"
      >
        Start chatting with your favorite apps and build powerful automations
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.7 }}
        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 gap-4 mb-8"
      >
        {displayIntegrations.map((integration, index) => {
          const staticIntegration = integrations.find(
            (i) => i.name === integration.name,
          );
          return (
            <motion.div
              key={integration.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + index * 0.05 }}
              className="flex flex-col items-center p-4 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow group"
            >
              <div
                className={`w-12 h-12 rounded-lg ${staticIntegration?.color || 'bg-white dark:bg-black'} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform p-2`}
              >
                <Image
                  src={integration.logo}
                  alt={integration.name}
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center leading-tight mb-3 min-h-[40px] flex items-center justify-center">
                {integration.name}
              </span>
              <Button
                size="sm"
                variant={integration.connected ? 'secondary' : 'default'}
                className="text-xs h-7 px-3 mt-auto"
                disabled={
                  integration.connected || connecting === integration.name
                }
                onClick={() => handleConnect(integration.name)}
              >
                {connecting === integration.name ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : null}
                {connecting === integration.name
                  ? 'Connecting...'
                  : integration.connected
                    ? 'Connected'
                    : 'Connect'}
              </Button>
            </motion.div>
          );
        })}

        {/* Etcetera icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 + integrations.length * 0.05 }}
          className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 mb-2 group-hover:scale-110 transition-transform">
            <MoreHorizontal className="w-6 h-6" />
          </div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center leading-tight">
            And many more...
          </span>
        </motion.div>
      </motion.div>

      {/* <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 1.2 }}
        className="text-center text-gray-500 text-sm"
      >
        Start by typing your request in the chat to begin building your workflow
      </motion.div> */}
    </div>
  );
};
