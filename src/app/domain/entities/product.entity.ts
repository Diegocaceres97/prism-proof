export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
}

export interface ProductFilters {
  limit?: number;
  offset?: number;
}
