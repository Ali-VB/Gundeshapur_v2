
import { googleApiConfig } from './config';
import { log } from './loggingService';

declare global {
  interface Window {
    gapi: any;
  }
}

// Helper to access the gapi client, now centralized here.
export const getSheetsApi = () => {
    if (!window.gapi || !window.gapi.client || !window.gapi.client.sheets) {
        throw new Error('Google Sheets API client not initialized.');
    }
    return window.gapi.client.sheets;
}


class GapiManager {
  private gapiLoaded: Promise<void>;

  constructor() {
    this.gapiLoaded = new Promise((resolve) => {
      // Use a robust way to ensure gapi is loaded before proceeding.
      const checkGapi = () => {
          if (window.gapi) {
              window.gapi.load('client', resolve);
          } else {
              setTimeout(checkGapi, 100);
          }
      };
      checkGapi();
    });
  }

  private async initializeClient() {
    await window.gapi.client.init({
      apiKey: googleApiConfig.apiKey,
      clientId: googleApiConfig.clientId,
      discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
      scope: googleApiConfig.scopes.join(' '),
    });
  }

  public async initClient(token: string) {
    await this.gapiLoaded;
    await this.initializeClient();
    this.setToken(token);
  }

  public setToken(token: string) {
    window.gapi.client.setToken({ access_token: token });
  }
}

export const gapiManager = new GapiManager();


// --- NEW FUNCTION to create and format a spreadsheet ---
export const createSpreadsheet = async (title: string): Promise<string | null> => {
    try {
        log.addLog('INFO', `Attempting to create spreadsheet with title: "${title}"`);
        const sheetsApi = getSheetsApi();

        // 1. Create the spreadsheet
        const spreadsheet = await sheetsApi.spreadsheets.create({
            properties: { title: title || 'Gundeshapur Library' }
        });
        const spreadsheetId = spreadsheet.result.spreadsheetId;
        if (!spreadsheetId) {
            throw new Error("Spreadsheet creation failed, no ID returned.");
        }
        log.addLog('INFO', `Spreadsheet created with ID: ${spreadsheetId}`);

        // 2. Add and rename sheets
        const batchUpdateSheetRequest = {
            requests: [
                { updateSheetProperties: { properties: { sheetId: 0, title: 'Books' }, fields: 'title' }},
                { addSheet: { properties: { title: 'Members' } } },
                { addSheet: { properties: { title: 'Loans' } } },
            ]
        };
        await sheetsApi.spreadsheets.batchUpdate({
            spreadsheetId,
            resource: batchUpdateSheetRequest
        });
        log.addLog('INFO', `Formatted sheets (Books, Members, Loans) for spreadsheet ID: ${spreadsheetId}`);

        // 3. Add headers to all sheets
        const batchUpdateValuesRequest = {
            valueInputOption: 'USER_ENTERED',
            data: [
                { range: 'Books!A1', values: [['id', 'title', 'author', 'year', 'isbn', 'publisher', 'language', 'ddc', 'tags', 'totalCopies', 'availableCopies']] },
                { range: 'Members!A1', values: [['id', 'name', 'email', 'phone', 'role', 'status']] },
                { range: 'Loans!A1', values: [['id', 'bookId', 'memberId', 'loanDate', 'dueDate', 'returnDate', 'status']] }
            ]
        };
        await sheetsApi.spreadsheets.values.batchUpdate({
            spreadsheetId,
            resource: batchUpdateValuesRequest
        });
        log.addLog('INFO', `Added headers to all sheets for spreadsheet ID: ${spreadsheetId}`);
        
        return spreadsheetId;
    } catch (e: any) {
        log.addLog('ERROR', `Failed to create spreadsheet: ${e.message}`);
        throw e;
    }
};