import mongoose, { Document, Model } from 'mongoose';

// Interface for shipping information
export interface ShippingInfoDocument {
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: number;
  phoneNo: number;
  user: mongoose.Types.ObjectId;
  deliveredAt?: Date;
  createdAt?: Date;
}

const shippinginfoSchema = new mongoose.Schema<ShippingInfoDocument>({
  
      address: 
      { type: String, required: true },
      city: 
      { type: String, required: true },
      state: 
      { type: String, required: true },
      country: 
      { type: String, required: true, default: "India" },
      pinCode: 
      { type: Number, required: true },
      phoneNo: 
      { type: Number, required: true },
      user: 
      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      deliveredAt: { type: Date,},
      createdAt: { type: Date, default: Date.now }
    })

    
const ShippingInfo: Model<ShippingInfoDocument> = mongoose.model<ShippingInfoDocument>("ShippingInfo", shippinginfoSchema);

export default ShippingInfo;