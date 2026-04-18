export class Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_price?: number;
  category_id?: string;
  stock_quantity: number;
  material?: string;
  sizes: string[];
  colors: any; // JSONB
  tags: string[];
  is_featured: boolean;
  created_at: Date;
  updated_at: Date;
}

export class ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text?: string;
  display_order: number;
  is_primary: boolean;
  created_at: Date;
}
