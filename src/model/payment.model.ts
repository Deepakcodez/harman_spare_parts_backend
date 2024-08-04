import mongoose, { Document, Model } from "mongoose";

// Interface for the payment document
export interface paymentDocument extends Document {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  createdAt: Date;
}

const paymentSchema = new mongoose.Schema<paymentDocument>({
  razorpay_order_id: {
    type: String,
    required: true,
  },
  razorpay_payment_id: {
    type: String,
    required: true,
  },
  razorpay_signature: {
    type: String,
    required: true,
  },
 

  createdAt: { type: Date, default: Date.now },
});

const Payment: Model<paymentDocument> = mongoose.model<paymentDocument>(
  "Payment",
  paymentSchema
);

export default Payment;
