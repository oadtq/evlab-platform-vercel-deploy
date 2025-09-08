import { createComposioTool } from '../base';
import { registerComposioTool } from '../tool-manager';
import { composioAuthManager } from '@/lib/composio/auth-manager';
import { z } from 'zod';

// NOTION_ADD_MULTIPLE_PAGE_CONTENT
export const notionAddMultiplePageContent = createComposioTool({
  name: 'notionAddMultiplePageContent',
  description:
    "Efficiently adds multiple standard content blocks to a notion page in a single api call with automatic markdown parsing. the 'content' field in notionrichtext blocks now automatically detects and parses markdown formatting including headers (# ## ###), bold (**text**), italic (*text*), strikethrough (~~text~~), inline code (`code`), links ([text](url)), and more. ideal for bulk content creation, ai agents, and replacing multiple individual add page content calls. supports automatic text formatting, content splitting, and up to 100 blocks per request",
  inputSchema: z.object({
    after: z
      .string()
      .optional()
      .describe(
        "Identifier of an existing block. The new content blocks will be appended immediately after this block. If omitted or null, the new blocks are appended to the end of the parent's children list.",
      ),
    content_blocks: z
      .array(
        z.object({
          content_block: z
            .object({
              block_property: z
                .enum([
                  'paragraph',
                  'heading_1',
                  'heading_2',
                  'heading_3',
                  'callout',
                  'to_do',
                  'toggle',
                  'quote',
                  'bulleted_list_item',
                  'numbered_list_item',
                  'file',
                  'image',
                  'video',
                ])
                .describe(
                  'The block property of the block to be added. Possible properties are `paragraph`, `heading_1`, `heading_2`, `heading_3`, `callout`, `to_do`, `toggle`, `quote`, `bulleted_list_item`, `numbered_list_item`. Other properties possible are `file`, `image`, `video` (link required).',
                ),
              bold: z
                .boolean()
                .default(false)
                .optional()
                .describe('Indicates if the text is bold.'),
              code: z
                .boolean()
                .default(false)
                .optional()
                .describe('Indicates if the text is formatted as code.'),
              color: z
                .string()
                .default('default')
                .optional()
                .describe('The color of the text background or text itself.'),
              content: z
                .string()
                .optional()
                .describe(
                  'The textual content of the rich text object. ENHANCED: Now automatically parses markdown formatting including bold (**text**), italic (*text*), strikethrough (~~text~~), inline code (`code`), and links ([text](url)). Required for paragraph, heading_1, heading_2, heading_3, callout, to_do, toggle, quote.',
                ),
              italic: z
                .boolean()
                .default(false)
                .optional()
                .describe('Indicates if the text is italic.'),
              link: z
                .string()
                .optional()
                .describe(
                  'The URL of the rich text object or the file to be uploaded or image/video link',
                ),
              strikethrough: z
                .boolean()
                .default(false)
                .optional()
                .describe('Indicates if the text has strikethrough.'),
              underline: z
                .boolean()
                .default(false)
                .optional()
                .describe('Indicates if the text is underlined.'),
            })
            .describe(
              "Include these fields in the json: {'content': 'Some words', 'link': 'https://random-link.com'. For content styling, refer to https://developers.notion.com/reference/rich-text.\n\nENHANCED: The 'content' field now automatically detects and parses markdown formatting - supports bold (**text**), italic (*text*), strikethrough (~~text~~), inline code (`code`), and links ([text](url)). Headers (# ## ###) are handled via block_property.",
            ),
        }),
      )
      .min(1)
      .max(100)
      .describe(
        "A list of content blocks to be added to the page. Each block can use either the flattened NotionRichText schema or full Notion block structure. ENHANCED: The 'content' field in NotionRichText now automatically detects and parses markdown formatting - supports headers (# ## ###), bold (**text**), italic (*text*), strikethrough (~~text~~), inline code (`code`), links ([text](url)), and more. Maximum of 100 blocks per request.",
      ),
    parent_block_id: z
      .string()
      .describe(
        'Identifier of the parent page or block to which the new content blocks will be added. This parent must be capable of having child blocks. Obtain valid IDs using other Notion actions or API calls.',
      ),
  }),
  integrationName: 'Notion',
  composioToolName: 'NOTION_ADD_MULTIPLE_PAGE_CONTENT',
  execute: async (
    { after, content_blocks, parent_block_id },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      after,
      content_blocks,
      parent_block_id,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Multiple content blocks added successfully'
        : result.error,
      data: result.data,
    };
  },
});

