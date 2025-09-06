import 'server-only';

import type {
  OAuthClientInformation,
  OAuthClientInformationFull,
  OAuthClientMetadata,
  OAuthTokens,
} from '@modelcontextprotocol/sdk/shared/auth.js';
import type { OAuthClientProvider } from '@modelcontextprotocol/sdk/client/auth.js';

import { getMcpOAuthByUser, upsertMcpOAuth } from '@/lib/db/queries';

type RedirectHandler = (url: URL) => void;

export class DatabaseOAuthClientProvider implements OAuthClientProvider {
  private _lastRedirectUrl?: URL;
  private _clientInformation?: OAuthClientInformationFull;
  private _tokens?: OAuthTokens;
  private _codeVerifier?: string;

  private constructor(
    private readonly userId: string,
    private readonly provider: string,
    private readonly _redirectUrl: string | URL,
    private readonly _clientMetadata: OAuthClientMetadata,
    private readonly onRedirect?: RedirectHandler,
  ) {}

  static async create(
    userId: string,
    provider: string,
    redirectUrl: string | URL,
    clientMetadata: OAuthClientMetadata,
    onRedirect?: RedirectHandler,
  ) {
    const instance = new DatabaseOAuthClientProvider(
      userId,
      provider,
      redirectUrl,
      clientMetadata,
      onRedirect,
    );
    const row = await getMcpOAuthByUser({ userId, provider });
    if (row) {
      instance._clientInformation = row.clientInformation as any;
      instance._tokens = row.tokens as any;
      instance._codeVerifier = row.codeVerifier ?? undefined;
    }
    return instance;
  }

  get redirectUrl(): string | URL {
    return this._redirectUrl;
  }

  get clientMetadata(): OAuthClientMetadata {
    return this._clientMetadata;
  }

  clientInformation(): OAuthClientInformation | undefined {
    return this._clientInformation;
  }

  saveClientInformation(clientInformation: OAuthClientInformationFull): void {
    this._clientInformation = clientInformation;
    // fire-and-forget persist
    void upsertMcpOAuth({
      userId: this.userId,
      provider: this.provider,
      clientInformation,
    });
  }

  tokens(): OAuthTokens | undefined {
    return this._tokens;
  }

  saveTokens(tokens: OAuthTokens): void {
    this._tokens = tokens;
    this._codeVerifier = undefined;
    // fire-and-forget persist
    void upsertMcpOAuth({
      userId: this.userId,
      provider: this.provider,
      tokens,
      codeVerifier: null,
    });
  }

  redirectToAuthorization(authorizationUrl: URL): void {
    this._lastRedirectUrl = authorizationUrl;
    if (this.onRedirect) this.onRedirect(authorizationUrl);
  }

  saveCodeVerifier(codeVerifier: string): void {
    this._codeVerifier = codeVerifier;
    void upsertMcpOAuth({
      userId: this.userId,
      provider: this.provider,
      codeVerifier,
    });
  }

  codeVerifier(): string {
    if (!this._codeVerifier) throw new Error('No code verifier saved');
    return this._codeVerifier;
  }

  get lastRedirectUrl(): URL | undefined {
    return this._lastRedirectUrl;
  }
}
