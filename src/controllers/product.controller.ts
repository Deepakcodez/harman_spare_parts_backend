import { Request, Response } from 'express';
import Product, { ProdDocument } from '../model/product.model';

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