// NOTION_APPEND_BLOCK_CHILDREN
export const notionAppendBlockChildren = createComposioTool({
  name: 'notionAppendBlockChildren',
  description:
    'Appends complex blocks with full notion block structure to a parent block or page. use for advanced scenarios requiring precise control: code blocks, tables, embeds, nested children within blocks, or when working with pre-built notion block objects. requires full notion api block schema - use add multiple page content for simpler content creation',
  inputSchema: z.object({
    after: z
      .string()
      .optional()
      .describe(
        "An optional ID of an existing child block. If provided, the new blocks will be inserted directly after this specified block. If omitted, new blocks are appended to the end of the parent's children list.",
      ),
    block_id: z
      .string()
      .describe(
        'Identifier of the parent block or page to which new child blocks will be appended. To find available page IDs and their titles, the `NOTION_FETCH_DATA` action can be utilized.',
      ),
    children: z
      .array(z.object({}).passthrough())
      .describe(
        "A list of block objects to be added as children to the parent block. Each block object must conform to Notion's block structure. A maximum of 100 blocks can be appended in a single request.",
      ),
  }),
  integrationName: 'Notion',
  composioToolName: 'NOTION_APPEND_BLOCK_CHILDREN',
  execute: async ({ after, block_id, children }, composioTool, userId) => {
    const result = await composioTool.execute({
      after,
      block_id,
      children,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Block children appended successfully'
        : result.error,
      data: result.data,
    };
  },
});

// NOTION_CREATE_DATABASE
export const notionCreateDatabase = createComposioTool({
  name: 'notionCreateDatabase',
  description:
    'Creates a new notion database as a subpage under a specified parent page with a defined properties schema; use this action exclusively for creating new databases',
  inputSchema: z.object({
    parent_id: z
      .string()
      .describe(
        'Identifier of the existing Notion page that will contain the new database. This ID must be a valid UUID corresponding to a page within the Notion workspace. It can often be obtained using search functionalities or the `NOTION_FETCH_DATA` action.',
      ),
    properties: z
      .array(
        z.object({
          database_id: z
            .string()
            .optional()
            .describe(
              "ID of the database to relate to. Required when type is 'relation'.",
            ),
          name: z.string().describe('Name of the property'),
          relation_type: z
            .enum(['single_property', 'dual_property'])
            .default('single_property')
            .optional()
            .describe(
              "Relationship type, either 'single_property' or 'dual_property'.",
            ),
          type: z
            .enum([
              'title',
              'rich_text',
              'number',
              'select',
              'multi_select',
              'date',
              'people',
              'files',
              'checkbox',
              'url',
              'email',
              'phone_number',
              'formula',
              'relation',
              'rollup',
              'status',
              'created_time',
              'created_by',
              'last_edited_time',
            ])
            .describe(
              'The type of the property, which determines the kind of data it will store. Valid types are defined by the PropertyType enum.',
            ),
        }),
      )
      .describe(
        "A list defining the schema (columns) for the new database. Each item in the list is an object representing a property and must specify at least its 'name' (how it will appear in Notion) and 'type' (the kind of data it will hold). Refer to the `PropertySchema` model for full structure details. At least one property of type 'title' is generally required. Common supported property types include: 'title', 'rich_text', 'number', 'select', 'multi_select', 'status', 'date', 'people', 'files', 'checkbox', 'url', 'email', 'phone_number'. Other types like 'formula', 'relation', 'rollup', 'created_time', 'created_by', 'last_edited_time', 'last_edited_by' might also be supported.",
      ),
    title: z
      .string()
      .describe(
        "The desired title for the new database. This text will be automatically converted into Notion's rich text format when the database is created.",
      ),
  }),
  integrationName: 'Notion',
  composioToolName: 'NOTION_CREATE_DATABASE',
  execute: async ({ parent_id, properties, title }, composioTool, userId) => {
    const result = await composioTool.execute({
      parent_id,
      properties,
      title,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Database created successfully'
        : result.error,
      data: result.data,
    };
  },
});

// NOTION_CREATE_NOTION_PAGE
export const notionCreateNotionPage = createComposioTool({
  name: 'notionCreateNotionPage',
  description: 'Creates a new empty page in a notion workspace',
  inputSchema: z.object({
    cover: z
      .string()
      .optional()
      .describe(
        'The URL of an image to be used as the cover for the new page. The URL must be publicly accessible.',
      ),
    icon: z
      .string()
      .optional()
      .describe(
        'An emoji to be used as the icon for the new page. Must be a single emoji character.',
      ),
    parent_id: z
      .string()
      .describe(
        'The UUID of the parent page or database under which the new page will be created. This ID must correspond to an existing page or database in the Notion workspace. Use other Notion actions (e.g., for searching or fetching data) to obtain valid parent IDs.',
      ),
    title: z.string().describe('The title of the new page to be created.'),
  }),
  integrationName: 'Notion',
  composioToolName: 'NOTION_CREATE_NOTION_PAGE',
  execute: async ({ cover, icon, parent_id, title }, composioTool, userId) => {
    const result = await composioTool.execute({
      cover,
      icon,
      parent_id,
      title,
    });
    return {
      success: result.successful,
      message: result.successful ? 'Page created successfully' : result.error,
      data: result.data,
    };
  },
});

// NOTION_DELETE_BLOCK
export const notionDeleteBlock = createComposioTool({
  name: 'notionDeleteBlock',
  description:
    'Archives a notion block, page, or database using its id, which sets its \'archived\' property to true (like moving to "trash" in the ui) and allows it to be restored later',
  inputSchema: z.object({
    block_id: z
      .string()
      .describe(
        'Identifier of the block, page, or database to be deleted (archived). To find page IDs and their titles, consider using an action like `NOTION_FETCH_DATA`.',
      ),
  }),
  integrationName: 'Notion',
  composioToolName: 'NOTION_DELETE_BLOCK',
  execute: async ({ block_id }, composioTool, userId) => {
    const result = await composioTool.execute({
      block_id,
    });
    return {
      success: result.successful,
      message: result.successful ? 'Block archived successfully' : result.error,
      data: result.data,
    };
  },
});

// NOTION_FETCH_DATA
export const notionFetchData = createComposioTool({
  name: 'notionFetchData',
  description:
    'Fetches notion items (pages and/or databases) from the notion workspace, use this to get minimal data about the items in the workspace with a query or list all items in the workspace with minimal data',
  inputSchema: z.object({
    get_all: z
      .boolean()
      .default(false)
      .describe(
        'If true, fetches both pages and databases accessible to the Notion integration. Only one of `get_pages`, `get_databases`, or `get_all` can be true.',
      ),
    get_databases: z
      .boolean()
      .default(false)
      .describe(
        'If true, fetches all databases accessible to the Notion integration. Only one of `get_pages`, `get_databases`, or `get_all` can be true.',
      ),
    get_pages: z
      .boolean()
      .default(false)
      .describe(
        'If true, fetches all pages accessible to the Notion integration. Only one of `get_pages`, `get_databases`, or `get_all` can be true.',
      ),
    page_size: z
      .number()
      .max(100)
      .min(1)
      .default(100)
      .optional()
      .describe(
        'The maximum number of items to retrieve. Must be between 1 and 100, inclusive. Defaults to 100. Note: this action currently only fetches the first page of results, so `page_size` effectively sets the maximum number of items returned.',
      ),
    query: z
      .string()
      .optional()
      .describe(
        'An optional search query to filter pages and/or databases by their title or content. If not provided (None or empty string), all accessible items matching the selected type (pages, databases, or both) are returned.',
      ),
  }),
  integrationName: 'Notion',
  composioToolName: 'NOTION_FETCH_DATA',
  execute: async (
    { get_all, get_databases, get_pages, page_size, query },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      get_all,
      get_databases,
      get_pages,
      page_size,
      query,
    });
    return {
      success: result.successful,
      message: result.successful ? 'Data fetched successfully' : result.error,
      data: result.data,
    };
  },
});

