import { composioToolManager } from './tool-manager';

// Import all tools statically to ensure they register
import './index';

export class ComposioToolLoader {
  // Load all tools automatically
  async loadAllTools() {
    if (composioToolManager.isLoaded()) {
      return; // Already loaded
    }

    try {
      // Tools are loaded by importing the index file, which imports all tool modules
      // This triggers the registration of all tools automatically
      console.log('🔧 Loading Composio tools...');

      // The tools are already loaded when we imported './index' above
      // Now we just need to mark them as loaded in the manager
      composioToolManager.setLoaded(true);

      const toolCount = composioToolManager.getRegistrySize();
      console.log(`✅ Loaded ${toolCount} total tools`);
    } catch (error) {
      console.error('❌ Error loading Composio tools:', error);
    }
  }

  // Get loaded tools
  async getLoadedTools(session: any, dataStream: any) {
    await this.loadAllTools();
    return composioToolManager.getAllTools(session, dataStream);
  }

  // Get tool names
  async getToolNames(): Promise<string[]> {
    await this.loadAllTools();
    return composioToolManager.getToolNames();
  }
}

// Global loader instance
export const composioToolLoader = new ComposioToolLoader();
