import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// Determine configuration: support direct connection URL (MYSQL_URL, DATABASE_URL)
// or individual connection parameters (DB_* or Railway/Render default MYSQL*)
const connectionUri = process.env.MYSQL_URL || process.env.DATABASE_URL;

const isCloudUri = connectionUri && (
  process.env.DB_SSL === 'true' ||
  connectionUri.includes('tidbcloud') ||
  connectionUri.includes('aivencloud') ||
  connectionUri.includes('clever-cloud') ||
  connectionUri.includes('railway') ||
  connectionUri.includes('ssl=')
);

const sslConfig = (isCloudUri || process.env.DB_SSL === 'true') ? { rejectUnauthorized: false } : undefined;

let pool;

if (connectionUri) {
  pool = mysql.createPool({
    uri: connectionUri,
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    decimalNumbers: true,
    ssl: sslConfig
  });
} else {
  const dbConfig = {
    host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
    port: parseInt(process.env.DB_PORT || process.env.MYSQLPORT || '3306', 10),
    user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
    password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : (process.env.MYSQLPASSWORD || 'Shriya@26'),
    database: process.env.DB_NAME || process.env.MYSQLDATABASE || 'sevadeep_civicconnect',
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    decimalNumbers: true,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  };

  pool = mysql.createPool(dbConfig);
}

export { pool };

// Helper query function with connection test
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('[Database] Successfully connected to MySQL database pool.');
    connection.release();
    return true;
  } catch (error) {
    console.error('[Database Error] Failed connecting to MySQL pool:', error.message);
    return false;
  }
}

export default pool;
