export type Duration = string;

export interface RoomPricingTier {
  duration: Duration;
  per_person_rates: Record<number, number>;
}

export interface Room {
  id: string;
  name: string;
  image: string;
  description: string;
  min_group: number;
  max_group: number;
  pricing: RoomPricingTier[];
}

export type BookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  room_name: string;
  guest_count: number;
  duration: Duration;
  date: string;
  time: string;
  per_person_price: number;
  total_price: number;
  voucher_code: string;
  discount_amount: number;
  final_price: number;
  status: BookingStatus;
  notes: string;
  created_at: string;
}

export interface BookingForm {
  name: string;
  email: string;
  phone: string;
  room_id: string;
  guest_count: number;
  duration: Duration;
  date: string;
  time: string;
  voucher_code: string;
  applied_discount: number;
  notes: string;
}

export type ContactStatus = 'New' | 'Read' | 'Archived';

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: ContactStatus;
  created_at: string;
}

export type VoucherType = 'percentage' | 'fixed';

export interface Voucher {
  id: string;
  code: string;
  type: VoucherType;
  value: number;
  min_purchase: number;
  max_uses: number;
  used_count: number;
  expires_at: string;
  active: boolean;
  description: string;
  created_at: string;
}

export type PaymentStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Refunded' | 'Failed';

export interface Payment {
  id: string;
  booking_id: string;
  booking?: Booking;
  amount: number;
  receipt_url: string;
  status: PaymentStatus;
  notes: string;
  paid_at: string;
  confirmed_at: string;
  created_at: string;
}

export interface BankAccount {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  qr_code_url: string;
  is_active: boolean;
}

export interface BusinessSettings {
  business_name: string;
  tagline: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  response_time: string;
  admin_password: string;
}
