import mongoose, { Schema, Document, Model } from "mongoose";

interface Image {
  public_id: string;
  url: string;
}

interface Review {
  name: string;
  rating: number;
  comment: string;
}

interface ProdDocument extends Document {
  name: string;
  description: string;
  price: number;
  rating: number;
  images: Image[];
  category: string;
  stock: number;
  numberOfReviews: number;
  reviews: Review[];
}

const productSchema = new Schema<ProdDocument>(
  {
    name: {
      type: String,
      minlength: 2,
      required: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    price: {
      type: Number,
      required: [true, "please enter product price"],
    },
    rating: {
      type: Number,
      default: 0,
    },
    images: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    category: {
      type: String,
      required: [true, "enter product category"],
    },
    stock: {
      type: Number,
      required: [true, "enter product stock"],
      default: 1,
    },
    numberOfReviews: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        name: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const Product: Model<ProdDocument> = mongoose.model<ProdDocument>("Product", productSchema);

export default Product;
