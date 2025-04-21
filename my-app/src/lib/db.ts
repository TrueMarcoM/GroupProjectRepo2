import mysql from "mysql2/promise";

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "user_registration",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Function to execute queries with parameterized statements (prevents SQL injection)
export async function executeQuery<T>({
  query,
  values,
}: {
  query: string;
  values?: any[];
}): Promise<T> {
  try {
    const [rows] = await pool.execute(query, values);
    return rows as T;
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Database operation failed");
  }
}

// Function to execute transactions
export async function executeTransaction<T>(
  queries: {
    query: string;
    values?: any[];
  }[]
): Promise<T[]> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const results = [];
    for (const { query, values } of queries) {
      const [result] = await connection.execute(query, values);
      results.push(result);
    }

    await connection.commit();
    return results as T[];
  } catch (error) {
    await connection.rollback();
    console.error("Transaction error:", error);
    throw new Error("Transaction failed");
  } finally {
    connection.release();
  }
}

// User-related database functions
export async function getUserByUsername(username: string) {
  const result = await executeQuery<any[]>({
    query: "SELECT * FROM user WHERE username = ?",
    values: [username],
  });
  return result[0];
}

export async function getUserByEmail(email: string) {
  const result = await executeQuery<any[]>({
    query: "SELECT * FROM user WHERE email = ?",
    values: [email],
  });
  return result[0];
}

export async function getUserByPhone(phone: string) {
  const result = await executeQuery<any[]>({
    query: "SELECT * FROM user WHERE phone = ?",
    values: [phone],
  });
  return result[0];
}

export async function createUser({
  username,
  password,
  firstName,
  lastName,
  email,
  phone,
}: {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}) {
  const result = await executeQuery({
    query: `
      INSERT INTO user (username, password, firstName, lastName, email, phone) 
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    values: [username, password, firstName, lastName, email, phone],
  });
  return result;
}
