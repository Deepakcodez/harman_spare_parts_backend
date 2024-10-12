import mongoose, { Document, Model } from 'mongoose';



// Interface for order items
interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image: string;
  product: mongoose.Types.ObjectId;
}

// Interface for payment information
interface PaymentInfo {
  method: "Online-Payment" | "Cash-On-Delivery"; // New field to indicate payment method
  status: "Pending" | "Success" | "Failed"; // Add 'Failed' status for failed payments
  razorpay_order_id?: string; 
  razorpay_payment_id?: string;
  razorpay_signature?: string;
}
// Interface for the order document
export interface OrderDocument extends Document {
  shippingInfo:  mongoose.Types.ObjectId;
  orderItems: OrderItem[];
  user: mongoose.Types.ObjectId;
  paymentInfo: PaymentInfo;
  paidAt: Date;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  orderStatus: "Processing" | "Out-For-Delivery" | "Delivered" | "Returned";
  userMessage?: string;
  isCOD: boolean;
  deliveredAt?: Date;
  createdAt: Date;
}

const orderSchema = new mongoose.Schema<OrderDocument>({
  shippingInfo: { type: mongoose.Schema.Types.ObjectId, ref: 'ShippingInfo', required: true },
  orderItems: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }
  }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  paymentInfo: {
    method: { type: String, required: true }, // Razorpay or Cash-On-Delivery
    status: { type: String, required: true, default: "Pending" },
    razorpay_order_id: { type: String }, // Razorpay-specific field 
    razorpay_payment_id: { type: String }, // Razorpay-specific field
    razorpay_signature: { type: String },  // Razorpay-specific field
  },
  paidAt: { type: Date},
  itemsPrice: { type: Number, required: true, default: 0 },
  taxPrice: { type: Number, required: true, default: 0 },
  shippingPrice: { type: Number, required: true, default: 0 },
  totalPrice: { type: Number, required: true, default: 0 },
  orderStatus: { type: String, required: true, default: 'Processing' },
  userMessage : { type: String, required: false , default: "No Message"},
  isCOD: { type: Boolean, required: true, default: false },
  deliveredAt: Date,
  createdAt: { type: Date, default: Date.now }
});

const Order: Model<OrderDocument> = mongoose.model<OrderDocument>("Order", orderSchema);

export default Order;
