export interface Product {
  id: number;
  name: string;
  category: string;
  amount: number;
  section: number;
  rack: number;
  shelf: number;
  placement: number;
}

export interface ProductHistoryEntry {
  id: number;
  product_id: number;
  product_name: string;
  event_type: 'product_added' | 'product_updated' | 'stock_withdrawn' | 'product_deleted';
  changed_by: string;
  before_data: Product | null;
  after_data: Product | null;
  created_at: string;
}
