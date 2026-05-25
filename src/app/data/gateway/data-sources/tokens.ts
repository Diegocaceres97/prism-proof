import { InjectionToken } from '@angular/core';
import { HttpClientInterface } from './http-client.interface';

// Injection token for HTTP client interface
export const HTTP_CLIENT_TOKEN = new InjectionToken<HttpClientInterface>('HttpClientInterface');
