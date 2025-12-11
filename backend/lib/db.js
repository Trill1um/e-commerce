import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Parse DATABASE_URL if provided (Railway/PlanetScale format)
const getDatabaseConfig = () => {
    if (process.env.DATABASE_URL) {
        try {
            const url = new URL(process.env.DATABASE_URL);
            return {
                host: url.hostname,
                port: parseInt(url.port) || 3306,
                user: url.username,
                password: url.password,
                database: url.pathname.slice(1), // Remove leading /
            };
        } catch (error) {
            console.error('Error parsing DATABASE_URL:', error);
        }
    }
    
    // Fallback to individual environment variables
    return {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'mern_db',
        port: parseInt(process.env.DB_PORT) || 3306,
    };
};

// Create connection pool
let pool = mysql.createPool({
    ...getDatabaseConfig(),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Intercept queries for logging
const originalExecute = pool.execute.bind(pool);
pool.execute = async function(sql, params) {
    const startTime = Date.now();
    
    // Replace ? placeholders with actual values for logging
    let logQuery = sql;
    if (params && params.length > 0) {
        let paramIndex = 0;
        logQuery = sql.replace(/\?/g, () => {
            const value = params[paramIndex++];
            if (value === null) return 'NULL';
            if (typeof value === 'string') return `'${value}'`;
            if (typeof value === 'boolean') return value ? '1' : '0';
            return value;
        });
    }
    
    console.log('\n📊 QUERY:', logQuery);
    
    try {
        const result = await originalExecute(sql, params);
        const duration = Date.now() - startTime;
        console.log(`   ✅ SUCCESS (${duration}ms) - Rows: ${result[0]?.length || result[0]?.affectedRows || 0}`);
        return result;
    } catch (error) {
        const duration = Date.now() - startTime;
        console.log(`   ❌ ERROR (${duration}ms):`, error.message);
        throw error;
    }
};

function createNewPool(port) {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mern_db',
    port: port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  return pool;
}

// Test connection on startup
async function testConnection() {
    try {
        const connection = await getPool().getConnection();
        console.log('Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('Database connection failed:', error.message);
        return false;
    }
}

function getPool() {
    return pool;
}

export default pool;
export { testConnection, createNewPool, getPool };