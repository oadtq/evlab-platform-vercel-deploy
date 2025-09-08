import { createComposioTool } from '../base';
import { registerComposioTool } from '../tool-manager';
import { composioAuthManager } from '@/lib/composio/auth-manager';
import { z } from 'zod';

// Create Google Sheet
export const googleSheetsCreateGoogleSheet = createComposioTool({
  name: 'googleSheetsCreateGoogleSheet',
  description:
    'Creates a new google spreadsheet in google drive using the provided title',
  inputSchema: z.object({
    title: z
      .string()
      .describe(
        'The title for the new Google Sheet. This will be the name of the file in Google Drive.',
      ),
  }),
  integrationName: 'Google Sheets',
  composioToolName: 'GOOGLESHEETS_CREATE_GOOGLE_SHEET1',
  execute: async ({ title }, composioTool, userId) => {
    const result = await composioTool.execute({
      title,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Spreadsheet created successfully'
        : result.error,
      data: result.data,
    };
  },
});

// Add Sheet
export const googleSheetsAddSheet = createComposioTool({
  name: 'googleSheetsAddSheet',
  description:
    'Adds a new sheet (worksheet) to a spreadsheet. use this tool to create a new tab within an existing google sheet, optionally specifying its title, index, size, and other properties',
  inputSchema: z.object({
    spreadsheetId: z
      .string()
      .describe(
        'The ID of the spreadsheet to add the sheet to. This is the long string of characters in the URL of your Google Sheet.',
      ),
    includeSpreadsheetInResponse: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        'Whether the response should include the entire spreadsheet resource. Defaults to false.',
      ),
    responseIncludeGridData: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        'True if grid data should be returned. This parameter is ignored if includeSpreadsheetInResponse is false. Defaults to false.',
      ),
    properties: z
      .object({
        title: z
          .string()
          .nullable()
          .optional()
          .describe('The name of the sheet. Example: "Q3 Report"'),
        index: z
          .number()
          .nullable()
          .optional()
          .describe(
            'The zero-based index of the sheet in the spreadsheet. Example: 0 for the first sheet.',
          ),
        sheetId: z
          .number()
          .nullable()
          .optional()
          .describe(
            'The ID of the sheet. If not set, an ID will be randomly generated. Must be non-negative if set.',
          ),
        sheetType: z
          .enum(['GRID', 'OBJECT', 'DATA_SOURCE'])
          .optional()
          .default('GRID')
          .describe('The type of sheet.'),
        hidden: z
          .boolean()
          .nullable()
          .optional()
          .describe(
            "True if the sheet is hidden in the UI, false if it's visible.",
          ),
        rightToLeft: z
          .boolean()
          .nullable()
          .optional()
          .describe("True if the sheet is an RTL sheet, false if it's LTR."),
        gridProperties: z
          .object({
            rowCount: z
              .number()
              .nullable()
              .optional()
              .describe('The number of rows in the sheet.'),
            columnCount: z
              .number()
              .nullable()
              .optional()
              .describe('The number of columns in the sheet.'),
            frozenRowCount: z
              .number()
              .nullable()
              .optional()
              .describe('The number of rows that are frozen in the sheet.'),
            frozenColumnCount: z
              .number()
              .nullable()
              .optional()
              .describe('The number of columns that are frozen in the sheet.'),
            hideGridlines: z
              .boolean()
              .nullable()
              .optional()
              .describe(
                'True if the gridlines are hidden, false if they are shown.',
              ),
            rowGroupControlAfter: z
              .boolean()
              .nullable()
              .optional()
              .describe(
                'True if the row group control toggle is shown after the group, false if before.',
              ),
            columnGroupControlAfter: z
              .boolean()
              .nullable()
              .optional()
              .describe(
                'True if the column group control toggle is shown after the group, false if before.',
              ),
          })
          .nullable()
          .optional()
          .describe("Additional properties of the sheet if it's a grid sheet."),
        tabColorStyle: z
          .object({
            rgbColor: z
              .object({
                red: z
                  .number()
                  .nullable()
                  .optional()
                  .describe(
                    'The amount of red in the color as a value in the interval [0, 1].',
                  ),
                green: z
                  .number()
                  .nullable()
                  .optional()
                  .describe(
                    'The amount of green in the color as a value in the interval [0, 1].',
                  ),
                blue: z
                  .number()
                  .nullable()
                  .optional()
                  .describe(
                    'The amount of blue in the color as a value in the interval [0, 1].',
                  ),
                alpha: z
                  .number()
                  .nullable()
                  .optional()
                  .describe(
                    'The fraction of this color that should be applied to the pixel. E.g. 0.5 for 50% transparent.',
                  ),
              })
              .nullable()
              .optional(),
            themeColor: z
              .enum([
                'THEME_COLOR_TYPE_UNSPECIFIED',
                'TEXT',
                'BACKGROUND',
                'ACCENT1',
                'ACCENT2',
                'ACCENT3',
                'ACCENT4',
                'ACCENT5',
                'ACCENT6',
                'LINK',
              ])
              .nullable()
              .optional(),
          })
          .nullable()
          .optional()
          .describe('The color of the sheet tab.'),
      })
      .nullable()
      .optional()
      .describe(
        'The properties the new sheet should have. All properties are optional. If none are specified, a default sheet will be created.',
      ),
  }),
  integrationName: 'Google Sheets',
  composioToolName: 'GOOGLESHEETS_ADD_SHEET',
  execute: async (
    {
      spreadsheetId,
      includeSpreadsheetInResponse,
      responseIncludeGridData,
      properties,
    },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      spreadsheetId,
      includeSpreadsheetInResponse,
      responseIncludeGridData,
      properties,
    });
    return {
      success: result.successful,
      message: result.successful ? 'Sheet added successfully' : result.error,
      data: result.data,
    };
  },
});