// NOTION_FETCH_BLOCK_METADATA
export const notionFetchBlockMetadata = createComposioTool({
  name: 'notionFetchBlockMetadata',
  description:
    'Fetches metadata for a notion block (or page, as pages are blocks) using its valid uuid; if the block has children, use fetch block contents to fetch their contents',
  inputSchema: z.object({
    block_id: z
      .string()
      .describe(
        'The unique UUID identifier for the Notion block to be retrieved. This can be the ID of a standard block or a page. To find block or page IDs, you might use actions that list page content or search for blocks/pages.',
      ),
  }),
  integrationName: 'Notion',
  composioToolName: 'NOTION_FETCH_BLOCK_METADATA',
  execute: async ({ block_id }, composioTool, userId) => {
    const result = await composioTool.execute({
      block_id,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Block metadata fetched successfully'
        : result.error,
      data: result.data,
    };
  },
});

// NOTION_FETCH_DATABASE
export const notionFetchDatabase = createComposioTool({
  name: 'notionFetchDatabase',
  description:
    "Fetches a notion database's structural metadata (properties, title, etc.) via its `database id`, not the data entries; `database id` must reference an existing database",
  inputSchema: z.object({
    database_id: z
      .string()
      .min(1)
      .describe(
        "The unique identifier of the Notion database whose metadata (structure, properties) is to be retrieved. To obtain a list of `database_id` values and corresponding database titles, use the 'NOTION_FETCH_DATA' action (or a similar action designed for listing/discovering databases). Note: Linked databases are not supported; the ID must reference an actual database, not a linked database.",
      ),
  }),
  integrationName: 'Notion',
  composioToolName: 'NOTION_FETCH_DATABASE',
  execute: async ({ database_id }, composioTool, userId) => {
    const result = await composioTool.execute({
      database_id,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Database metadata fetched successfully'
        : result.error,
      data: result.data,
    };
  },
});

// NOTION_QUERY_DATABASE
export const notionQueryDatabase = createComposioTool({
  name: 'notionQueryDatabase',
  description:
    'Queries a notion database for pages (rows), where rows are pages and columns are properties; ensure sort property names correspond to existing database properties',
  inputSchema: z.object({
    database_id: z
      .string()
      .describe(
        'Identifier of the Notion database to query. To discover available database IDs and their corresponding titles, you can use an action like `NOTION_FETCH_DATA` or inspect the database in Notion.',
      ),
    page_size: z
      .number()
      .default(2)
      .describe(
        'The maximum number of items (pages or rows) to return in a single response. Defaults to 2. The actual number of items returned may be less than this value.',
      ),
    sorts: z
      .array(
        z.object({
          ascending: z.boolean().describe('True = ASC, False = DESC.'),
          property_name: z.string().describe('Database column to sort by.'),
        }),
      )
      .optional()
      .describe(
        "List of sort rules. Each item must use the keys 'property_name' and 'ascending'.\nExample: [{'property_name': 'Due', 'ascending': False}]",
      ),
    start_cursor: z
      .string()
      .optional()
      .describe(
        'An opaque cursor for pagination, used to retrieve the next set of results. This value is obtained from the `next_cursor` field in a previous response. If omitted, retrieves results from the beginning.',
      ),
  }),
  integrationName: 'Notion',
  composioToolName: 'NOTION_QUERY_DATABASE',
  execute: async (
    { database_id, page_size, sorts, start_cursor },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      database_id,
      page_size,
      sorts,
      start_cursor,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Database queried successfully'
        : result.error,
      data: result.data,
    };
  },
});

// NOTION_SEARCH_NOTION_PAGE
export const notionSearchNotionPage = createComposioTool({
  name: 'notionSearchNotionPage',
  description:
    'Searches notion pages and databases by title; an empty query lists all accessible items, useful for discovering ids or as a fallback when a specific query yields no results.',
  inputSchema: z.object({
    direction: z
      .string()
      .optional()
      .describe(
        'Specifies the sort direction for the results. Required if `timestamp` is provided. Valid values are `ascending` or `descending`.',
      ),
    filter_property: z
      .string()
      .default('object')
      .describe(
        'The property to filter the search results by. Currently, the only supported value is `object`, which filters by the type specified in `filter_value`. Defaults to `object`.',
      ),
    filter_value: z
      .string()
      .default('page')
      .optional()
      .describe(
        'Filters the search results by object type. Valid values are `page` or `database`. Defaults to `page`.',
      ),
    page_size: z
      .number()
      .max(100)
      .min(1)
      .default(2)
      .optional()
      .describe(
        'The number of items to include in the response. Must be an integer between 1 and 100, inclusive. Defaults to 2.',
      ),
    query: z
      .string()
      .default('')
      .describe(
        'The text to search for in page and database titles. If an empty string is provided, all pages and databases accessible to the integration will be returned.',
      ),
    start_cursor: z
      .string()
      .optional()
      .describe(
        'An opaque cursor value returned in a previous response. If provided, the API will return results starting after this cursor, enabling pagination. If `None` or an empty string, results start from the beginning.',
      ),
    timestamp: z
      .string()
      .optional()
      .describe(
        'The timestamp field to sort the results by. Currently, the only supported value is `last_edited_time`. If provided, `direction` must also be specified.',
      ),
  }),
  integrationName: 'Notion',
  composioToolName: 'NOTION_SEARCH_NOTION_PAGE',
  execute: async (
    {
      direction,
      filter_property,
      filter_value,
      page_size,
      query,
      start_cursor,
      timestamp,
    },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      direction,
      filter_property,
      filter_value,
      page_size,
      query,
      start_cursor,
      timestamp,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Search completed successfully'
        : result.error,
      data: result.data,
    };
  },
});

