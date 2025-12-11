import { getPool } from '../lib/db.js';

class Product {
  
  // Create synthetic ID from seller_id and code
  static createSyntheticId(sellerId, code) {
    return `${sellerId}-${code}`;
  }
  
  // Parse synthetic ID to get seller_id and code
  static parseSyntheticId(id) {
    const parts = id.split('-');
    return {
      sellerId: parseInt(parts[0]),
      code: parseInt(parts[1])
    };
  }
  
  // Validate product fields
  static validateFields(data) {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Product name is required');
    }
    if (!data.description || data.description.trim().length === 0) {
      throw new Error('Product description is required');
    }
    if (data.price === undefined || data.price === null) {
      throw new Error('Product price is required');
    }
    if (data.price < 0) {
      throw new Error('Price cannot be negative');
    }
    if (!data.category || data.category.trim().length === 0) {
      throw new Error('Product category is required');
    }
    // if (!data.images || data.images.length === 0) {
    //   throw new Error('At least one image URL is required');
    // }
  }
  
  // Create product with images and additional info
  static async create({ sellerId, name, description, price, category, isLimited = false, inStock = true, images, additionalInfo = [] }) {
    this.validateFields({ name, description, price, category, images });
    
    if (!sellerId) {
      throw new Error('Seller ID is required');
    }
    
    const connection = await getPool().getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Insert product
      const [result] = await connection.execute(
        'INSERT INTO PRODUCT (seller_id, name, description, price, category, is_limited, in_stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [sellerId, name.trim(), description.trim(), price, category.trim(), isLimited, inStock]
      );
      
      const code = result.insertId;
      
      // Insert images
      for (let i = 0; i < images.length; i++) {
        await connection.execute(
          'INSERT INTO IMAGE (image_index, code, seller_id, image_url) VALUES (?, ?, ?, ?)',
          [i, code, sellerId, images[i]]
        );
      }
      
      // Insert additional info if provided
      if (additionalInfo && additionalInfo.length > 0) {
        let idx=0;
        for (const info of additionalInfo) {
          await connection.execute(
            'INSERT INTO INFO (info_index, code, seller_id, title, description) VALUES (?, ?, ?, ?, ?)',
            [idx++, code, sellerId, info.title || '', info.description || '']
          );
        }
      }
      
      await connection.commit();
      return this.createSyntheticId(sellerId, code);
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Find by ID with images and additional info
  static async findById(id) {
    const { sellerId, code } = this.parseSyntheticId(id);
    
    const [products] = await getPool().execute(
      'SELECT * FROM PRODUCT WHERE seller_id = ? AND code = ?',
      [sellerId, code]
    );
    
    if (products.length === 0) {
      return null;
    }
    
    const product = products[0];
    product.id = this.createSyntheticId(product.seller_id, product.code);
    
    // Get images
    const [images] = await getPool().execute(
      'SELECT image_url FROM IMAGE WHERE code = ? AND seller_id = ? ORDER BY image_index',
      [code, sellerId]
    );
    product.images = images.map(img => img.image_url);
    
    // Get additional info
    const [additionalInfo] = await getPool().execute(
      'SELECT title, description FROM INFO WHERE code = ? AND seller_id = ? ORDER BY info_index',
      [code, sellerId]
    );
    product.additionalInfo = additionalInfo;
    
    return product;
  }
  
  // Find all products with filters
  static async findAll({filters, sortBy, isDescending} = {}) {
    let query = `
    SELECT 
    p.seller_id, 
    p.code,
    p.name as name, 
    p.description, 
    p.price as price, 
    p.category, 
    p.is_limited as isLimited, 
    p.in_stock as inStock, 
    p.created_at as createdAt, 
    p.updated_at, 
    u.colony_name as colonyName 
    FROM PRODUCT as p inner join USER as u on u.id=p.seller_id 
    WHERE 1=1
    `
    ;
    const params = [];
    if (filters) {
      // console.log("Filters in Product Model:", filters);
    }
    if (filters?.sellerId) {
      query += ' AND p.seller_id = ?';
      params.push(filters.sellerId);
      // console.log("Filtering by sellerId:", filters.sellerId);
    }
    if (filters?.category) {
      query += ' AND p.category = ?';
      params.push(filters.category);
    }
    
    if (filters?.isLimited !== undefined) {
      query += ' AND p.is_limited = ?';
      params.push(filters.isLimited=="true"?1:0);
    }
    
    if (filters?.inStock !== undefined) {
      query += ' AND p.in_stock = ?';
      params.push(filters.inStock=="true"?1:0);
    }
    
    if (filters?.searchTerm) {
      query += ' AND p.name LIKE ?';
      params.push(`%${filters.searchTerm}%`);
    }
    
    if (sortBy) {
      const order = isDescending=="true" ? 'DESC' : 'ASC';
      query += ` ORDER BY ${sortBy} ${order}`;
    }
    
    const [products] = await getPool().execute(query, params);
    const [ratings] = await getPool().execute('SELECT r.code, r.seller_id, ROUND(AVG(r.score),2) as rating, COUNT(*) as count FROM RATING as r GROUP BY r.code, r.seller_id;');
    
    // Convert ratings array to dictionary with composite key
    const ratingsMap = {};
    for (const rating of ratings) {
      const key = this.createSyntheticId(rating.seller_id, rating.code);
      ratingsMap[key] = {
        score: rating.rating,
        count: rating.count
      };
    }

    for (const product of products) {
      // Create synthetic ID
      product.id = this.createSyntheticId(product.seller_id, product.code);
      
      // Convert TINYINT to boolean
      product.isLimited = Boolean(product.isLimited);
      product.inStock = Boolean(product.inStock);
      
      // Attach rating info
      if (ratingsMap[product.id]) {
        product.rate_score = ratingsMap[product.id].score;
        product.rate_count = ratingsMap[product.id].count;
      }
    
      const [images] = await getPool().execute(
        'SELECT image_url FROM IMAGE WHERE code = ? AND seller_id = ? ORDER BY image_index',
        [product.code, product.seller_id]
      );
      product.images = images.map(img => img.image_url);
      
      const [additionalInfo] = await getPool().execute(
        'SELECT title, description FROM INFO WHERE code = ? AND seller_id = ? ORDER BY info_index',
        [product.code, product.seller_id]
      ); 
      product.additionalInfo = additionalInfo;
    }

    return products;
  }
  
  // Update product
  static async update(id, data) {
    const { sellerId, code } = this.parseSyntheticId(id);
    
    const currentProduct = await this.findById(id);
    if (!currentProduct) {
      throw new Error('Product not found');
    }
    
    const connection = await getPool().getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Build update query for main product table
      const updates = [];
      const values = [];
      
      if (data.name !== undefined) {
        updates.push('name = ?');
        values.push(data.name.trim());
      }
      if (data.description !== undefined) {
        updates.push('description = ?');
        values.push(data.description.trim());
      }
      if (data.price !== undefined) {
        if (data.price < 0) {
          throw new Error('Price cannot be negative');
        }
        updates.push('price = ?');
        values.push(data.price);
      }
      if (data.category !== undefined) {
        updates.push('category = ?');
        values.push(data.category.trim());
      }
      if (data.isLimited !== undefined) {
        updates.push('is_limited = ?');
        values.push(data.isLimited);
      }
      if (data.inStock !== undefined) {
        updates.push('in_stock = ?');
        values.push(data.inStock);
      }
      
      if (updates.length > 0) {
        values.push(code, sellerId);
        await connection.execute(
          `UPDATE PRODUCT SET ${updates.join(', ')} WHERE code = ? AND seller_id = ?`,
          values
        );
      }
      
      // Update images if provided
      if (data.images && Array.isArray(data.images)) {
        await connection.execute('DELETE FROM IMAGE WHERE code = ? AND seller_id = ?', [code, sellerId]);
        for (let i = 0; i < data.images.length; i++) {
          await connection.execute(
            'INSERT INTO IMAGE (image_index, code, seller_id, image_url) VALUES (?, ?, ?, ?)',
            [i, code, sellerId, data.images[i]]
          );
        }
      }
      
      // Update additional info if provided
      if (data.additionalInfo && Array.isArray(data.additionalInfo)) {
        await connection.execute('DELETE FROM INFO WHERE code = ? AND seller_id = ?', [code, sellerId]);
        let idx=0
        for (const info of data.additionalInfo) {
          await connection.execute(
            'INSERT INTO INFO (info_index, code, seller_id, title, description) VALUES (?, ?, ?, ?, ?)',
            [idx++, code, sellerId, info.title || '', info.description || '']
          );
        }
      }
      
      await connection.commit();
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  
  // Delete product (cascade handled by foreign keys and trigger)
  static async delete(id) {
    const { sellerId, code } = this.parseSyntheticId(id);
    await getPool().execute('DELETE FROM PRODUCT WHERE code = ? AND seller_id = ?', [code, sellerId]);
  }
}

export default Product;