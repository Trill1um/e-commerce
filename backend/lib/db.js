import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',     // 'mysql' if backend also in Docker
  user: 'mern_user',
  password: 'mern_password',
  database: 'mern_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;