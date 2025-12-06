import express from 'express';
import { 
  sellerRoute,
  // buyerRoute,
  protectRoute 
} from '../middleware/auth.middleware.js';
import {getProduct, getAllProducts, getMyProducts, createMyProduct, updateMyProduct, deleteMyProduct, rateProduct, deleteRating } from '../controllers/product.controller.js';

//apil/products
const router = express.Router();

//Public Access
router.post('/', getAllProducts);
router.get('/:id', getProduct);

//Buyer Access
router.put('/rate/:id', protectRoute, rateProduct);
router.delete('/rate/:id', protectRoute, deleteRating);

//Seller Access
router.get('/my-products', protectRoute, sellerRoute, getMyProducts); 
router.post('/', protectRoute, sellerRoute, createMyProduct);
router.put('/:id', protectRoute, sellerRoute, updateMyProduct); 
router.delete('/:id', protectRoute, sellerRoute, deleteMyProduct); 

export default router;