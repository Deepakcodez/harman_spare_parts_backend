import mongoose, { Document, Model } from 'mongoose';

// Interface for shipping information
interface ShippingInfo {
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: number;
  phoneNo: number;
}

// Interface for order items
interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image: string;
  product: mongoose.Types.ObjectId;
}

// Interface for payment information
// interface PaymentInfo {
//   id: string; 
//   status: string;
//   razorpay_order_id?: string; 
//   razorpay_payment_id? : string;
//   razorpay_signature? : string
// }

// Interface for the order document
export interface OrderDocument extends Document {
  shippingInfo: ShippingInfo;
  orderItems: OrderItem[];
  user: mongoose.Types.ObjectId;
  // paymentInfo: PaymentInfo;
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
  shippingInfo: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true, default: "India" },
    pinCode: { type: Number, required: true },
    phoneNo: { type: Number, required: true }
  },
  orderItems: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }
  }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // paymentInfo: {
  //   id: { type: String, required: true },
  //   status: { type: String, required: true },
  //   razorpay_order_id: { type: String } ,
  //   razorpay_payment_id: {type: String,},
  //   razorpay_signature: {type: String,},
  // },
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
