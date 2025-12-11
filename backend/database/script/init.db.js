import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Brute Force
let DB_HOST="mysql.railway.internal"
let DB_USER="root"
let DB_PASSWORD="JbmFjtYTLyuRUZIPVsyfemVFTQqFnIwX"
let DB_NAME="mern_db"
let DB_PORT="3306"
let DATABASE_URL="mysql://root:JbmFjtYTLyuRUZIPVsyfemVFTQqFnIwX@hopper.proxy.rlwy.net:26852/mern_db"
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse DATABASE_URL or use individual variables
function getDatabaseConfig() {
    const connectionString = process.env.DATABASE_URL || DATABASE_URL;
    
    if (connectionString) {
        const url = new URL(connectionString);
        return {
            host: url.hostname,
            port: parseInt(url.port) || 3306,
            user: url.username,
            password: url.password,
            database: url.pathname.slice(1), // Remove leading '/'
        };
    }
    
    // Fallback to individual environment variables
    return {
        host: process.env.DB_HOST || DB_HOST,
        user: process.env.DB_USER || DB_USER,
        password: process.env.DB_PASSWORD || DB_PASSWORD,
        port: parseInt(process.env.DB_PORT) || parseInt(DB_PORT),
        database: process.env.DB_NAME || DB_NAME
    };
}

async function initDatabase() {
    let connection;
    
    try {
        console.log('Connecting to Railway MySQL via proxy...');
        
        const config = getDatabaseConfig();
        console.log(`Host: ${config.host}:${config.port}`);
        const dbName = config.database;
        
        // Connect without database first (to create it)
        connection = await mysql.createConnection({
            host: config.host,
            user: config.user,
            password: config.password,
            port: config.port,
            multipleStatements: true
        });

        console.log(`Connected to MySQL at ${config.host}:${config.port}`);
        
        // Check if database exists and drop it
        console.log(`Checking for existing database: ${dbName}...`);
        const [databases] = await connection.query(
            `SHOW DATABASES LIKE '${dbName}'`
        );
        
        if (databases.length > 0) {
            console.log(`Found existing ${dbName}, dropping...`);
            await connection.query(`DROP DATABASE ${dbName}`);
            console.log('Database dropped');
        } else {
            console.log('ℹ No existing database found');
        }
        
        // Create database
        console.log(`Initializing database: ${dbName}...`);
        
        // Load schema
        const schemaPath = join(__dirname, '..', 'schema.sql');
        const schema = await fs.readFile(schemaPath, 'utf8');
        
        await connection.query(schema);
        console.log('Schema created');
        
        try {
            const seedPath = join(__dirname, '..', 'sample.sql');
            const seed = await fs.readFile(seedPath, 'utf8');
            
            await connection.query(seed);
            console.log('Seed data inserted');
        } catch (error) {
            console.log('⚠️ No seed data found', error);
        }
        
        // Verify tables
        const [tables] = await connection.query('SHOW TABLES');
        console.log(`\n✅ Created ${tables.length} table(s):`);
        tables.forEach(table => {
            console.log(`   - ${Object.values(table)[0]}`);
        });
        
        console.log('\n✅ Database initialization complete!\n');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

initDatabase();