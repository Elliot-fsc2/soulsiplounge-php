export interface PrintInvoiceItem {
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
}

export interface PrintInvoiceData {
  invoice_number: string;
  created_at: string;
  staff_name: string;
  room_name: string | null;
  guest_count: number | null;
  subtotal: number;
  total: number;
  amount_tendered: number | null;
  change: number | null;
  payment_method: string | null;
  items: PrintInvoiceItem[];
}

export interface PrintData {
  invoice: PrintInvoiceData;
  print_kitchen_chit: boolean;
}

export interface KitchenChitItem {
  product_name: string;
  quantity: number;
}

export interface KitchenChitData {
  order_number: string;
  created_at: string;
  room_name: string | null;
  items: KitchenChitItem[];
}
