import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initDatabase() {
    let connection;
    
    try {
        console.log('Connecting to MySQL...');
        
        // Connect without database first
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306,
            multipleStatements: true
        });
        
        console.log('✓ Connected to MySQL');
        
        // Check if database exists and drop it
        console.log('Checking for existing database...');
        const [databases] = await connection.query(
            "SHOW DATABASES LIKE '%mern_db%'"
        );
        
        if (databases.length > 0) {
            console.log('✓ Found existing mern_db, dropping...');
            await connection.query('DROP DATABASE mern_db');
            console.log('✓ Database dropped');
        } else {
            console.log('ℹ No existing database found');
        }
        
        // Load schema
        const schemaPath = join(__dirname, '../', 'schema.sql');
        const schema = await fs.readFile(schemaPath, 'utf8');
        await connection.query(schema);
        console.log('✓ Schema created');
        
        // Load seed data (optional)
        try {
            const seedPath = join(__dirname, '../', 'sample.sql');
            const seed = await fs.readFile(seedPath, 'utf8');
            await connection.query(seed);
            console.log('✓ Seed data inserted');
        } catch (error) {
            console.log('ℹ No seed data found (optional)');
        }
        
        // Verify tables
        const [tables] = await connection.query('SHOW TABLES');
        console.log(`✓ Created ${tables.length} table(s)`);
        
        console.log('\n✅ Database initialization complete!\n');
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

initDatabase();