// NOTION_UPDATE_BLOCK
export const notionUpdateBlock = createComposioTool({
  name: 'notionUpdateBlock',
  description:
    "Updates an existing notion block's textual content or type-specific properties (e.g., 'checked' status, 'color'), using its `block id` and the specified `block type`.",
  inputSchema: z.object({
    additional_properties: z
      .object({})
      .passthrough()
      .optional()
      .describe(
        "A dictionary of additional properties to apply to the block, specific to its type. These are merged into the block type's data object (e.g., into the 'paragraph' or 'to_do' object). Examples include `is_toggleable` (boolean) for heading blocks, `checked` (boolean) for 'to_do' blocks, or `color` (string, e.g., 'blue_background') for blocks supporting it. Consult Notion API documentation for supported properties within each block type object.",
      ),
    block_id: z
      .string()
      .describe(
        "Identifier of the Notion block to be updated. To find a block's ID, other Notion actions that list or retrieve blocks can be used. For updating content within a page (which is also a block), its ID can be obtained using actions like `NOTION_FETCH_DATA` to get page IDs and titles.",
      ),
    block_type: z
      .string()
      .describe(
        "The type of the block to update. Must be one of the supported types: 'paragraph', 'heading_1', 'heading_2', 'heading_3', 'bulleted_list_item', 'numbered_list_item', 'to_do', 'toggle'. The content structure and available `additional_properties` depend on this type.",
      ),
    content: z.string().describe('The new text content for the block.'),
  }),
  integrationName: 'Notion',
  composioToolName: 'NOTION_UPDATE_BLOCK',
  execute: async (
    { additional_properties, block_id, block_type, content },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      additional_properties,
      block_id,
      block_type,
      content,
    });
    return {
      success: result.successful,
      message: result.successful ? 'Block updated successfully' : result.error,
      data: result.data,
    };
  },
});

