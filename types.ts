
export interface UserProfile {
  id: string;
  email?: string;
}

export type AuthMode = 'login' | 'register';

export type OrderStatus = 'Pending' | 'Paid' | 'Purchased' | 'Shipped';

export interface Order {
  id: string;
  user_id: string;
  product_url: string;
  color: string;
  size: string;
  price_usd: number;
  price_dzd: number; // Product price only
  commission_dzd: number; // Platform fee
  total_price_dzd: number; // price_dzd + commission_dzd
  screenshot_url: string;
  payment_proof_url?: string;
  status: OrderStatus;
  created_at: string;
  user_email?: string;
  agreed_to_terms: boolean;
  wilaya: string;
  phone_number: string;
  postal_code: string;
  tracking_number?: string;
}
