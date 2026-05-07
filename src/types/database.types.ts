export type Service = {
  id: number;
  name: string;
  markup_price: number;
  description: string;
  is_active: boolean;
};

export type Order = {
  id: string;
  user_id: string;
  service_id: number;
  link: string;
  status: string;
  created_at: string;
};