// NOTION_UPDATE_PAGE
export const notionUpdatePage = createComposioTool({
  name: 'notionUpdatePage',
  description:
    'Tool to update the properties, icon, cover, or archive status of a page. use when you need to modify existing page attributes',
  inputSchema: z.object({
    archived: z
      .boolean()
      .optional()
      .describe(
        'Set to true to archive the page (i.e., send to trash). Set to false to restore a page from trash. Defaults to false.',
      ),
    cover: z
      .object({})
      .passthrough()
      .optional()
      .describe(
        'A file object for the page cover. Only external file objects are supported for covers.',
      ),
    icon: z
      .object({})
      .passthrough()
      .optional()
      .describe(
        'A page icon object (either an emoji object or an external file object).',
      ),
    page_id: z
      .string()
      .describe('Identifier for the Notion page to be updated.'),
    properties: z
      .object({})
      .passthrough()
      .optional()
      .describe(
        'An object containing the property values to update for the page. The keys are the names or IDs of the property and the values are property value objects. If a page property ID is not included, then it is not changed.',
      ),
  }),
  integrationName: 'Notion',
  composioToolName: 'NOTION_UPDATE_PAGE',
  execute: async (
    { archived, cover, icon, page_id, properties },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      archived,
      cover,
      icon,
      page_id,
      properties,
    });
    return {
      success: result.successful,
      message: result.successful ? 'Page updated successfully' : result.error,
      data: result.data,
    };
  },
});

