import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientInterface, HttpResponse } from '../../gateway/data-sources/http-client.interface';

@Injectable({
  providedIn: 'root'
})
export class AngularHttpClientAdapter implements HttpClientInterface {

  constructor(private http: HttpClient) {}

  async get<T>(url: string, options?: any): Promise<HttpResponse<T>> {
    try {
      const data = await this.http.get<T>(url, options).toPromise();
      return {
        data: data as T,
        status: 200,
        statusText: 'OK'
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async post<T>(url: string, body?: any, options?: any): Promise<HttpResponse<T>> {
    try {
      const data = await this.http.post<T>(url, body, options).toPromise();
      return {
        data: data as T,
        status: 200,
        statusText: 'OK'
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async put<T>(url: string, body?: any, options?: any): Promise<HttpResponse<T>> {
    try {
      const data = await this.http.put<T>(url, body, options).toPromise();
      return {
        data: data as T,
        status: 200,
        statusText: 'OK'
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async delete<T>(url: string, options?: any): Promise<HttpResponse<T>> {
    try {
      const data = await this.http.delete<T>(url, options).toPromise();
      return {
        data: data as T,
        status: 200,
        statusText: 'OK'
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    const message = error?.message || error?.error?.message || 'HTTP Error';
    return new Error(message);
  }
}
