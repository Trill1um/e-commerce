import pool from '../lib/db.js';

class Product {
  
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
    
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Insert product
      const [result] = await connection.execute(
        'INSERT INTO products (seller_id, name, description, price, category, is_limited, in_stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [sellerId, name.trim(), description.trim(), price, category.trim(), isLimited, inStock]
      );
      
      const productId = result.insertId;
      
      // Insert images
      for (let i = 0; i < images.length; i++) {
        await connection.execute(
          'INSERT INTO product_images (product_id, image_url) VALUES (?, ?)',
          [productId, images[i]]
        );
      }
      
      // Insert additional info if provided
      if (additionalInfo && additionalInfo.length > 0) {
        for (const info of additionalInfo) {
          await connection.execute(
            'INSERT INTO additional_info (product_id, title, description) VALUES (?, ?, ?)',
            [productId, info.title || '', info.description || '']
          );
        }
      }
      
      await connection.commit();
      return productId;
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Find by ID with images and additional info
  static async findById(id) {
    const [products] = await pool.execute(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );
    
    if (products.length === 0) {
      return null;
    }
    
    const product = products[0];
    
    // Get images
    const [images] = await pool.execute(
      'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY id',
      [id]
    );
    product.images = images.map(img => img.image_url);
    
    // Get additional info
    const [additionalInfo] = await pool.execute(
      'SELECT title, description FROM additional_info WHERE product_id = ?',
      [id]
    );
    product.additionalInfo = additionalInfo;
    
    return product;
  }
  
  // Find all products with filters
  static async findAll({filters, sortBy, isDescending} = {}) {
    let query = `
    SELECT 
    p.id, 
    p.seller_id, 
    p.name as name, 
    p.description, 
    p.price as price, 
    p.category, 
    p.is_limited as isLimited, 
    p.in_stock as inStock, 
    p.rate_score, 
    p.rate_count, 
    p.created_at as createdAt, 
    p.updated_at, 
    u.colony_name as colonyName 
    FROM products as p inner join users as u on u.id=p.seller_id 
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
    
    const [products] = await pool.execute(query, params);
    
    // Get images for each product
    for (const product of products) {
      // Convert TINYINT to boolean
      product.isLimited = Boolean(product.isLimited);
      product.inStock = Boolean(product.inStock);
      
      const [images] = await pool.execute(
        'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY id',
        [product.id]
      );
      product.images = images.map(img => img.image_url);
      
      const [additionalInfo] = await pool.execute(
        'SELECT title, description FROM additional_info WHERE product_id = ?',
        [product.id]
      );
      product.additionalInfo = additionalInfo;
    }

    // Get additional Info for each product
    for (const product of products) {
      const [additionalInfo] = await pool.execute(
        'SELECT title, description FROM additional_info WHERE product_id = ?',
        [product.id]
      );
      product.additionalInfo = additionalInfo;
    }
    return products;
  }
  
  // Update product
  static async update(id, data) {
    const currentProduct = await this.findById(id);
    if (!currentProduct) {
      throw new Error('Product not found');
    }
    
    const connection = await pool.getConnection();
    
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
      if (data.rate_score !== undefined) {
        updates.push('rate_score = ?');
        values.push(data.rate_score);
      }
      if (data.rate_count !== undefined) {
        updates.push('rate_count = ?');
        values.push(data.rate_count);
      }
      
      if (updates.length > 0) {
        values.push(id);
        await connection.execute(
          `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
          values
        );
      }
      
      // Update images if provided
      if (data.images && Array.isArray(data.images)) {
        await connection.execute('DELETE FROM product_images WHERE product_id = ?', [id]);
        for (let i = 0; i < data.images.length; i++) {
          await connection.execute(
            'INSERT INTO product_images (product_id, image_url) VALUES (?, ?)',
            [id, data.images[i]]
          );
        }
      }
      
      // Update additional info if provided
      if (data.additionalInfo && Array.isArray(data.additionalInfo)) {
        await connection.execute('DELETE FROM additional_info WHERE product_id = ?', [id]);
        for (const info of data.additionalInfo) {
          await connection.execute(
            'INSERT INTO additional_info (product_id, title, description) VALUES (?, ?, ?)',
            [id, info.title || '', info.description || '']
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
    await pool.execute('DELETE FROM products WHERE id = ?', [id]);
  }
  
  // Update rating
  static async updateRating(id) {
    try {
      const product = await this.findById(id);
      if (!product) {
        throw new Error('Product not found');
      }
      const [ratings] = await pool.execute(
        'SELECT score FROM ratings WHERE product_id = ?',
        [id]
      );
      if (ratings.length === 0) {
        returrn;
      }
      const totalScore = ratings.reduce((sum, r) => sum + r.score, 0);
      const newAverage = totalScore / ratings.length;
      await pool.execute(
        'UPDATE products SET rate_score = ?, rate_count = ? WHERE id = ?',
        [newAverage, ratings.length, id]
      );
    } catch (error) {
      throw error;
    }
  }
}

export default Product;