// Append Dimension
export const googleSheetsAppendDimension = createComposioTool({
  name: 'googleSheetsAppendDimension',
  description:
    'Tool to append new rows or columns to a sheet, increasing its size. use when you need to add empty rows or columns to an existing sheet',
  inputSchema: z.object({
    spreadsheet_id: z.string().describe('The ID of the spreadsheet.'),
    sheet_id: z
      .number()
      .describe('The ID of the sheet to append rows or columns to.'),
    dimension: z
      .enum(['ROWS', 'COLUMNS'])
      .describe('Specifies whether to append rows or columns.'),
    length: z.number().describe('The number of rows or columns to append.'),
  }),
  integrationName: 'Google Sheets',
  composioToolName: 'GOOGLESHEETS_APPEND_DIMENSION',
  execute: async (
    { spreadsheet_id, sheet_id, dimension, length },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      spreadsheet_id,
      sheet_id,
      dimension,
      length,
    });
    return {
      success: result.successful,
      message: result.successful
        ? `${dimension.toLowerCase()} appended successfully`
        : result.error,
      data: result.data,
    };
  },
});

// Batch Get
export const googleSheetsBatchGet = createComposioTool({
  name: 'googleSheetsBatchGet',
  description:
    'Retrieves data from specified cell ranges in a google spreadsheet; ensure the spreadsheet has at least one worksheet and any explicitly referenced sheet names in ranges exist',
  inputSchema: z.object({
    spreadsheet_id: z
      .string()
      .describe(
        'The unique identifier of the Google Spreadsheet from which data will be retrieved.',
      ),
    ranges: z
      .array(z.string())
      .optional()
      .describe(
        "A list of cell ranges in A1 notation (e.g., 'Sheet1!A1:B2', 'A1:C5') from which to retrieve data. If this list is omitted or empty, all data from the first sheet of the spreadsheet will be fetched. A range can specify a sheet name (e.g., 'Sheet2!A:A'); if no sheet name is provided in a range string (e.g., 'A1:B2'), it defaults to the first sheet.",
      ),
  }),
  integrationName: 'Google Sheets',
  composioToolName: 'GOOGLESHEETS_BATCH_GET',
  execute: async ({ spreadsheet_id, ranges }, composioTool, userId) => {
    const result = await composioTool.execute({
      spreadsheet_id,
      ranges,
    });
    return {
      success: result.successful,
      message: result.successful ? 'Data retrieved successfully' : result.error,
      data: result.data,
    };
  },
});

