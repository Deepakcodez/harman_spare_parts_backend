import { NextFunction, Request, Response } from "express";
import Product, { ProdDocument } from "../model/product.model";
import { ErrorHandler } from "../utils/errorHandler";

//create product
//admin route
export const createProduct = async (
  req: Request,
  resp: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const productDetail: ProdDocument = req.body;

    // Validate the required fields
    if (
      !productDetail.name ||
      !productDetail.description ||
      !productDetail.price ||
      !productDetail.category ||
      !productDetail.stock
    ) {
        return next(new ErrorHandler("missing required fields", 404))
       
    }

    const product = await Product.create(productDetail);
    resp.status(201).send({
      product,
      message: "Product created successfully",
      success: true,
    });
  } catch (error: any) {
    resp.status(500).send({ error: error.message });
  }
};

//get all product
export const getAllProducts = async (
  req: Request,
  resp: Response
): Promise<void> => {
  try {
    const products = await Product.find();

    if (products.length === 0) {
      resp.status(404).send({ message: "No products found" });
      return;
    }

    resp.status(200).send({ products });
  } catch (error: any) {
    resp.status(500).send({ error: error.message });
  }
};

//get single product
export const getProductById = async (
  req: Request,
  resp: Response,
  next : NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404))
    }

    resp.status(200).send({ product });
  } catch (error: any) {
    resp.status(500).send({ error: error.message });
  }
};

// Update product function
export const updateProduct = async (
  req: Request,
  resp: Response,
  next : NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const productDetail = req.body;

    const product = await Product.findByIdAndUpdate(id, productDetail, {
      new: true,
      runValidators: true,
    });

    if (!product) {
        return next(new ErrorHandler("Product not found", 404))

    }

    resp
      .status(200)
      .send({ product, message: "Product details updated", success: true });
  } catch (error: any) {
    resp.status(500).send({ error: error.message });
  }
};

//delete product api
export const deleteProduct = async (
  req: Request,
  resp: Response,
  next : NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404))

    }

    resp.status(200).send({
      product,
      message: "Product deleted successfully",
    });
  } catch (error: any) {
    resp.status(500).send({ error: error.message });
  }
};