// NOTION_UPDATE_ROW_DATABASE
export const notionUpdateRowDatabase = createComposioTool({
  name: 'notionUpdateRowDatabase',
  description:
    'Updates or archives an existing notion database row (page) using its `row id`, allowing modification of its icon, cover, and/or properties; ensure the target page is accessible and property details (names/ids and values) align with the database schema and specified formats',
  inputSchema: z.object({
    cover: z
      .string()
      .optional()
      .describe(
        "URL of an external image to be used as the cover for the page (e.g., 'https://google.com/image.png').",
      ),
    delete_row: z
      .boolean()
      .default(false)
      .describe(
        'If true, the row (page) will be archived, effectively deleting it from the active view. If false, the row will be updated with other provided data.',
      ),
    icon: z
      .string()
      .optional()
      .describe(
        "The emoji to be used as the icon for the page. Must be a single emoji character (e.g., '😻', '🤔').",
      ),
    properties: z
      .array(
        z.object({
          name: z.string().describe('Name of the property'),
          type: z
            .enum([
              'title',
              'rich_text',
              'number',
              'select',
              'multi_select',
              'date',
              'people',
              'files',
              'checkbox',
              'url',
              'email',
              'phone_number',
              'formula',
              'relation',
              'rollup',
              'status',
              'created_time',
              'created_by',
              'last_edited_time',
            ])
            .describe('Type of the property.'),
          value: z
            .string()
            .describe(
              'Value of the property, it will be dependent on the type of the property\nFor types --> value should be\n- title, rich_text - text ex. "Hello World" (IMPORTANT: max 2000 characters, longer text will be truncated)\n- number - number ex. 23.4\n- select - select ex. "India"\n- multi_select - multi_select comma separated values ex. "India,USA"\n- date - format ex. "2021-05-11T11:00:00.000-04:00",\n- people - comma separated ids of people ex. "123,456" (will be converted to array of user objects)\n- relation - comma separated ids of related pages ex. "123,456" (will be converted to array of relation objects)\n- url - a url.\n- files - comma separated urls\n- checkbox - "True" or "False"\n',
            ),
        }),
      )
      .default([])
      .describe(
        "A list of property values to update for the page. Each item in this list defines a specific property (by its name or ID) and the new value it should take. The format of the `value` depends on the property's type; refer to the main action documentation for detailed formatting guidelines. Properties not included in this list will retain their current values.",
      ),
    row_id: z
      .string()
      .describe(
        "Identifier (UUID) of the database row (page) to be updated. This ID must be a valid UUID string (e.g., '59833787-2cf9-4fdf-8782-e53db20768a5') corresponding to an existing Notion page. In Notion, database rows are treated as pages.",
      ),
  }),
  integrationName: 'Notion',
  composioToolName: 'NOTION_UPDATE_ROW_DATABASE',
  execute: async (
    { cover, delete_row, icon, properties, row_id },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      cover,
      delete_row,
      icon,
      properties,
      row_id,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Database row updated successfully'
        : result.error,
      data: result.data,
    };
  },
});