// Batch Update
export const googleSheetsBatchUpdate = createComposioTool({
  name: 'googleSheetsBatchUpdate',
  description:
    'Updates a specified range in a google sheet with given values, or appends them as new rows if `first cell location` is omitted; ensure the target sheet exists and the spreadsheet contains at least one worksheet',
  inputSchema: z.object({
    spreadsheet_id: z
      .string()
      .describe(
        'The unique identifier of the Google Sheets spreadsheet to be updated.',
      ),
    sheet_name: z
      .string()
      .describe(
        'The name of the specific sheet within the spreadsheet to update.',
      ),
    values: z
      .array(z.array(z.union([z.string(), z.number(), z.boolean()])))
      .describe(
        'A 2D list of cell values. Each inner list represents a row. Values can be strings, numbers, or booleans. Ensure columns are properly aligned across rows.',
      ),
    first_cell_location: z
      .string()
      .optional()
      .describe(
        "The starting cell for the update range, specified in A1 notation (e.g., 'A1', 'B2'). The update will extend from this cell to the right and down, based on the provided values. If omitted, values are appended to the sheet.",
      ),
    valueInputOption: z
      .enum(['RAW', 'USER_ENTERED'])
      .optional()
      .default('USER_ENTERED')
      .describe(
        "How input data is interpreted. 'USER_ENTERED': Values parsed as if typed by a user (e.g., strings may become numbers/dates, formulas are calculated); recommended for formulas. 'RAW': Values stored as-is without parsing (e.g., '123' stays string, '=SUM(A1:B1)' stays string).",
      ),
    includeValuesInResponse: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        'If set to True, the response will include the updated values from the spreadsheet.',
      ),
  }),
  integrationName: 'Google Sheets',
  composioToolName: 'GOOGLESHEETS_BATCH_UPDATE',
  execute: async (
    {
      spreadsheet_id,
      sheet_name,
      values,
      first_cell_location,
      valueInputOption,
      includeValuesInResponse,
    },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      spreadsheet_id,
      sheet_name,
      values,
      first_cell_location,
      valueInputOption,
      includeValuesInResponse,
    });
    return {
      success: result.successful,
      message: result.successful ? 'Data updated successfully' : result.error,
      data: result.data,
    };
  },
});

