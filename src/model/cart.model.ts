import mongoose, { Schema, Document, Model } from "mongoose";

interface CartProduct {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
 
}

export interface CartDocument extends Document {
  userId: mongoose.Types.ObjectId;
  products: CartProduct[];
  totalPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const cartProductSchema = new Schema<CartProduct>(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 1
    },
    price: {
      type: Number,
      required: true
    },
   
  },
  { _id: false } // Disable the generation of `_id` for subdocuments
);

const cartSchema = new Schema<CartDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      
    },
    products: [cartProductSchema],
    totalPrice: {
      type: Number,
      required: true,
      default: 0
    }
  },
  { timestamps: true }
);

const Cart: Model<CartDocument> = mongoose.model<CartDocument>(
  "Cart",
  cartSchema
);

export default Cart;
