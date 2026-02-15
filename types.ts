
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: 'STEM' | 'Humanities' | 'Business' | 'Tech' | 'Other';
  thumbnail: string;
  fileSize: string;
  pages: number;
  rating: number;
  salesCount: number;
  discountLabel?: string;
  isFeatured?: boolean;
  priceHistory?: number[];
}

export interface Review {
  id: string;
  productId: string;
  rating: number;
  comment: string;
  date: string;
  userName: string;
}

export enum PaymentStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface PurchaseRecord {
  productId: string;
  productTitle: string;
  thumbnail: string;
  purchaseDate: string;
  orderId: string;
  price: number;
  fileSize: string;
  paymentMethod?: string;
}
