import mysql from "mysql2/promise";

const isLocalhost =
  process.env.DB_HOST === "localhost" || process.env.DB_HOST === "127.0.0.1";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: Number(process.env.DB_PORT),
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  ...(isLocalhost
    ? {} // tanpa SSL
    : {
        ssl: {
          minVersion: "TLSv1.2",
          rejectUnauthorized: false,
        },
      }),
});

export default pool;
