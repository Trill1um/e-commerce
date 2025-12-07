import bcrypt from 'bcryptjs';
import pool from '../lib/db.js';

class User {
  
  // Validate seller-specific fields
  static validateSellerFields(data) {
    if (data.role === 'seller') {
      if (!data.colonyName || data.colonyName.trim().length < 2 || data.colonyName.trim().length > 50) {
        throw new Error('Colony name is required for sellers (2-50 characters)');
      }
    }
  }
  
  // Create user with hashed password
  static async create({ colonyName, email, password, role = 'buyer' }) {
    // Validate
    this.validateSellerFields({ colonyName, role });
    
    if (!email.match(/.+\@.+\..+/)) {
      throw new Error('Invalid email format');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    
    // Hash password (skip if already hashed)
    let hashedPassword = password;
    if (!password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }
    
    const [result] = await pool.execute(
      'INSERT INTO users (colony_name, email, password, role) VALUES (?, ?, ?, ?)',
      [colonyName || null, email.trim(), hashedPassword, role || null]
    );
    
    return result.insertId;
  }
  
  // Find by email
  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }
  
  // Find by ID
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findByIdNoPassword(id) {
    const [rows] = await pool.execute(
      'SELECT id, colony_name, email, role, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }
  
  // Find all users
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM users WHERE 1=1';
    const params = [];
    
    if (filters.role) {
      query += ' AND role = ?';
      params.push(filters.role);
    }
    
    const [rows] = await pool.execute(query, params);
    return rows;
  }
  
  // Compare password
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
  
  // Update user
  static async update(id, data) {
    // Get current user for validation
    const currentUser = await this.findById(id);
    if (!currentUser) {
      throw new Error('User not found');
    }
    
    // Validate if changing role to seller
    if (data.role === 'seller') {
      this.validateSellerFields({
        colonyName: data.colonyName || currentUser.colony_name,
        role: 'seller'
      });
    }
    
    // Hash password if provided and not already hashed
    if (data.password && !data.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }
    
    // Build update query
    const updates = [];
    const values = [];
    
    if (data.colonyName !== undefined) {
      updates.push('colony_name = ?');
      values.push(data.colonyName);
    }
    if (data.email !== undefined) {
      updates.push('email = ?');
      values.push(data.email.trim());
    }
    if (data.password !== undefined) {
      updates.push('password = ?');
      values.push(data.password);
    }
    if (data.role !== undefined) {
      updates.push('role = ?');
      values.push(data.role);
    }
    if (data.code !== undefined) {
      updates.push('code = ?');
      values.push(data.code);
    }
    
    if (updates.length === 0) {
      return;
    }
    
    values.push(id);
    
    await pool.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  }
  
  // Delete user
  static async delete(id) {
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
  }
}

export default User;