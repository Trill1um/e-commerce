import { getPool } from '../lib/db.js';
import Product from './Products.js';

class Rating {
  
  // Create or update a rating
  static async findOneAndUpdate(filter, update, options = {}) {
    const { productId, userId } = filter;
    const { rating } = update.$set || {};
    
    // Parse synthetic ID to get composite key
    const { sellerId, code } = Product.parseSyntheticId(productId);
    
    const connection = await getPool().getConnection();
    
    try {
      // Check if rating exists
      const [existing] = await connection.execute(
        'SELECT * FROM RATING WHERE code = ? AND seller_id = ? AND user_id = ?',
        [code, sellerId, userId]
      );
      
      let result;
      
      if (existing.length > 0) {
        // Update existing rating
        await connection.execute(
          'UPDATE RATING SET score = ? WHERE code = ? AND seller_id = ? AND user_id = ?',
          [rating, code, sellerId, userId]
        );
        
        result = {
          lastErrorObject: { updatedExisting: true },
          value: { rating: existing[0].score, seller_id: sellerId, code: code, user_id: userId }
        };
      } else {
        // Insert new rating
        await connection.execute(
          'INSERT INTO RATING (code, seller_id, user_id, score) VALUES (?, ?, ?, ?)',
          [code, sellerId, userId, rating]
        );
        
        result = {
          lastErrorObject: { updatedExisting: false },
          value: null
        };
      }
      
      return result;
      
    } finally {
      connection.release();
    }
  }
  
  // Find all ratings for a product
  static async find(filter) {
    const { productId, userId } = filter;
    
    let query = 'SELECT seller_id, code, user_id as userId FROM RATING WHERE 1=1';
    const params = [];
    
    if (productId !== undefined) {
      const { sellerId, code } = Product.parseSyntheticId(productId);
      query += ' AND code = ? AND seller_id = ?';
      params.push(code, sellerId);
    }
    
    if (userId !== undefined) {
      query += ' AND user_id = ?';
      params.push(userId);
    }
    
    const [rows] = await getPool().execute(query, params);
    
    // Add synthetic productId to each result
    return rows.map(row => ({
      ...row,
      productId: Product.createSyntheticId(row.seller_id, row.code)
    }));
  }
  
  // Delete a rating
  static async findOneAndDelete(filter) {
    const { productId, userId } = filter;
    const { sellerId, code } = Product.parseSyntheticId(productId);
    
    const [result] = await getPool().execute(
      'DELETE FROM RATING WHERE code = ? AND seller_id = ? AND user_id = ?',
      [code, sellerId, userId]
    );
    
    return result.affectedRows > 0 ? { productId, userId } : null;
  }
}

export default Rating;