// NOTION_UPDATE_SCHEMA_DATABASE
export const notionUpdateSchemaDatabase = createComposioTool({
  name: 'notionUpdateSchemaDatabase',
  description:
    "Updates an existing notion database's title, description, and/or properties; at least one of these attributes must be provided to effect a change",
  inputSchema: z.object({
    database_id: z
      .string()
      .describe(
        'Identifier of the Notion database to update. Use the `NOTION_FETCH_DATA` action or similar tools to get available database IDs and their titles.',
      ),
    description: z
      .string()
      .optional()
      .describe(
        "New description for the database. If this field is not provided or is set to `None` (the default value), the database's existing description will remain unchanged.",
      ),
    properties: z
      .array(
        z.object({
          name: z.string().describe('Name of the property'),
          new_type: z
            .string()
            .optional()
            .describe(
              'Default is None, If None the type remains the same. New Type of the property title, rich_text, number, select, multi_select, date, people, files, checkbox url, email, phone_number, formula, created_by, created_time, last_edited_by, last_edited_time',
            ),
          remove: z.boolean().default(false).describe('Remove the property'),
          rename: z
            .string()
            .optional()
            .describe(
              'New name of the property, default is None. If None, the name remains the same.',
            ),
        }),
      )
      .default([])
      .describe(
        "List of property updates. Each item must include at least the 'name' of the column to change plus one of: 'new_type', 'rename', or 'remove'. Example:\n[\n  {'name': 'Status', 'new_type': 'select'},\n  {'name': 'Priority', 'remove': true}\n]",
      ),
    title: z
      .string()
      .optional()
      .describe(
        "New title for the database. If this field is not provided or is set to `None` (the default value), the database's existing title will remain unchanged.",
      ),
  }),
  integrationName: 'Notion',
  composioToolName: 'NOTION_UPDATE_SCHEMA_DATABASE',
  execute: async (
    { database_id, description, properties, title },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      database_id,
      description,
      properties,
      title,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Database schema updated successfully'
        : result.error,
      data: result.data,
    };
  },
});

