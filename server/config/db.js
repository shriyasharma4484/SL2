import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Shriya@26',
  database: process.env.DB_NAME || 'sevadeep_civicconnect',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  decimalNumbers: true
};

export const pool = mysql.createPool(dbConfig);

// Helper query function with connection test
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`[Database] Successfully connected to MySQL database: ${dbConfig.database} on ${dbConfig.host}:${dbConfig.port}`);
    connection.release();
    return true;
  } catch (error) {
    console.error(`[Database Error] Failed connecting to MySQL (${dbConfig.database}):`, error.message);
    return false;
  }
}

export default pool;
