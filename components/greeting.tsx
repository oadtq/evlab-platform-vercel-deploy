import { motion } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';
import Image from 'next/image';

const integrations = [
  { name: 'Gmail', logo: '/logos/gmail.svg', color: 'bg-white' },
  {
    name: 'Google Calendar',
    logo: '/logos/google-calendar.svg',
    color: 'bg-white',
  },
  { name: 'Google Docs', logo: '/logos/google-docs.svg', color: 'bg-white' },
  {
    name: 'Google Sheets',
    logo: '/logos/google-sheets.svg',
    color: 'bg-white',
  },
  { name: 'Notion', logo: '/logos/notion.svg', color: 'bg-white' },
  { name: 'Airtable', logo: '/logos/airtable.svg', color: 'bg-white' },
  { name: 'Slack', logo: '/logos/slack.svg', color: 'bg-white' },
  { name: 'X', logo: '/logos/twitter.png', color: 'bg-white' },
  { name: 'Linear', logo: '/logos/linear.png', color: 'bg-white' },
];

export const Greeting = () => {
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
        Chat with your daily apps
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
        {integrations.map((integration, index) => (
          <motion.div
            key={integration.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 + index * 0.05 }}
            className="flex flex-col items-center p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div
              className={`w-12 h-12 rounded-lg ${integration.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform p-2`}
            >
              <Image
                src={integration.logo}
                alt={integration.name}
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <span className="text-sm font-medium text-gray-700 text-center leading-tight">
              {integration.name}
            </span>
          </motion.div>
        ))}

        {/* Etcetera icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 + integrations.length * 0.05 }}
          className="flex flex-col items-center p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 mb-2 group-hover:scale-110 transition-transform">
            <MoreHorizontal className="w-6 h-6" />
          </div>
          <span className="text-sm font-medium text-gray-500 text-center leading-tight">
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