// Authentication tool for Notion
export const authenticateNotion = createComposioTool({
  name: 'authenticateNotion',
  description:
    'Initiate authentication with Notion to enable workspace functionality',
  inputSchema: z.object({}),
  integrationName: 'Notion',
  composioToolName: 'NOTION_FETCH_DATA',
  execute: async (params, composioTool, userId) => {
    try {
      const authRequest = await composioAuthManager.initiateAuth(
        userId,
        'Notion',
      );

      return {
        success: true,
        message: `🔗 **Notion Authentication Required**

To use Notion features, you need to authenticate with your Notion workspace first.

**Authentication URL:** ${authRequest.redirectUrl}

Please click the authentication button below to connect your Notion workspace. After authentication, you can retry your original request.`,
        data: {
          requiresAuth: true,
          authUrl: authRequest.redirectUrl,
          integrationName: 'Notion',
          authToolName: 'authenticateNotion',
        },
      };
    } catch (error) {
      console.error(`❌ Error initiating auth for Notion:`, error);
      return {
        success: false,
        message:
          '❌ **Authentication Failed**\n\nFailed to initiate Notion authentication. Please try again or contact support.',
        data: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  },
});

// Auto-register all the tools
registerComposioTool({
  name: 'notionAddMultiplePageContent',
  tool: notionAddMultiplePageContent,
  integrationName: 'Notion',
  composioToolName: 'NOTION_ADD_MULTIPLE_PAGE_CONTENT',
});

registerComposioTool({
  name: 'notionAppendBlockChildren',
  tool: notionAppendBlockChildren,
  integrationName: 'Notion',
  composioToolName: 'NOTION_APPEND_BLOCK_CHILDREN',
});

registerComposioTool({
  name: 'notionCreateDatabase',
  tool: notionCreateDatabase,
  integrationName: 'Notion',
  composioToolName: 'NOTION_CREATE_DATABASE',
});

registerComposioTool({
  name: 'notionCreateNotionPage',
  tool: notionCreateNotionPage,
  integrationName: 'Notion',
  composioToolName: 'NOTION_CREATE_NOTION_PAGE',
});

registerComposioTool({
  name: 'notionDeleteBlock',
  tool: notionDeleteBlock,
  integrationName: 'Notion',
  composioToolName: 'NOTION_DELETE_BLOCK',
});

registerComposioTool({
  name: 'notionFetchData',
  tool: notionFetchData,
  integrationName: 'Notion',
  composioToolName: 'NOTION_FETCH_DATA',
});

registerComposioTool({
  name: 'notionFetchBlockMetadata',
  tool: notionFetchBlockMetadata,
  integrationName: 'Notion',
  composioToolName: 'NOTION_FETCH_BLOCK_METADATA',
});

registerComposioTool({
  name: 'notionFetchDatabase',
  tool: notionFetchDatabase,
  integrationName: 'Notion',
  composioToolName: 'NOTION_FETCH_DATABASE',
});

registerComposioTool({
  name: 'notionQueryDatabase',
  tool: notionQueryDatabase,
  integrationName: 'Notion',
  composioToolName: 'NOTION_QUERY_DATABASE',
});

registerComposioTool({
  name: 'notionSearchNotionPage',
  tool: notionSearchNotionPage,
  integrationName: 'Notion',
  composioToolName: 'NOTION_SEARCH_NOTION_PAGE',
});

registerComposioTool({
  name: 'notionUpdateBlock',
  tool: notionUpdateBlock,
  integrationName: 'Notion',
  composioToolName: 'NOTION_UPDATE_BLOCK',
});

registerComposioTool({
  name: 'notionUpdatePage',
  tool: notionUpdatePage,
  integrationName: 'Notion',
  composioToolName: 'NOTION_UPDATE_PAGE',
});

registerComposioTool({
  name: 'notionUpdateRowDatabase',
  tool: notionUpdateRowDatabase,
  integrationName: 'Notion',
  composioToolName: 'NOTION_UPDATE_ROW_DATABASE',
});

registerComposioTool({
  name: 'notionUpdateSchemaDatabase',
  tool: notionUpdateSchemaDatabase,
  integrationName: 'Notion',
  composioToolName: 'NOTION_UPDATE_SCHEMA_DATABASE',
});

registerComposioTool({
  name: 'authenticateNotion',
  tool: authenticateNotion,
  integrationName: 'Notion',
  composioToolName: 'NOTION_FETCH_DATA',
});
