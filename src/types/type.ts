export interface IRazorpayOrderOptions {
    amount: number;
    currency: string;
    receipt: string;
    payment_capture?: number;
    notes?: Record<string, any>;
  }

  export interface cloudinaryResponseTypes{
     secure_url: string ;
     public_id : string ;
  }