// Batch Update Values by Data Filter
export const googleSheetsBatchUpdateValuesByDataFilter = createComposioTool({
  name: 'googleSheetsBatchUpdateValuesByDataFilter',
  description:
    'Tool to update values in ranges matching data filters. use when you need to update specific data in a google sheet based on criteria rather than fixed cell ranges',
  inputSchema: z.object({
    spreadsheetId: z.string().describe('The ID of the spreadsheet to update.'),
    valueInputOption: z
      .enum(['RAW', 'USER_ENTERED'])
      .describe('How the input data should be interpreted.'),
    data: z
      .array(
        z.object({
          dataFilter: z
            .object({
              a1Range: z
                .string()
                .nullable()
                .optional()
                .describe('The A1 notation of the range to update.'),
              gridRange: z
                .object({
                  sheetId: z
                    .number()
                    .nullable()
                    .optional()
                    .describe('The sheet this range is on.'),
                  startRowIndex: z
                    .number()
                    .nullable()
                    .optional()
                    .describe(
                      'The start row (inclusive) of the range, or not set if unbounded.',
                    ),
                  endRowIndex: z
                    .number()
                    .nullable()
                    .optional()
                    .describe(
                      'The end row (exclusive) of the range, or not set if unbounded.',
                    ),
                  startColumnIndex: z
                    .number()
                    .nullable()
                    .optional()
                    .describe(
                      'The start column (inclusive) of the range, or not set if unbounded.',
                    ),
                  endColumnIndex: z
                    .number()
                    .nullable()
                    .optional()
                    .describe(
                      'The end column (exclusive) of the range, or not set if unbounded.',
                    ),
                })
                .nullable()
                .optional()
                .describe(
                  'Selects data within the range described by a GridRange. This field is optional. If specified, the dataFilter selects data within the specified grid range.',
                ),
              developerMetadataLookup: z
                .object({
                  metadataId: z
                    .number()
                    .nullable()
                    .optional()
                    .describe(
                      'The ID of the developer metadata to match. This field is optional. If specified, the lookup matches only the developer metadata with the specified ID.',
                    ),
                  metadataKey: z
                    .string()
                    .nullable()
                    .optional()
                    .describe(
                      'The key of the developer metadata to match. This field is optional. If specified, the lookup matches only the developer metadata with the specified key.',
                    ),
                  metadataValue: z
                    .string()
                    .nullable()
                    .optional()
                    .describe(
                      'The value of the developer metadata to match. This field is optional. If specified, the lookup matches only the developer metadata with the specified value.',
                    ),
                  locationType: z
                    .enum(['ROW', 'COLUMN', 'SHEET'])
                    .nullable()
                    .optional()
                    .describe(
                      'The type of location this object is looking for. Valid values are ROW, COLUMN, and SHEET.',
                    ),
                  locationMatchingStrategy: z
                    .enum(['EXACT', 'INTERSECTING'])
                    .nullable()
                    .optional()
                    .describe(
                      'Determines how this lookup matches the location. If this field is specified as EXACT, then the lookup requires an exact match of the specified locationType, metadataKey, and metadataValue. If this field is specified as INTERSECTING, then the lookup considers all metadata that intersects the specified locationType, and then filters that metadata by the specified key and value. If this field is unspecified, it is treated as EXACT.',
                    ),
                  visibility: z
                    .string()
                    .nullable()
                    .optional()
                    .describe(
                      'The visibility of the developer metadata to match. This field is optional. If specified, the lookup matches only the developer metadata with the specified visibility.',
                    ),
                  metadataLocation: z
                    .object({
                      locationType: z
                        .string()
                        .nullable()
                        .optional()
                        .describe(
                          'The type of location this object represents. This field is read-only.',
                        ),
                      sheetId: z
                        .number()
                        .nullable()
                        .optional()
                        .describe('The ID of the sheet the location is on.'),
                      spreadsheet: z
                        .boolean()
                        .nullable()
                        .optional()
                        .describe(
                          'True if the metadata location is the spreadsheet itself.',
                        ),
                      dimensionRange: z
                        .record(z.any())
                        .nullable()
                        .optional()
                        .describe(
                          'A range along a single dimension on a sheet. All indexes are 0-based. Indexes are half open: the start index is inclusive and the end index is exclusive. Missing indexes indicate the range is unbounded on that side.',
                        ),
                    })
                    .nullable()
                    .optional()
                    .describe(
                      'The location of the developer metadata to match. This field is optional. If specified, the lookup matches only the developer metadata in the specified location.',
                    ),
                })
                .nullable()
                .optional()
                .describe(
                  "Matches the data against the developer metadata that's associated with the dimensions. The developer metadata should be created with the location type set to either ROW or COLUMN and the visibility set to DOCUMENT.",
                ),
            })
            .describe(
              'The data filter describing the criteria to select cells for update.',
            ),
          majorDimension: z
            .enum(['ROWS', 'COLUMNS', 'DIMENSION_UNSPECIFIED'])
            .optional()
            .default('ROWS')
            .describe(
              'The major dimension of the values. The default value is ROWS.',
            ),
          values: z
            .array(z.array(z.union([z.string(), z.number(), z.boolean()])))
            .describe(
              'The data to be written. A two-dimensional array of values that will be written to the range. Values can be strings, numbers, or booleans. If the range is larger than the values array, the excess cells will not be changed. If the values array is larger than the range, the excess values will be ignored.',
            ),
        }),
      )
      .describe(
        'The new values to apply to the spreadsheet. If more than one range is matched by the specified DataFilter the specified values are applied to all of those ranges.',
      ),
    includeValuesInResponse: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        'Determines if the update response should include the values of the cells that were updated. By default, responses do not include the updated values.',
      ),
    responseDateTimeRenderOption: z
      .enum(['SERIAL_NUMBER', 'FORMATTED_STRING'])
      .optional()
      .default('SERIAL_NUMBER')
      .describe(
        'Determines how dates, times, and durations in the response should be rendered. This is ignored if responseValueRenderOption is FORMATTED_VALUE. The default dateTime render option is SERIAL_NUMBER.',
      ),
    responseValueRenderOption: z
      .enum(['FORMATTED_VALUE', 'UNFORMATTED_VALUE', 'FORMULA'])
      .optional()
      .default('FORMATTED_VALUE')
      .describe(
        'Determines how values in the response should be rendered. The default render option is FORMATTED_VALUE.',
      ),
  }),
  integrationName: 'Google Sheets',
  composioToolName: 'GOOGLESHEETS_BATCH_UPDATE_VALUES_BY_DATA_FILTER',
  execute: async (
    {
      spreadsheetId,
      valueInputOption,
      data,
      includeValuesInResponse,
      responseDateTimeRenderOption,
      responseValueRenderOption,
    },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      spreadsheetId,
      valueInputOption,
      data,
      includeValuesInResponse,
      responseDateTimeRenderOption,
      responseValueRenderOption,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Data updated by filter successfully'
        : result.error,
      data: result.data,
    };
  },
});

