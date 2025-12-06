import pool from '../lib/db.js';

class Rating {
  
  // Create or update a rating
  static async findOneAndUpdate(filter, update, options = {}) {
    const { productId, userId } = filter;
    const { rating } = update.$set || {};
    
    const connection = await pool.getConnection();
    
    try {
      // Check if rating exists
      const [existing] = await connection.execute(
        'SELECT * FROM ratings WHERE product_id = ? AND user_id = ?',
        [productId, userId]
      );
      
      let result;
      
      if (existing.length > 0) {
        // Update existing rating
        await connection.execute(
          'UPDATE ratings SET score = ? WHERE product_id = ? AND user_id = ?',
          [rating, productId, userId]
        );
        
        result = {
          lastErrorObject: { updatedExisting: true },
          value: { rating: existing[0].score, product_id: productId, user_id: userId }
        };
      } else {
        // Insert new rating
        await connection.execute(
          'INSERT INTO ratings (product_id, user_id, score) VALUES (?, ?, ?)',
          [productId, userId, rating]
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
    
    let query = 'SELECT id, product_id as productId, user_id as userId, score as rating FROM ratings WHERE 1=1';
    const params = [];
    
    if (productId !== undefined) {
      query += ' AND product_id = ?';
      params.push(productId);
    }
    
    if (userId !== undefined) {
      query += ' AND user_id = ?';
      params.push(userId);
    }
    
    const [rows] = await pool.execute(query, params);
    return rows;
  }
  
  // Delete a rating
  static async findOneAndDelete(filter) {
    const { productId, userId } = filter;
    
    const [result] = await pool.execute(
      'DELETE FROM ratings WHERE product_id = ? AND user_id = ?',
      [productId, userId]
    );
    
    return result.affectedRows > 0 ? { productId, userId } : null;
  }
}

export default Rating;
