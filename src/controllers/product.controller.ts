import { Request, Response } from 'express';
import Product, { ProdDocument } from '../model/product.model';




//create product
//admin route
export const createProduct = async (req: Request, resp: Response): Promise<void> => {
  try {
    const productDetail: ProdDocument = req.body;

    // Validate the required fields
    if (!productDetail.name || !productDetail.description || !productDetail.price || !productDetail.category || !productDetail.stock) {
      resp.status(400).send({ error: 'Missing required fields' });
      return;
    }

   

    const product = await Product.create(productDetail);
    resp.status(201).send({ 
        product,
        message: "Product created successfully",
        success : true
     });
  } catch (error: any) {
    resp.status(500).send({ error: error.message });
  }
};




//get all product
export const getAllProducts = async (req: Request, resp: Response): Promise<void> => {
  try {
    const products = await Product.find();
    
    if (products.length === 0) {
      resp.status(404).send({ message: 'No products found' });
      return;
    }
    
    resp.status(200).send({ products });
  } catch (error: any) {
    resp.status(500).send({ error: error.message });
  }
};




// Update product function
export const updateProduct = async (req: Request, resp: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const productDetail = req.body;
  
      const product = await Product.findByIdAndUpdate(id, productDetail, { new: true, runValidators: true });
  
      if (!product) {
        resp.status(404).send({ message: 'Product not found' });
        return;
      }
  
      resp.status(200).send({ product });
    } catch (error: any) {
      resp.status(500).send({ error: error.message });
    }
  };