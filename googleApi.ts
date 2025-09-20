
import { googleApiConfig } from './config';

declare global {
  interface Window {
    gapi: any;
  }
}

class GapiManager {
  private gapiLoaded: Promise<void>;

  constructor() {
    this.gapiLoaded = new Promise((resolve) => {
      window.addEventListener('load', () => {
        window.gapi.load('client', resolve);
      });
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
