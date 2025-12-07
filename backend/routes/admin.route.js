import express from 'express';
import { 
  adminRoute,
  protectRoute 
} from '../middleware/auth.middleware.js';
import { getAllTables, getTable} from '../controllers/admin.controller.js';

//apil/products
const router = express.Router();

//Seller Access
router.get('/table', protectRoute, adminRoute, getAllTables); 
router.get('/table/:tableName', protectRoute, adminRoute, getTable);
export default router;