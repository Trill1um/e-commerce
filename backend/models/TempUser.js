import bcrypt from 'bcryptjs';
import pool from '../database.js';

class TempUser {
  static validateSellerFields(data) {
    if (data.role === 'seller') {
      if (!data.colonyName || data.colonyName.trim().length < 2 || data.colonyName.trim().length > 50) {
        throw new Error('Colony name is required for sellers (2-50 characters)');
      }
      if (!data.facebookLink || !data.facebookLink.trim()) {
        throw new Error('Facebook link is required for sellers');
      }
    }
  }
  
  // Create temp user
  static async create({ colonyName, email, password, facebookLink, role = 'buyer', code }) {
    this.validateSellerFields({ colonyName, facebookLink, role });
    
    if (!email.match(/.+\@.+\..+/)) {
      throw new Error('Invalid email format');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    
    // Hash password if not already hashed
    let hashedPassword = password;
    if (!password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }
    
    const [result] = await pool.execute(
      'INSERT INTO temp_users (colony_name, email, password, facebook_link, role, code) VALUES (?, ?, ?, ?, ?, ?)',
      [colonyName || null, email.trim(), hashedPassword, facebookLink || null, role, code || null]
    );
    
    return result.insertId;
  }
  
  // Find by email (only non-expired)
  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM temp_users WHERE email = ? AND expires_at > NOW()',
      [email]
    );
    return rows[0];
  }
  
  // Find by code
  static async findByCode(code) {
    const [rows] = await pool.execute(
      'SELECT * FROM temp_users WHERE code = ? AND expires_at > NOW()',
      [code]
    );
    return rows[0];
  }
  
  // Delete temp user
  static async delete(email) {
    await pool.execute('DELETE FROM temp_users WHERE email = ?', [email]);
  }
  
  // Clean up expired temp users
  static async cleanupExpired() {
    const [result] = await pool.execute('DELETE FROM temp_users WHERE expires_at < NOW()');
    return result.affectedRows;
  }
}

export default TempUser;