import type { Session } from 'next-auth';
import type { UIMessageStreamWriter } from 'ai';
import type { ChatMessage } from '@/lib/types';

// Tool registry type
export interface ToolRegistryItem {
  name: string;
  tool: any;
  integrationName: string;
  composioToolName: string;
}

// Central tool manager
export class ComposioToolManager {
  private toolRegistry: Map<string, ToolRegistryItem> = new Map();
  private loaded = false;

  // Register a tool
  registerTool(item: ToolRegistryItem) {
    this.toolRegistry.set(item.name, item);
  }

  // Get all registered tools
  getAllTools(
    session: Session,
    dataStream: UIMessageStreamWriter<ChatMessage>,
  ) {
    const tools: Record<string, any> = {};

    for (const [name, item] of this.toolRegistry) {
      tools[name] = item.tool({ session, dataStream });
    }

    return tools;
  }

  // Get tool names for active tools list
  getToolNames(): string[] {
    return Array.from(this.toolRegistry.keys());
  }

  // Get tools by integration
  getToolsByIntegration(integrationName: string): ToolRegistryItem[] {
    return Array.from(this.toolRegistry.values()).filter(
      (item) => item.integrationName === integrationName,
    );
  }

  // Check if loaded
  isLoaded(): boolean {
    return this.loaded;
  }

  // Mark as loaded
  setLoaded(loaded = true) {
    this.loaded = loaded;
  }

  // Get registry size
  getRegistrySize(): number {
    return this.toolRegistry.size;
  }
}

// Global instance
export const composioToolManager = new ComposioToolManager();

// Auto-registration function
export function registerComposioTool(item: ToolRegistryItem) {
  composioToolManager.registerTool(item);
}

// Helper to create and register a tool in one step
export function createAndRegisterComposioTool(item: ToolRegistryItem) {
  registerComposioTool(item);
  return item.tool;
}
