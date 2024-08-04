export interface IRazorpayOrderOptions {
    amount: number;
    currency: string;
    receipt: string;
    payment_capture?: number;
    notes?: Record<string, any>;
  }

  