import mongoose, { Document, Model } from "mongoose";

// Interface for the payment document
export interface PaymentDocument extends Document {
  order: mongoose.Types.ObjectId;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  createdAt: Date;
}

const paymentSchema = new mongoose.Schema<PaymentDocument>({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
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

const Payment: Model<PaymentDocument> = mongoose.model<PaymentDocument>(
  "Payment",
  paymentSchema
);

export default Payment;
