export interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
}

export interface Collection {
  id: string;
  title: string;
  description: string;
  image: string;
  products?: Product[];
} 