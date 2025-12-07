import { getPool } from '../lib/db.js';

// Get all data from a specific table
export const getTable = async (req, res) => {
  try {
    const { tableName } = req.params;
    
    // Whitelist allowed tables for security
    const allowedTables = ['users', 'products', 'product_images', 'additional_info', 'ratings'];
    
    if (!allowedTables.includes(tableName)) {
      return res.status(400).json({ message: 'Invalid table name' });
    }
    
    // Get table data
    const [rows] = await getPool().execute(`SELECT * FROM ${tableName}`);
    
    // Get table structure
    const [columns] = await getPool().execute(`DESCRIBE ${tableName}`);
    
    res.json({ 
      data: rows, 
      columns: columns.map(col => ({
        name: col.Field,
        type: col.Type,
        key: col.Key
      }))
    });
  } catch (error) {
    console.error('Admin table fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch table data' });
  }
};

// Get list of all tables
export const getAllTables = async (req, res) => {
  try {
    const [tables] = await getPool().execute('SHOW TABLES');
    const tableNames = tables.map(obj => Object.values(obj)[0]);
    res.json({ tables: tableNames });
  } catch (error) {
    console.error('Admin tables list error:', error);
    res.status(500).json({ message: 'Failed to fetch tables list' });
  }
};