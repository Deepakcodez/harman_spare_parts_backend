import { Request, Response, NextFunction } from "express";
import asyncHandler from "../middleware/asyncHandler";
import { ErrorHandler } from "../utils/errorHandler";
import ShippingInfo, { ShippingInfoDocument } from '../model/shippingInfo.model'




// //shipping address
export const shippingAddress = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { address, city, state, country, pinCode, phoneNo} = req.body;
      const userId = req.user?.id;
  
      const shippingDetail: ShippingInfoDocument ={
          address,
          city,
          state,
          country,
          pinCode,
          phoneNo,
          user : userId
      }
      try {
        
         if(! address || !city || !state || !country || !pinCode || !phoneNo){
            return next(new ErrorHandler("Provide all details", 404));
         }
  
         const shipping = await  ShippingInfo.findOne({user : userId} )
  
         if (shipping) {
          // Update existing shipping address
          shipping.address = address;
          shipping.city = city;
          shipping.state = state;
          shipping.country = country;
          shipping.pinCode = pinCode;
          shipping.phoneNo = phoneNo;
          await shipping.save();
        } else {
          // Create new shipping address
          await ShippingInfo.create(shippingDetail);
        }
  
        res.status(200).json({
          success: true,
          message: shipping ? "Shipping address updated successfully" : "Shipping address created successfully",
        });
  
      } catch (error) {
        console.error("Error in saving shipping info:", error);
        res.status(500).json({
          success: false,
          message: "Unable to save shipping info. Please try again.",
        });
      }
  
       
    }
  );


  //get shipping address
  export const getShippingAddress = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const userId = req.user?.id;
     
      if(!userId) {
        return next(new ErrorHandler("UnAuthorised user", 400));
      }
     
      try {
         const shippingDetails = await  ShippingInfo.findOne({user : userId} )
  
        if(!shippingDetails) return next(new ErrorHandler("No details provided", 400)); 
  
        res.status(200).json({
          success: true,
          shippingDetails
        });
  
      } catch (error) {
        console.error("Error in finding shipping info:", error);
        res.status(500).json({
          success: false,
          message: "Unable to finding shipping info. Please try again.",
        });
      }
  
       
    }
  );
  