// Clear Values
export const googleSheetsClearValues = createComposioTool({
  name: 'googleSheetsClearValues',
  description:
    'Clears cell content (preserving formatting and notes) from a specified a1 notation range in a google spreadsheet; the range must correspond to an existing sheet and cells',
  inputSchema: z.object({
    spreadsheet_id: z
      .string()
      .describe(
        'The unique identifier of the Google Spreadsheet from which to clear values. This ID can be found in the URL of the spreadsheet.',
      ),
    range: z
      .string()
      .describe(
        "The A1 notation of the range to clear values from (e.g., 'Sheet1!A1:B2', 'MySheet!C:C', or 'A1:D5'). If the sheet name is omitted (e.g., 'A1:B2'), the operation applies to the first visible sheet.",
      ),
  }),
  integrationName: 'Google Sheets',
  composioToolName: 'GOOGLESHEETS_CLEAR_VALUES',
  execute: async ({ spreadsheet_id, range }, composioTool, userId) => {
    const result = await composioTool.execute({
      spreadsheet_id,
      range,
    });
    return {
      success: result.successful,
      message: result.successful ? 'Values cleared successfully' : result.error,
      data: result.data,
    };
  },
});

// Create Spreadsheet Column
export const googleSheetsCreateSpreadsheetColumn = createComposioTool({
  name: 'googleSheetsCreateSpreadsheetColumn',
  description:
    'Creates a new column in a google spreadsheet, requiring a valid `spreadsheet id` and an existing `sheet id`; an out-of-bounds `insert index` may append/prepend the column',
  inputSchema: z.object({
    spreadsheet_id: z
      .string()
      .describe(
        'The unique identifier of the Google Spreadsheet where the column will be created.',
      ),
    sheet_id: z
      .number()
      .describe(
        'The numeric identifier of the specific sheet (tab) within the spreadsheet where the column will be added.',
      ),
    insert_index: z
      .number()
      .optional()
      .default(0)
      .describe(
        'The 0-based index at which the new column will be inserted. For example, an index of 0 inserts the column before the current first column (A), and an index of 1 inserts it between the current columns A and B.',
      ),
    inherit_from_before: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        'If true, the new column inherits properties (e.g., formatting, width) from the column immediately to its left (the preceding column). If false (default), it inherits from the column immediately to its right (the succeeding column). This is ignored if there is no respective preceding or succeeding column.',
      ),
  }),
  integrationName: 'Google Sheets',
  composioToolName: 'GOOGLESHEETS_CREATE_SPREADSHEET_COLUMN',
  execute: async (
    { spreadsheet_id, sheet_id, insert_index, inherit_from_before },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      spreadsheet_id,
      sheet_id,
      insert_index,
      inherit_from_before,
    });
    return {
      success: result.successful,
      message: result.successful ? 'Column created successfully' : result.error,
      data: result.data,
    };
  },
});

// Create Spreadsheet Row
export const googleSheetsCreateSpreadsheetRow = createComposioTool({
  name: 'googleSheetsCreateSpreadsheetRow',
  description:
    'Inserts a new, empty row into a specified sheet of a google spreadsheet at a given index, optionally inheriting formatting from the row above.',
  inputSchema: z.object({
    spreadsheet_id: z
      .string()
      .describe(
        "The unique identifier of the Google Spreadsheet. This ID is found in the URL of the spreadsheet (e.g., '1qpyC0XzHc_-_d824s2VfopkHh7D0jW4aXCS1D_AlGA').",
      ),
    sheet_id: z
      .number()
      .describe(
        "The numeric identifier of the sheet (tab) within the spreadsheet where the row will be inserted. This ID (gid) is found in the URL of the spreadsheet (e.g., '0' for the first sheet).",
      ),
    insert_index: z
      .number()
      .optional()
      .default(0)
      .describe(
        'The 0-based index at which the new row should be inserted. For example, an index of 0 inserts the row at the beginning of the sheet. If the index is greater than the current number of rows, the row is appended.',
      ),
    inherit_from_before: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        'If True, the newly inserted row will inherit formatting and properties from the row immediately preceding its insertion point. If False, it will have default formatting.',
      ),
  }),
  integrationName: 'Google Sheets',
  composioToolName: 'GOOGLESHEETS_CREATE_SPREADSHEET_ROW',
  execute: async (
    { spreadsheet_id, sheet_id, insert_index, inherit_from_before },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      spreadsheet_id,
      sheet_id,
      insert_index,
      inherit_from_before,
    });
    return {
      success: result.successful,
      message: result.successful ? 'Row created successfully' : result.error,
      data: result.data,
    };
  },
});

