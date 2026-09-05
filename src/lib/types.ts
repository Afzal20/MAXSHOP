export interface Category {
  id: number;
  name: string;
  slug: string;
  image?: string;
  description?: string;
}

export interface ItemImage {
  id: number;
  image: string;
}

export interface ItemSize {
  id: number;
  size: { id: number; name: string };
  stock: number;
}

export interface ItemColor {
  id: number;
  color: { id: number; name: string; hex_code?: string };
}

export interface Item {
  id: number;
  title: string;
  slug?: string;
  price: string;
  discount_price?: string;
  product_id?: string;
  brand_name?: string;
  number_of_items?: number;
  is_featured?: boolean;
  is_bestselling?: boolean;
  category: number | Category;
  type?: { id: number; name: string };
  label?: string;
  description: string;
  images: ItemImage[];
  item_size: ItemSize[];
  item_color: ItemColor[];
  created_at?: string;
  updated_at?: string;
}

export interface HeroSection {
  id: number;
  title: string;
  subtitle?: string;
  image: string;
  button_text?: string;
  button_link?: string;
}

export interface Slider {
  id: number;
  image: string;
  title?: string;
  url?: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
}

export interface NewArrivalBannerImage {
  id: number;
  image_name: string;
  image?: string | null;
  image_url?: string | null;
  final_image_url?: string | null;
  link_url?: string;
  order?: number;
  is_active?: boolean;
}

export interface NewArrivalBanner {
  id?: number;
  title: string;
  subtitle?: string;
  discount_percent?: string;
  discount_text?: string;
  is_active?: boolean;
  images: NewArrivalBannerImage[];
}

