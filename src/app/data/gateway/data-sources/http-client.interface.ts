export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
}

export interface HttpClientInterface {
  get<T>(url: string, options?: any): Promise<HttpResponse<T>>;
  post<T>(url: string, body?: any, options?: any): Promise<HttpResponse<T>>;
  put<T>(url: string, body?: any, options?: any): Promise<HttpResponse<T>>;
  delete<T>(url: string, options?: any): Promise<HttpResponse<T>>;
}