// Delete Dimension
export const googleSheetsDeleteDimension = createComposioTool({
  name: 'googleSheetsDeleteDimension',
  description:
    'Tool to delete specified rows or columns from a sheet in a google spreadsheet. use when you need to remove a range of rows or columns',
  inputSchema: z.object({
    spreadsheet_id: z.string().describe('The ID of the spreadsheet.'),
    delete_dimension_request: z
      .object({
        range: z
          .object({
            sheet_id: z
              .number()
              .describe(
                'The ID of the sheet from which to delete the dimension.',
              ),
            dimension: z
              .enum(['ROWS', 'COLUMNS'])
              .describe('The dimension to delete.'),
            start_index: z
              .number()
              .describe(
                'The zero-based start index of the range to delete, inclusive. The start index must be less than the end index.',
              ),
            end_index: z
              .number()
              .describe(
                'The zero-based end index of the range to delete, exclusive. The end index must be greater than the start index.',
              ),
          })
          .describe('The range of the dimension to delete.'),
      })
      .describe('The details for the delete dimension request object.'),
    include_spreadsheet_in_response: z
      .boolean()
      .nullable()
      .optional()
      .describe(
        'Determines if the update response should include the spreadsheet resource.',
      ),
    response_include_grid_data: z
      .boolean()
      .nullable()
      .optional()
      .describe(
        'True if grid data should be returned. This parameter is ignored if a field mask was set in the request.',
      ),
    response_ranges: z
      .array(z.string())
      .nullable()
      .optional()
      .describe(
        'Limits the ranges of cells included in the response spreadsheet.',
      ),
  }),
  integrationName: 'Google Sheets',
  composioToolName: 'GOOGLESHEETS_DELETE_DIMENSION',
  execute: async (
    {
      spreadsheet_id,
      delete_dimension_request,
      include_spreadsheet_in_response,
      response_include_grid_data,
      response_ranges,
    },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      spreadsheet_id,
      delete_dimension_request,
      include_spreadsheet_in_response,
      response_include_grid_data,
      response_ranges,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Dimension deleted successfully'
        : result.error,
      data: result.data,
    };
  },
});

// Delete Sheet
export const googleSheetsDeleteSheet = createComposioTool({
  name: 'googleSheetsDeleteSheet',
  description:
    'Tool to delete a sheet (worksheet) from a spreadsheet. use when you need to remove a specific sheet from a google sheet document',
  inputSchema: z.object({
    spreadsheetId: z
      .string()
      .describe('The ID of the spreadsheet from which to delete the sheet.'),
    sheet_id: z
      .number()
      .describe(
        'The ID of the sheet to delete. If the sheet is of DATA_SOURCE type, the associated DataSource is also deleted.',
      ),
  }),
  integrationName: 'Google Sheets',
  composioToolName: 'GOOGLESHEETS_DELETE_SHEET',
  execute: async ({ spreadsheetId, sheet_id }, composioTool, userId) => {
    const result = await composioTool.execute({
      spreadsheetId,
      sheet_id,
    });
    return {
      success: result.successful,
      message: result.successful ? 'Sheet deleted successfully' : result.error,
      data: result.data,
    };
  },
});

