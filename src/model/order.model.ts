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
  status: "Pending" | "Success";
  razorpay_order_id?: string; 
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
  orderStatus: string;
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
  paymentInfo:{
    status : {type : String, required : true, default : "Pending"},
    razorpay_order_id :  {type : String, required : true, }
  },
  paidAt: { type: Date, required: true },
  itemsPrice: { type: Number, required: true, default: 0 },
  taxPrice: { type: Number, required: true, default: 0 },
  shippingPrice: { type: Number, required: true, default: 0 },
  totalPrice: { type: Number, required: true, default: 0 },
  orderStatus: { type: String, required: true, default: 'Processing' },
  deliveredAt: Date,
  createdAt: { type: Date, default: Date.now }
});

const Order: Model<OrderDocument> = mongoose.model<OrderDocument>("Order", orderSchema);

export default Order;
