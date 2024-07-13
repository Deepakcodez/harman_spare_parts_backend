import mongoose, { Schema, Document, Model } from "mongoose";

interface Product {
  productId: mongoose.Types.ObjectId;
  prodQuantity: number;
}

interface CartProduct {
  product: Product;
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

const productSchema = new Schema<Product>(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    prodQuantity: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  { _id: false } // Disable the generation of `_id` for subdocuments
);

const cartProductSchema = new Schema<CartProduct>(
  {
    product: {
      type: productSchema,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { _id: false } // Disable the generation of `_id` for subdocuments
);

const cartSchema = new Schema<CartDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [cartProductSchema],
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

const Cart: Model<CartDocument> = mongoose.model<CartDocument>("Cart", cartSchema);

export default Cart;