// Execute SQL
export const googleSheetsExecuteSql = createComposioTool({
  name: 'googleSheetsExecuteSql',
  description:
    'Execute sql queries against google sheets tables. supports select, insert, update, and delete operations with familiar sql syntax. tables are automatically detected and mapped from the spreadsheet structure.',
  inputSchema: z.object({
    spreadsheet_id: z.string().describe('Google Sheets ID'),
    sql: z
      .string()
      .describe(
        'SQL query to execute. Supports SELECT, INSERT, UPDATE, DELETE operations.',
      ),
    dry_run: z
      .boolean()
      .optional()
      .default(false)
      .describe('Preview changes without applying them (for write operations)'),
    delete_method: z
      .enum(['clear', 'remove_rows'])
      .optional()
      .default('clear')
      .describe(
        "For DELETE operations: 'clear' preserves row structure, 'remove_rows' shifts data up",
      ),
  }),
  integrationName: 'Google Sheets',
  composioToolName: 'GOOGLESHEETS_EXECUTE_SQL',
  execute: async (
    { spreadsheet_id, sql, dry_run, delete_method },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      spreadsheet_id,
      sql,
      dry_run,
      delete_method,
    });
    return {
      success: result.successful,
      message: result.successful ? 'SQL executed successfully' : result.error,
      data: result.data,
    };
  },
});

// Get Spreadsheet Info
export const googleSheetsGetSpreadsheetInfo = createComposioTool({
  name: 'googleSheetsGetSpreadsheetInfo',
  description:
    'Retrieves comprehensive metadata for a google spreadsheet using its id, excluding cell data.',
  inputSchema: z.object({
    spreadsheet_id: z
      .string()
      .describe(
        'Unique identifier of the Google Spreadsheet, typically found in its URL.',
      ),
  }),
  integrationName: 'Google Sheets',
  composioToolName: 'GOOGLESHEETS_GET_SPREADSHEET_INFO',
  execute: async ({ spreadsheet_id }, composioTool, userId) => {
    const result = await composioTool.execute({
      spreadsheet_id,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Spreadsheet info retrieved successfully'
        : result.error,
      data: result.data,
    };
  },
});

// Get Table Schema
export const googleSheetsGetTableSchema = createComposioTool({
  name: 'googleSheetsGetTableSchema',
  description:
    'This action is used to get the schema of a table in a google spreadsheet, call this action to get the schema of a table in a spreadsheet before you query the table. analyze table structure and infer column names, types, and constraints. uses statistical analysis of sample data to determine the most likely data type for each column. call this action after calling the list tables action to get the schema of a table in a spreadsheet',
  inputSchema: z.object({
    spreadsheet_id: z.string().describe('Google Sheets ID'),
    table_name: z
      .string()
      .describe(
        "Specific table name from LIST_TABLES response (e.g., 'Sales_Data', 'Employee_List'). Use 'auto' to analyze the largest/most prominent table.",
      ),
    sample_size: z
      .number()
      .min(1)
      .max(1000)
      .optional()
      .default(50)
      .describe('Number of rows to sample for type inference'),
    sheet_name: z
      .string()
      .nullable()
      .optional()
      .describe(
        'Sheet/tab name if table_name is ambiguous across multiple sheets',
      ),
  }),
  integrationName: 'Google Sheets',
  composioToolName: 'GOOGLESHEETS_GET_TABLE_SCHEMA',
  execute: async (
    { spreadsheet_id, table_name, sample_size, sheet_name },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      spreadsheet_id,
      table_name,
      sample_size,
      sheet_name,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Table schema retrieved successfully'
        : result.error,
      data: result.data,
    };
  },
});

