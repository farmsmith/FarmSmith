export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  short_description: string | null;
  description: string | null;
  category: string | null;
  price: number;
  currency: string;
  unit: string | null;
  weight_grams: number | null;
  gst_rate: number;
  image_url: string | null;
  stock_quantity: number;
  is_active: boolean;
  is_upcoming?: boolean;
  created_at: string;
  updated_at: string;
  images?: ProductImage[];
}

export type PublicProduct = Product;
