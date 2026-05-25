export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  description: string;
  imageUrl: string;
  category: 'tshirts' | 'jeans' | 'shoes' | 'other';
  rating?: number;
  reviewCount?: number;
  sizes?: string[];
  colors?: string[];
  inStock: boolean;
}

export interface ProductFilters {
  limit?: number;
  offset?: number;
  category?: 'all' | 'tshirts' | 'jeans' | 'shoes';
  search?: string;
  priceRange?: { min: number; max: number };
}
