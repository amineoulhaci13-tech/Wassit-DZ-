
export type AuthMode = 'login' | 'register';
export type OrderStatus = 'Pending' | 'Paid' | 'Purchased' | 'Shipped';

export interface Order {
  id: string;
  user_id: string;
  user_email?: string;
  product_url: string;
  color: string;
  size: string;
  price_usd: number;
  price_dzd: number;
  commission_dzd: number;
  total_price_dzd: number;
  screenshot_url: string;
  payment_proof_url?: string;
  status: OrderStatus;
  wilaya: string;
  phone_number: string;
  postal_code: string;
  tracking_number?: string;
  created_at: string;
  agreed_to_terms: boolean;
}