// Authentication tool for Google Sheets
export const authenticateGoogleSheets = createComposioTool({
  name: 'authenticateGoogleSheets',
  description:
    'Initiate authentication with Google Sheets to enable spreadsheet functionality',
  inputSchema: z.object({}),
  integrationName: 'Google Sheets',
  composioToolName: 'GOOGLESHEETS_GET_SPREADSHEET_INFO',
  execute: async (params, composioTool, userId) => {
    try {
      const authRequest = await composioAuthManager.initiateAuth(
        userId,
        'Google Sheets',
      );

      return {
        success: true,
        message: `🔗 **Google Sheets Authentication Required**

To use Google Sheets features, you need to authenticate with your Google account first.

**Authentication URL:** ${authRequest.redirectUrl}

Please click the authentication button below to connect your Google account. After authentication, you can retry your original request.`,
        data: {
          requiresAuth: true,
          authUrl: authRequest.redirectUrl,
          integrationName: 'Google Sheets',
          authToolName: 'authenticateGoogleSheets',
        },
      };
    } catch (error) {
      console.error(`❌ Error initiating auth for Google Sheets:`, error);
      return {
        success: false,
        message:
          '❌ **Authentication Failed**\n\nFailed to initiate Google Sheets authentication. Please try again or contact support.',
        data: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  },
});

// Auto-register the tools
registerComposioTool({
  name: 'googleSheetsCreateGoogleSheet',
  tool: googleSheetsCreateGoogleSheet,
  integrationName: 'Google Sheets',
  composioToolName: 'GOOGLESHEETS_CREATE_GOOGLE_SHEET1',
});

registerComposioTool({
  name: 'googleSheetsAddSheet',
  tool: googleSheetsAddSheet,
  integrationName: 'Google Sheets',
  composioToolName: 'GOOGLESHEETS_ADD_SHEET',
});

registerComposioTool({
  name: 'googleSheetsAppendDimension',
  tool: googleSheetsAppendDimension,
  integrationName: 'Google Sheets',
  composioToolName: 'GOOGLESHEETS_APPEND_DIMENSION',
});

registerComposioTool({
  name: 'googleSheetsBatchGet',
  tool: googleSheetsBatchGet,
  integrationName: 'Google Sheets',
  composioToolName: 'GOOGLESHEETS_BATCH_GET',
});

registerComposioTool({
  name: 'googleSheetsBatchUpdate',
  tool: googleSheetsBatchUpdate,
  integrationName: 'Google Sheets',
  composioToolName: 'GOOGLESHEETS_BATCH_UPDATE',
});

registerComposioTool({
  name: 'googleSheetsBatchUpdateValuesByDataFilter',
  tool: googleSheetsBatchUpdateValuesByDataFilter,
  integrationName: 'Google Sheets',
  composioToolName: 'GOOGLESHEETS_BATCH_UPDATE_VALUES_BY_DATA_FILTER',
});

registerComposioTool({
  name: 'googleSheetsClearValues',
  tool: googleSheetsClearValues,
  integrationName: 'Google Sheets',
  composioToolName: 'GOOGLESHEETS_CLEAR_VALUES',
});

registerComposioTool({
  name: 'googleSheetsCreateSpreadsheetColumn',
  tool: googleSheetsCreateSpreadsheetColumn,
  integrationName: 'Google Sheets',
  composioToolName: 'GOOGLESHEETS_CREATE_SPREADSHEET_COLUMN',
});

registerComposioTool({
  name: 'googleSheetsCreateSpreadsheetRow',
  tool: googleSheetsCreateSpreadsheetRow,
  integrationName: 'Google Sheets',
  composioToolName: 'GOOGLESHEETS_CREATE_SPREADSHEET_ROW',
});

registerComposioTool({
  name: 'googleSheetsDeleteDimension',
  tool: googleSheetsDeleteDimension,
  integrationName: 'Google Sheets',
  composioToolName: 'GOOGLESHEETS_DELETE_DIMENSION',
});

registerComposioTool({
  name: 'googleSheetsDeleteSheet',
  tool: googleSheetsDeleteSheet,
  integrationName: 'Google Sheets',
  composioToolName: 'GOOGLESHEETS_DELETE_SHEET',
});

registerComposioTool({
  name: 'googleSheetsExecuteSql',
  tool: googleSheetsExecuteSql,
  integrationName: 'Google Sheets',
  composioToolName: 'GOOGLESHEETS_EXECUTE_SQL',
});

registerComposioTool({
  name: 'googleSheetsGetSpreadsheetInfo',
  tool: googleSheetsGetSpreadsheetInfo,
  integrationName: 'Google Sheets',
  composioToolName: 'GOOGLESHEETS_GET_SPREADSHEET_INFO',
});

registerComposioTool({
  name: 'googleSheetsGetTableSchema',
  tool: googleSheetsGetTableSchema,
  integrationName: 'Google Sheets',
  composioToolName: 'GOOGLESHEETS_GET_TABLE_SCHEMA',
});

registerComposioTool({
  name: 'authenticateGoogleSheets',
  tool: authenticateGoogleSheets,
  integrationName: 'Google Sheets',
  composioToolName: 'GOOGLESHEETS_CREATE_GOOGLE_SHEET',
});
